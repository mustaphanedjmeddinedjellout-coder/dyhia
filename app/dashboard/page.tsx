import Link from "next/link";
import { isAdminLoggedIn } from "@/lib/adminAuth";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { loginAdmin, logoutAdmin, updateOrderStatus } from "./actions";

const statusLabels: Record<string, string> = {
  new: "جديد",
  confirmed: "مؤكد",
  shipped: "تم الشحن",
  cancelled: "ملغي"
};

const statusOptions = ["new", "confirmed", "shipped", "cancelled"];

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const isAdmin = await isAdminLoggedIn();
  const errorMessage = resolvedSearchParams?.error
    ? "بيانات الدخول غير صحيحة أو هناك خطأ في الاتصال."
    : null;

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-hero-glow">
        <div className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-12">
          <div className="w-full rounded-[32px] bg-white p-8 shadow-lift">
            <h1 className="text-2xl font-semibold text-cocoa">تسجيل دخول الادمن</h1>
            <p className="mt-2 text-sm text-mocha/70">ادخلي كلمة السر للوصول إلى لوحة الطلبات.</p>
            {errorMessage && <p className="mt-4 text-sm text-red-500">{errorMessage}</p>}
            <form className="mt-6 space-y-4" action={loginAdmin}>
              <input
                type="password"
                name="password"
                className="w-full rounded-2xl border border-dune bg-sand/60 px-4 py-3 text-mocha focus:border-mocha focus:outline-none"
                placeholder="كلمة السر"
              />
              <button
                type="submit"
                className="w-full rounded-2xl bg-mocha px-6 py-3 text-white shadow-lift transition hover:bg-cocoa"
              >
                دخول
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  const supabase = getSupabaseServerClient();
  const { data: orders } = supabase
    ? await supabase
        .from("orders")
        .select("id, full_name, phone, wilaya, baladiya, delivery_type, color, price, status, created_at")
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <main className="min-h-screen bg-hero-glow">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-cocoa">لوحة الطلبات</h1>
            <p className="text-sm text-mocha/70">إدارة الطلبات وتحديث حالتها مباشرة.</p>
          </div>
          <form action={logoutAdmin}>
            <button className="rounded-2xl border border-dune px-4 py-2 text-sm text-mocha transition hover:bg-sand">
              تسجيل الخروج
            </button>
          </form>
        </div>

        <div className="mt-8 grid gap-4">
          {(orders || []).map((order) => (
            <div key={order.id} className="rounded-[28px] bg-white p-6 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-cocoa">{order.full_name}</p>
                  <p className="text-sm text-mocha/70">{order.phone}</p>
                </div>
                <span className="rounded-full bg-blush px-3 py-1 text-xs text-cocoa">
                  {statusLabels[order.status] || "غير معروف"}
                </span>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-mocha/80 sm:grid-cols-2">
                <p>الولاية: {order.wilaya}</p>
                <p>البلدية: {order.baladiya}</p>
                <p>نوع التوصيل: {order.delivery_type}</p>
                <p>اللون: {order.color}</p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-base font-semibold text-cocoa">{order.price} دج</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/dashboard/${order.id}`}
                    className="rounded-2xl border border-dune px-4 py-2 text-sm text-mocha transition hover:bg-sand"
                  >
                    التفاصيل
                  </Link>
                  <form action={updateOrderStatus} className="flex items-center gap-2">
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
                      تحديث
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}

          {orders?.length === 0 && (
            <div className="rounded-[28px] bg-white p-6 text-center text-sm text-mocha/70 shadow-soft">
              لا توجد طلبات بعد.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
