"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import AnnouncementBar from "./components/AnnouncementBar";
import ReviewsStrip from "./components/ReviewsStrip";
import FeaturesSection from "./components/FeaturesSection";

const PRICE = 2800;
const ORIG_PRICE = 3500;

const COLORS = [
  { id: "black", name: "الأسود الأنيق", swatch: "#111111", image: "/images/fn.webp", fallback: "/images/hero.svg" },
  { id: "red", name: "الأحمر الجذاب", swatch: "#b62f2f", image: "/images/IMG_8495.webp", fallback: "/images/hero.svg" },
  { id: "green", name: "الأخضر الملكي", swatch: "#7f8f6f", image: "/images/fv.webp", fallback: "/images/hero.svg" },
];

const WILAYAS = ["أدرار","الشلف","الأغواط","أم البواقي","باتنة","بجاية","بسكرة","بشار","البليدة","البويرة","تمنراست","تبسة","تلمسان","تيارت","تيزي وزو","الجزائر","الجلفة","جيجل","سطيف","سعيدة","سكيكدة","سيدي بلعباس","عنابة","قالمة","قسنطينة","المدية","مستغانم","المسيلة","معسكر","ورقلة","وهران","البيض","إليزي","برج بوعريريج","بومرداس","الطارف","تندوف","تيسمسيلت","الوادي","خنشلة","سوق أهراس","تيبازة","ميلة","عين الدفلى","النعامة","عين تموشنت","غرداية","غليزان","تيميمون","برج باجي مختار","أولاد جلال","بني عباس","عين صالح","عين قزام","تقرت","جانت","المغير","المنيعة"];

type DeliveryType = "home" | "stop";
type FormState = {
  fullName: string;
  phone: string;
  wilaya: string;
  wilayaId: string;
  baladiya: string;
  communeId: string;
  address: string;
  deliveryType: DeliveryType | "";
  stopdeskId: string;
  color: string;
};
type FormErrors = Partial<Record<keyof FormState, string>>;

type GeoOption = { id: number; name: string };
type CenterOption = { center_id: number; name: string };
type ShippingQuote = { price: number };

function Img({ src, fallback, alt, className, priority }: { src: string; fallback: string; alt: string; className?: string; priority?: boolean; }) {
  const [s, setS] = useState(src);
  useEffect(() => {
    setS(src);
  }, [src]);
  return <img src={s} alt={alt} className={className} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} onError={() => s !== fallback && setS(fallback)} />;
}

function Stars({ n = 5 }: { n?: number }) {
  return <span className="text-gold">{Array.from({ length: n }).map((_, i) => <span key={i}>★</span>)}</span>;
}

function trackMetaPixel(eventName: string, parameters?: Record<string, unknown>) {
  if (typeof window === "undefined") {
    return;
  }

  const fbq = (window as Window & { fbq?: (...args: any[]) => void }).fbq;
  if (typeof fbq !== "function") {
    return;
  }

  if (parameters) {
    fbq("track", eventName, parameters);
    return;
  }

  fbq("track", eventName);
}

