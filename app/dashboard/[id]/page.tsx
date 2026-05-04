import Link from "next/link";
import { isAdminLoggedIn } from "@/lib/adminAuth";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { updateOrderStatus, logoutAdmin } from "../actions";

const statusLabels: Record<string, string> = {
  new: "جديد",
  confirmed: "مؤكد",
  shipped: "تم الشحن",
  cancelled: "ملغي"
};

const statusOptions = ["new", "confirmed", "shipped", "cancelled"];

export default async function OrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isAdmin = await isAdminLoggedIn();
  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-hero-glow">
        <div className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-12">
          <div className="w-full rounded-[32px] bg-white p-8 text-center shadow-lift">
            <p className="text-sm text-mocha/70">الرجاء تسجيل الدخول أولا.</p>
            <Link
              href="/dashboard"
              className="mt-4 inline-flex rounded-2xl bg-mocha px-4 py-2 text-sm text-white"
            >
              رجوع
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const supabase = getSupabaseServerClient();
  const { data: order } = supabase
    ? await supabase
        .from("orders")
        .select("id, full_name, phone, wilaya, baladiya, delivery_type, color, price, status, created_at")
        .eq("id", id)
        .single()
    : { data: null };

  if (!order) {
    return (
      <main className="min-h-screen bg-hero-glow">
        <div className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-12">
          <div className="w-full rounded-[32px] bg-white p-8 text-center shadow-lift">
            <p className="text-sm text-mocha/70">الطلب غير موجود.</p>
            <Link
              href="/dashboard"
              className="mt-4 inline-flex rounded-2xl bg-mocha px-4 py-2 text-sm text-white"
            >
              رجوع
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-hero-glow">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/dashboard" className="text-sm text-mocha/70">
            رجوع إلى الطلبات
          </Link>
          <form action={logoutAdmin}>
            <button className="rounded-2xl border border-dune px-4 py-2 text-sm text-mocha transition hover:bg-sand">
              تسجيل الخروج
            </button>
          </form>
        </div>

        <div className="mt-6 rounded-[32px] bg-white p-8 shadow-lift">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-cocoa">{order.full_name}</h1>
              <p className="text-sm text-mocha/70">{order.phone}</p>
            </div>
            <span className="rounded-full bg-blush px-3 py-1 text-xs text-cocoa">
              {statusLabels[order.status] || "غير معروف"}
            </span>
          </div>

          <div className="mt-6 grid gap-4 text-sm text-mocha/80 sm:grid-cols-2">
            <div>الولاية: {order.wilaya}</div>
            <div>البلدية: {order.baladiya}</div>
            <div>نوع التوصيل: {order.delivery_type}</div>
            <div>اللون: {order.color}</div>
            <div>السعر: {order.price} دج</div>
            <div>تاريخ الطلب: {order.created_at ? new Date(order.created_at).toLocaleString("ar-DZ") : "-"}</div>
          </div>

          <form action={updateOrderStatus} className="mt-6 flex flex-wrap items-center gap-3">
            <input type="hidden" name="orderId" value={order.id} />
            <select
              name="status"
              defaultValue={order.status || "new"}
              className="rounded-2xl border border-dune bg-sand/60 px-3 py-2 text-sm text-mocha"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
            <button className="rounded-2xl bg-mocha px-4 py-2 text-sm text-white">
              تحديث الحالة
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
