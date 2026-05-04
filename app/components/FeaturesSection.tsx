const features = [
  { icon: "🧵", title: "قماش بارد", desc: "لا يلتصق بالجسم — مثالي للصيف" },
  { icon: "✨", title: "تطريز ذهبي", desc: "خيط ذهبي متقن ومتين يدوم طويلاً" },
  { icon: "🎨", title: "3 ألوان", desc: "أسود، أحمر، أخضر — لكل ذوق" },
  { icon: "📏", title: "مقاس واسع", desc: "قصة فضفاضة تناسب كل الأجسام" },
];

const details = [
  { label: "الخامة", value: "باردة ومريحة" },
  { label: "التطريز", value: "ذهبي فاخر" },
  { label: "الألوان", value: "أسود، أحمر، أخضر" },
  { label: "القياس", value: "مقاس واسع" },
];

export default function FeaturesSection() {
  return (
    <section className="mt-14 sm:mt-20 animate-fade-up">
      <h2 className="text-2xl sm:text-3xl font-semibold text-cocoa mb-8">لماذا هذه الروبة؟</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {features.map((f, i) => (
          <div key={i} className="rounded-2xl bg-white p-5 shadow-soft flex flex-col gap-2 border border-dune/40">
            <span className="text-3xl">{f.icon}</span>
            <p className="font-semibold text-cocoa text-sm">{f.title}</p>
            <p className="text-xs text-mocha/70 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-white p-6 shadow-soft border border-dune/40">
        <h3 className="font-semibold text-cocoa mb-4">تفاصيل سريعة</h3>
        <div className="grid grid-cols-2 gap-3">
          {details.map((d, i) => (
            <div key={i} className="rounded-xl bg-blush p-3">
              <p className="text-xs text-mocha/60 mb-1">{d.label}</p>
              <p className="text-sm font-semibold text-cocoa">{d.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