export default function HomePage() {
  const [form, setForm] = useState<FormState>({
    fullName: "",
    phone: "",
    wilaya: "",
    wilayaId: "",
    baladiya: "",
    communeId: "",
    address: "",
    deliveryType: "home",
    stopdeskId: "",
    color: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [wilayaOptions, setWilayaOptions] = useState<GeoOption[] | null>(null);
  const [communeOptions, setCommuneOptions] = useState<GeoOption[] | null>(null);
  const [centerOptions, setCenterOptions] = useState<CenterOption[] | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [loadingCenters, setLoadingCenters] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const wilayaRef = useRef<HTMLSelectElement>(null);
  const baladiyaRef = useRef<HTMLInputElement | HTMLSelectElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);

  const selectedColor = useMemo(() => COLORS.find(c => c.id === form.color), [form.color]);
  const heroColor = selectedColor ?? COLORS[0];

  const set = (field: keyof FormState, val: string) => {
    setForm(p => ({ ...p, [field]: val }));
    setErrors(p => ({ ...p, [field]: "" }));
  };

  const goToOrder = (focus?: boolean) => {
    document.getElementById("order")?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (focus) setTimeout(() => nameRef.current?.focus(), 250);
  };

  const pickColor = (id: string, options?: { scroll?: boolean }) => {
    set("color", id);
    setSuccess(false);
    if (options?.scroll) {
      goToOrder(true);
    }
  };

  const deliveryFee = quote?.price ?? null;
  const totalPrice = (deliveryFee ?? 0) + PRICE;

  const geoMode: "api" | "fallback" = wilayaOptions && wilayaOptions.length ? "api" : "fallback";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingGeo(true);
      setGeoError(null);
      try {
        const res = await fetch("/api/yalidine/wilayas", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("wilayas");
        }
        const json = (await res.json()) as { wilayas?: GeoOption[] };
        if (!cancelled) {
          setWilayaOptions(Array.isArray(json.wilayas) ? json.wilayas : []);
        }
      } catch {
        if (!cancelled) {
          setWilayaOptions(null);
          setGeoError("تعذر تحميل قائمة الولايات تلقائياً.");
        }
      } finally {
        if (!cancelled) setLoadingGeo(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCommuneOptions(null);
      setCenterOptions(null);
      setQuote(null);

      if (geoMode !== "api") {
        return;
      }

      if (form.deliveryType !== "home" && form.deliveryType !== "stop") {
        return;
      }

      const wilayaId = Number(form.wilayaId);
      if (!Number.isFinite(wilayaId) || wilayaId <= 0) {
        return;
      }

      try {
        const onlyWithCenters = form.deliveryType === "stop";
        const res = await fetch(
          `/api/yalidine/communes?wilayaId=${wilayaId}&onlyWithCenters=${onlyWithCenters ? "1" : "0"}`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          throw new Error("communes");
        }
        const json = (await res.json()) as { communes?: GeoOption[] };
        if (!cancelled) {
          setCommuneOptions(Array.isArray(json.communes) ? json.communes : []);
        }
      } catch {
        if (!cancelled) {
          setCommuneOptions([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.wilayaId, form.deliveryType, geoMode]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCenterOptions(null);

      if (geoMode !== "api") {
        return;
      }
      if (form.deliveryType !== "stop") {
        return;
      }
      const communeId = Number(form.communeId);
      if (!Number.isFinite(communeId) || communeId <= 0) {
        return;
      }

      setLoadingCenters(true);
      try {
        const res = await fetch(`/api/yalidine/centers?communeId=${communeId}`);
        if (!res.ok) {
          throw new Error("centers");
        }
        const json = (await res.json()) as { centers?: any[] };
        const opts = Array.isArray(json.centers)
          ? json.centers
              .map((c) => ({
                center_id: Number(c.center_id ?? c.id),
                name: String(c.name ?? "").trim()
              }))
              .filter((c) => Number.isFinite(c.center_id) && c.center_id > 0 && c.name)
          : [];

        if (!cancelled) {
          setCenterOptions(opts);
          setForm((p) => {
            if (p.deliveryType !== "stop") return p;
            if (p.stopdeskId) return p;
            if (opts.length === 1) return { ...p, stopdeskId: String(opts[0].center_id) };
            return p;
          });
        }
      } catch {
        if (!cancelled) {
          setCenterOptions([]);
        }
      } finally {
        if (!cancelled) setLoadingCenters(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoMode, form.deliveryType, form.communeId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setQuote(null);
      if (geoMode !== "api") {
        return;
      }
      const wilayaId = Number(form.wilayaId);
      if (!Number.isFinite(wilayaId) || wilayaId <= 0) {
        return;
      }
      const communeId = Number(form.communeId);
      if (!Number.isFinite(communeId) || communeId <= 0) {
        return;
      }
      if (form.deliveryType !== "home" && form.deliveryType !== "stop") {
        return;
      }
      setLoadingQuote(true);
      try {
        const res = await fetch(
          `/api/yalidine/shipping?wilayaId=${wilayaId}&communeId=${communeId}&deliveryType=${form.deliveryType}`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          throw new Error("shipping");
        }
        const json = (await res.json()) as { quote?: ShippingQuote | null };
        if (!cancelled) {
          setQuote(json.quote && typeof json.quote.price === "number" ? json.quote : null);
        }
      } catch {
        if (!cancelled) {
          setQuote(null);
        }
      } finally {
        if (!cancelled) setLoadingQuote(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.wilayaId, form.communeId, form.deliveryType, geoMode]);

  const validate = () => {
    const e: FormErrors = {};
    if (!form.fullName.trim()) e.fullName = "الاسم مطلوب.";
    if (!form.phone.trim()) e.phone = "رقم الهاتف مطلوب.";
    else if (!/^\+213\s?\d{8,9}$/.test(form.phone.trim())) e.phone = "يرجى إدخال رقم يبدأ بـ +213.";
    if (!form.wilaya) e.wilaya = "الرجاء اختيار الولاية.";
    if (geoMode === "api") {
      if (!form.communeId) e.communeId = "الرجاء اختيار البلدية.";
    } else {
      if (!form.baladiya.trim()) e.baladiya = "البلدية مطلوبة.";
    }
    if (!form.color) e.color = "الرجاء اختيار اللون.";
    setErrors(e);
    if (e.fullName) nameRef.current?.focus();
    else if (e.phone) phoneRef.current?.focus();
    else if (e.wilaya) wilayaRef.current?.focus();
    else if (e.communeId || e.baladiya) (baladiyaRef.current as any)?.focus?.();
    else if (e.address) addressRef.current?.focus();
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setSubmitError(null);
    if (!validate()) { goToOrder(); return; }
    setSubmitting(true);
    try {
      const sb = getSupabaseClient();
      if (sb) {
        const baseRow: any = {
          full_name: form.fullName,
          phone: form.phone,
          wilaya: form.wilaya,
          baladiya: form.baladiya,
          delivery_type: form.deliveryType,
          color: form.color,
          price: PRICE,
          status: "new"
        };

        const extendedRow: any = {
          ...baseRow,
          wilaya_id: form.wilayaId ? Number(form.wilayaId) : null,
          commune_id: form.communeId ? Number(form.communeId) : null,
          stopdesk_id:
            form.deliveryType === "stop" && form.stopdeskId ? Number(form.stopdeskId) : null,
          stopdesk_name:
            form.deliveryType === "stop" && form.stopdeskId
              ? (centerOptions ?? []).find(
                  (c) => String(c.center_id) === String(form.stopdeskId)
                )?.name ?? null
              : null,
          address: form.address,
          delivery_fee: deliveryFee ?? -100,
          total_price: Number.isFinite(totalPrice) ? totalPrice : null
        };

        const { error } = await sb.from("orders").insert([extendedRow]);
        if (error) {
          const code = (error as any).code as string | undefined;
          // Backward-compatible fallback if the table doesn't have new columns yet.
          if (code === "PGRST204") {
            const { error: fallbackError } = await sb.from("orders").insert([baseRow]);
            if (fallbackError) throw fallbackError;
          } else {
            throw error;
          }
        }
      }
      trackMetaPixel("Purchase", {
        value: totalPrice,
        currency: "DZD",
        content_name: "روبة تونسية",
        content_type: "product"
      });
      setSuccess(true);
      setForm({ fullName: "", phone: "", wilaya: "", wilayaId: "", baladiya: "", communeId: "", address: "", deliveryType: "home", stopdeskId: "", color: "" });
    } catch {
      setSubmitError("حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "mt-2 w-full rounded-2xl border border-dune bg-sand/60 px-4 py-4 text-mocha focus:border-mocha focus:outline-none focus:ring-2 focus:ring-mocha/20 transition text-base";
  const errCls = "mt-1.5 text-xs text-red-500";

  return (
    <main className="min-h-screen pb-28 sm:pb-0" dir="rtl">
      <AnnouncementBar />

      {/* ── HERO ── */}
      <div className="max-w-2xl mx-auto px-4 pt-6 sm:pt-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 border border-gold/30 px-4 py-1.5 text-sm text-gold font-medium mb-5">
          <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
          تشكيلة جديدة — كميات محدودة
        </div>

        {/* Hero Image */}
        <div className="relative animate-fade-up">
          <div className="absolute -inset-3 rounded-[32px] bg-gradient-to-br from-gold/20 via-blush to-dune blur-2xl opacity-70" />
          <div className="relative rounded-[32px] bg-white overflow-hidden shadow-lift">
            {/* NEW badge */}
            <div className="absolute top-4 right-4 z-10 bg-gold text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              جديد ✨
            </div>
            <Img
              src={heroColor.image}
              fallback={heroColor.fallback}
              alt={`روبة تونسية - ${heroColor.name}`}
              className="w-full object-cover aspect-[4/5] sm:aspect-[16/9]"
              priority
            />
            <div className="flex items-center gap-3 px-4 py-3 border-t border-dune/40">
              <div className="flex items-center gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => pickColor(c.id)}
                    className={`relative h-16 w-12 sm:h-20 sm:w-16 rounded-xl overflow-hidden border transition active:scale-95 focus:outline-none ${
                      heroColor.id === c.id
                        ? "ring-gold border-gold"
                        : "border-dune/50 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <Img
                      src={c.image}
                      fallback={c.fallback}
                      alt={`روبة تونسية - ${c.name}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
              <div className="mr-auto text-xs text-mocha/50">
                <span className="font-semibold text-cocoa">{heroColor.name}</span>
                <span> — انقري لتغيير اللون</span>
              </div>
            </div>
          </div>
        </div>

        {/* Title + Price */}
        <div className="mt-6 animate-fade-up space-y-4">
          <p className="text-xs tracking-widest text-mocha/60 uppercase">أناقة ستور</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-cocoa leading-snug" style={{ fontFamily: "var(--font-tajawal)" }}>
            روبة تونسية تهببل...<br />أناقة وراحة في لبسة وحدة!
          </h1>
          <p className="text-base text-mocha/75 leading-relaxed">
            تألقي بأجمل طلة مع هذه الروبة التونسية المطرزة بالذهبي، قماش بارد ومريح ومتوفر بثلاث ألوان شبابة.
          </p>

          {/* Price row */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-cocoa">{PRICE.toLocaleString("ar-DZ")} دج</span>
              <span className="text-base text-mocha/40 line-through">{ORIG_PRICE.toLocaleString("ar-DZ")} دج</span>
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-20%</span>
            </div>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={() => goToOrder(true)}
            className="shimmer-btn w-full rounded-2xl bg-cocoa py-4 text-white text-lg font-bold shadow-lift transition hover:bg-mocha active:scale-95 animate-pulse-ring"
          >
            اطلبي الآن 🛍️
          </button>

          {/* Trust strip */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs text-mocha/70">
            <div className="rounded-xl bg-white py-3 px-2 shadow-soft border border-dune/40">
              <div className="text-xl mb-1">🚚</div>توصيل سريع
            </div>
            <div className="rounded-xl bg-white py-3 px-2 shadow-soft border border-dune/40">
              <div className="text-xl mb-1">💳</div>الدفع عند الاستلام
            </div>
            <div className="rounded-xl bg-white py-3 px-2 shadow-soft border border-dune/40">
              <div className="text-xl mb-1">🛡️</div>ضمان الجودة
            </div>
          </div>
        </div>

        {/* Reviews */}
        <ReviewsStrip />

        {/* ── GALLERY ── */}
        <section className="mt-14 animate-fade-up" id="gallery">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-cocoa">اختاري لونك</h2>
            <span className="text-xs text-mocha/60 bg-blush rounded-full px-3 py-1">3 ألوان متاحة</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {COLORS.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => pickColor(c.id, { scroll: true })}
                style={{ animationDelay: `${i * 0.1}s` }}
                className={`text-right rounded-2xl bg-white overflow-hidden shadow-soft transition-all active:scale-95 focus:outline-none ${form.color === c.id ? "ring-gold scale-[1.03]" : "border border-dune/40"}`}
              >
                <div className="relative">
                  <Img src={c.image} fallback={c.fallback} alt={c.name} className="w-full object-cover aspect-[3/4]" />
                  {form.color === c.id && (
                    <div className="absolute inset-0 bg-gold/10 flex items-center justify-center">
                      <span className="bg-gold text-white text-xs font-bold rounded-full px-2 py-1">✓ مختار</span>
                    </div>
                  )}
                  <span className="absolute top-2 left-2 bg-white/90 text-[10px] text-green-700 font-bold px-2 py-0.5 rounded-full">متوفر</span>
                </div>
                <div className="p-2.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-cocoa leading-tight">{c.name}</span>
                    <span className="h-3.5 w-3.5 rounded-full flex-shrink-0 border border-white shadow-sm" style={{ background: c.swatch }} />
                  </div>
                  <div className="mt-2 text-[10px] text-white bg-mocha rounded-xl py-1.5 text-center font-medium">
                    اختاري هذا
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Features */}
        <FeaturesSection />

        {/* ── ORDER FORM ── */}
        <section id="order" className="mt-14 scroll-mt-6 animate-fade-up">
          {/* Steps indicator */}
          <div className="flex items-center gap-0 mb-6 text-xs">
            {["اللون", "العنوان", "تأكيد"].map((step, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold flex-shrink-0 ${i === 0 && form.color ? "bg-gold text-white" : i === 1 && form.wilaya && form.baladiya ? "bg-gold text-white" : i === 2 && success ? "bg-green-500 text-white" : "bg-dune text-mocha/60"}`}>
                  {i === 2 && success ? "✓" : i + 1}
                </div>
                <div className={`h-0.5 flex-1 mx-1 ${i < 2 ? "bg-dune" : ""}`} />
                <span className="text-mocha/60 mr-1">{step}</span>
              </div>
            ))}
          </div>

          <div className="rounded-[28px] bg-white p-6 shadow-lift border border-dune/30">
            <h3 className="text-xl font-bold text-cocoa mb-1">عمري الاستمارة واطلبي الآن</h3>
            <p className="text-sm text-mocha/60 mb-5">تأكيد الطلب في أقل من دقيقتين ✓</p>

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              {/* Name */}
              <div>
                <label className="text-sm font-medium text-mocha/80">الاسم واللقب</label>
                <input ref={nameRef} type="text" value={form.fullName} onChange={e => set("fullName", e.target.value)} className={inputCls} placeholder="اكتبي اسمك هنا" autoComplete="name" enterKeyHint="next" dir="auto" />
                {errors.fullName && <p className={errCls}>{errors.fullName}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm font-medium text-mocha/80">رقم الهاتف</label>
                <div className="relative mt-2">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-mocha/50 font-medium border-l border-dune pl-3 ml-2 leading-none py-1">🇩🇿</span>
                  <input
                    ref={phoneRef}
                    type="tel"
                    value={form.phone}
                    onChange={e => set("phone", e.target.value)}
                    onBlur={() => {
                      const raw = form.phone.trim();
                      if (!raw || raw.startsWith("+213")) return;
                      const d = raw.replace(/\D/g, "");
                      if (raw.startsWith("0") && d.length >= 9) set("phone", `+213${d.slice(1)}`);
                    }}
                    className={`${inputCls} mt-0 pr-16`}
                    placeholder="+213 xxxxxxxxx"
                    inputMode="tel"
                    autoComplete="tel"
                    dir="ltr"
                    enterKeyHint="next"
                  />
                </div>
                {errors.phone && <p className={errCls}>{errors.phone}</p>}
              </div>

              {/* Wilaya + Commune */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-mocha/80">الولاية</label>
                  {geoMode === "api" ? (
                    <select
                      ref={wilayaRef}
                      value={form.wilayaId}
                      onChange={(e) => {
                        const nextId = e.target.value;
                        const opt = wilayaOptions?.find((w) => String(w.id) === nextId);
                        set("wilayaId", nextId);
                        set("wilaya", opt?.name || "");
                        set("communeId", "");
                        set("baladiya", "");
                        set("stopdeskId", "");
                      }}
                      className={inputCls}
                      autoComplete="address-level1"
                      disabled={loadingGeo}
                    >
                      <option value="">{loadingGeo ? "...تحميل" : "اختاري ولايتك"}</option>
                      {(wilayaOptions ?? []).map((w) => (
                        <option key={w.id} value={String(w.id)}>
                          {w.name} ({Number(w.id)})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      ref={wilayaRef}
                      value={form.wilaya}
                      onChange={(e) => set("wilaya", e.target.value)}
                      className={inputCls}
                      autoComplete="address-level1"
                    >
                      <option value="">اختاري ولايتك</option>
                      {WILAYAS.map((w, i) => (
                        <option key={w} value={w}>
                          {w} ({i + 1})
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.wilaya && <p className={errCls}>{errors.wilaya}</p>}
                  {geoError && <p className="mt-1.5 text-xs text-mocha/50">{geoError}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-mocha/80">البلدية</label>
                  {geoMode === "api" ? (
                    <select
                      ref={baladiyaRef as any}
                      value={form.communeId}
                      onChange={(e) => {
                        const nextId = e.target.value;
                        const opt = (communeOptions ?? []).find((c) => String(c.id) === nextId);
                        set("communeId", nextId);
                        set("baladiya", opt?.name || "");
                        set("stopdeskId", "");
                      }}
                      className={inputCls}
                      autoComplete="address-level2"
                      disabled={!form.deliveryType || !form.wilayaId || communeOptions === null}
                    >
                      <option value="">
                        {!form.deliveryType
                          ? "اختاري نوع التوصيل أولاً"
                          : !form.wilayaId
                            ? "اختاري الولاية أولاً"
                            : communeOptions === null
                              ? "...تحميل"
                              : "اختاري بلديتك"}
                      </option>
                      {(communeOptions ?? []).map((c) => (
                        <option key={c.id} value={String(c.id)}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      ref={baladiyaRef as any}
                      type="text"
                      value={form.baladiya}
                      onChange={(e) => set("baladiya", e.target.value)}
                      className={inputCls}
                      placeholder="اكتبي بلديتك"
                      autoComplete="address-level2"
                      enterKeyHint="next"
                    />
                  )}
                  {(errors.communeId || errors.baladiya) && (
                    <p className={errCls}>{errors.communeId || errors.baladiya}</p>
                  )}
                </div>
              </div>



              {/* Stop Desk center */}
              {geoMode === "api" && form.deliveryType === "stop" && (
                <div>
                  <label className="text-sm font-medium text-mocha/80">مركز Stop Desk</label>
                  <select
                    value={form.stopdeskId}
                    onChange={(e) => set("stopdeskId", e.target.value)}
                    className={inputCls}
                    autoComplete="off"
                    disabled={!form.communeId || centerOptions === null || loadingCenters}
                  >
                    <option value="">
                      {!form.communeId
                        ? "اختاري البلدية أولاً"
                        : loadingCenters
                          ? "...تحميل"
                          : centerOptions && centerOptions.length
                            ? "اختاري المركز"
                            : "لا توجد مراكز"}
                    </option>
                    {(centerOptions ?? []).map((c) => (
                      <option key={c.center_id} value={String(c.center_id)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.stopdeskId && <p className={errCls}>{errors.stopdeskId}</p>}
                </div>
              )}

              {/* Color picker */}
              <div>
                <label className="text-sm font-medium text-mocha/80 mb-3 block">اللون المفضل</label>
                <div className="grid grid-cols-3 gap-3">
                  {COLORS.map(c => (
                    <button key={c.id} type="button" onClick={() => set("color", c.id)}
                      className={`rounded-2xl border-2 py-3 px-2 flex flex-col items-center gap-2 transition active:scale-95 ${form.color === c.id ? "border-mocha bg-mocha text-white" : "border-dune bg-sand/50 text-mocha"}`}>
                      <span className="h-6 w-6 rounded-full border-2 border-white/60 shadow" style={{ background: c.swatch }} />
                      <span className="text-xs font-medium leading-tight text-center">{c.name.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
                {errors.color && <p className={errCls}>{errors.color}</p>}
              </div>

              {/* Size */}
              <div>
                <label className="text-sm font-medium text-mocha/80">المقاس</label>
                <div className="mt-2 rounded-2xl border border-dune bg-sand/60 px-4 py-3 text-sm text-mocha flex items-center justify-between">
                  <span className="font-semibold text-cocoa">Taille standard (38-50)</span>
                  <span className="text-xs text-mocha/60">مقاس واحد</span>
                </div>
              </div>

              {/* Order summary inline */}
              <div className="rounded-2xl bg-blush border border-dune/40 p-4 space-y-2 text-sm">
                <div className="flex justify-between text-mocha/80">
                  <span>سعر المنتج</span>
                  <span className="font-semibold text-cocoa">{PRICE.toLocaleString("ar-DZ")} دج</span>
                </div>
                <div className="flex justify-between text-mocha/80">
                  <span>التوصيل</span>
                  {geoMode === "api" ? (
                    <span className="font-semibold text-cocoa">
                      {loadingQuote ? "..." : deliveryFee !== null ? `${deliveryFee.toLocaleString("ar-DZ")} دج` : "—"}
                    </span>
                  ) : (
                    <span className="text-mocha/50">يُحسب لاحقاً</span>
                  )}
                </div>
                {geoMode === "api" && deliveryFee !== null && (
                  <div className="flex justify-between text-mocha/80 pt-1 border-t border-dune/40">
                    <span>المجموع</span>
                    <span className="font-bold text-cocoa">{totalPrice.toLocaleString("ar-DZ")} دج</span>
                  </div>
                )}
                {selectedColor && (
                  <div className="flex items-center gap-2 pt-1 border-t border-dune/40">
                    <span className="text-mocha/60">اللون المختار:</span>
                    <span className="h-4 w-4 rounded-full border border-white shadow-sm" style={{ background: selectedColor.swatch }} />
                    <span className="font-medium text-cocoa">{selectedColor.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-mocha/60 pt-1">
                  <span>✅</span><span>سيتم الاتصال بك لتأكيد الطلب</span>
                </div>
              </div>

              {submitError && <p className="text-sm text-red-500 bg-red-50 rounded-xl p-3">{submitError}</p>}

              {success && (
                <div className="relative rounded-2xl bg-green-50 border border-green-200 px-4 py-5 text-center overflow-hidden">
                  <div className="relative flex justify-center mb-2">
                    <span className="text-5xl animate-pop">✅</span>
                    <div className="confetti-dot" /><div className="confetti-dot" /><div className="confetti-dot" />
                    <div className="confetti-dot" /><div className="confetti-dot" />
                  </div>
                  <p className="text-green-800 font-semibold">تم استلام طلبك بنجاح!</p>
                  <p className="text-green-700 text-sm mt-1">سنتواصل معك قريباً لتأكيد التفاصيل 🎉</p>
                </div>
              )}

              <button type="submit" disabled={submitting}
                className="shimmer-btn w-full rounded-2xl bg-cocoa py-4 text-white text-lg font-bold shadow-lift transition hover:bg-mocha disabled:opacity-60 active:scale-95">
                {submitting ? "...جاري الإرسال" : `تأكيد الطلب — ${totalPrice.toLocaleString("ar-DZ")} دج`}
              </button>

              <div className="flex justify-center gap-6 text-xs text-mocha/50">
                <span>🔒 بياناتك آمنة</span>
                <span>📦 ضمان الجودة</span>
                <span>🔄 استرجاع سهل</span>
              </div>
            </form>
          </div>
        </section>
      </div>

      {/* ── STICKY MOBILE CTA ── */}
      <div className="fixed bottom-0 inset-x-0 z-50 sm:hidden safe-bottom bg-white/95 backdrop-blur-sm border-t border-dune shadow-lift px-4 pt-3">
        <button type="button" onClick={() => goToOrder(true)}
          className="shimmer-btn w-full flex items-center justify-between rounded-2xl bg-cocoa px-5 py-3.5 text-white shadow-lift mb-2">
          <span className="font-bold text-base">اطلبي الآن 🛍️</span>
          <div className="text-right">
            <div className="font-bold text-lg leading-none">{PRICE.toLocaleString("ar-DZ")} دج</div>
            <div className="text-xs text-white/60 line-through">{ORIG_PRICE.toLocaleString("ar-DZ")} دج</div>
          </div>
        </button>
        <div className="flex justify-center gap-4 text-[10px] text-mocha/50 pb-1">
          <span>✅ دفع عند الاستلام</span>
          <span>🚚 توصيل لكل الجزائر</span>
        </div>
      </div>
    </main>
  );
}
