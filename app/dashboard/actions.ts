"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearAdminCookie, isAdminLoggedIn, setAdminCookie } from "@/lib/adminAuth";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { createYalidineParcel } from "@/lib/yalidine";

const statusOptions = ["new", "confirmed", "shipped", "cancelled"];

export const loginAdmin = async (formData: FormData) => {
  const password = String(formData.get("password") || "").trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "";

  if (!adminPassword || password !== adminPassword) {
    redirect("/dashboard?error=1");
  }

  await setAdminCookie();
  redirect("/dashboard");
};

export const logoutAdmin = async () => {
  await clearAdminCookie();
  redirect("/dashboard");
};

export const updateOrderStatus = async (formData: FormData) => {
  if (!(await isAdminLoggedIn())) {
    redirect("/dashboard?error=1");
  }

  const orderId = String(formData.get("orderId") || "");
  const status = String(formData.get("status") || "");

  if (!orderId || !statusOptions.includes(status)) {
    redirect("/dashboard");
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    redirect("/dashboard?error=1");
  }

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    redirect("/dashboard?error=1");
  }

  // If confirming, try to create a Yalidine parcel once (idempotent).
  if (status === "confirmed") {
    try {
      const { data: order } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (order && !order.yalidine_parcel_id && !order.yalidine_tracking) {
        const wilayaId = Number(order.wilaya_id);
        const communeId = Number(order.commune_id);
        const address = String(order.address || "").trim();

        if (
          Number.isFinite(wilayaId) &&
          wilayaId > 0 &&
          Number.isFinite(communeId) &&
          communeId > 0 &&
          address
        ) {
          const codAmount = Number(order.total_price ?? order.price);
          try {
            const result = await createYalidineParcel({
              orderId,
              fullName: String(order.full_name || ""),
              phone: String(order.phone || ""),
              wilayaId,
              communeId,
              address,
              deliveryType: order.delivery_type === "stop" ? "stop" : "home",
              stopdeskId:
                Number.isFinite(Number(order.stopdesk_id)) && Number(order.stopdesk_id) > 0
                  ? Number(order.stopdesk_id)
                  : undefined,
              productName: "روبة تونسية",
              codAmount: Number.isFinite(codAmount) ? codAmount : 0,
              notes: `Color: ${order.color || ""}`
            });

            try {
              await supabase
                .from("orders")
                .update({
                  yalidine_parcel_id: result.parcelId,
                  yalidine_tracking: result.tracking ?? null,
                  yalidine_last_error: null,
                  yalidine_created_at: new Date().toISOString()
                })
                .eq("id", orderId);
            } catch {
              // Ignore if columns do not exist yet.
            }
          } catch (err: any) {
            try {
              await supabase
                .from("orders")
                .update({
                  yalidine_last_error: String(err?.message || "Yalidine create parcel failed")
                })
                .eq("id", orderId);
            } catch {
              // Ignore if columns do not exist yet.
            }
          }
        } else {
          try {
            await supabase
              .from("orders")
              .update({
                yalidine_last_error:
                  "Missing wilaya_id/commune_id/address for Yalidine."
              })
              .eq("id", orderId);
          } catch {
            // Ignore if columns do not exist yet.
          }
        }
      }
    } catch (e) {
      console.error("Yalidine confirm hook failed", e);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${orderId}`);
  redirect("/dashboard");
};
