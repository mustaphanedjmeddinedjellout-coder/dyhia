const reviews = [
  { name: "فاطمة ب.", text: "روعة والقماش ناعم جداً، وصل سريع 🌟", stars: 5 },
  { name: "سارة م.", text: "لبستها للعيد وكانت الأجمل بين الحضور", stars: 5 },
  { name: "أمينة ك.", text: "التطريز جميل جداً، جودة عالية وسعر رائع", stars: 5 },
  { name: "نور ع.", text: "المقاس واسع مريح جداً، رح نطلب مرة ثانية", stars: 5 },
  { name: "إيمان ز.", text: "بنت أختي حبتها بزاف، شكراً أناقة ستور!", stars: 5 },
];

export default function ReviewsStrip() {
  return (
    <section className="mt-12 animate-fade-up">
      <div className="flex items-center gap-3 mb-5 px-1">
        <span className="text-gold text-xl">★★★★★</span>
        <h2 className="text-lg font-semibold text-cocoa">ماذا تقول زبوناتنا</h2>
        <span className="text-xs text-mocha/60 bg-blush rounded-full px-3 py-1">+100 زبونة راضية</span>
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x pb-3">
        {reviews.map((r, i) => (
          <div
            key={i}
            className="snap-start flex-shrink-0 w-64 rounded-2xl bg-white p-4 shadow-soft border border-dune/50"
          >
            <div className="flex gap-0.5 mb-2">
              {Array.from({ length: r.stars }).map((_, s) => (
                <span key={s} className="text-gold text-sm">★</span>
              ))}
            </div>
            <p className="text-sm text-mocha/90 leading-relaxed mb-3">"{r.text}"</p>
            <p className="text-xs font-semibold text-cocoa">{r.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
