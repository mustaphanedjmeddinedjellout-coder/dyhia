export default function AnnouncementBar() {
  return (
    <div className="w-full bg-cocoa text-white text-sm py-2 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap gap-12" style={{ width: "max-content" }}>
        {[1, 2].map((n) => (
          <span key={n} className="flex items-center gap-8 px-4">
            <span>🎁 شحن لجميع ولايات الجزائر</span>
            <span className="text-gold">✦</span>
            <span>💳 الدفع عند الاستلام</span>
            <span className="text-gold">✦</span>
            <span>✨ تطريز ذهبي يدوي فاخر</span>
            <span className="text-gold">✦</span>
            <span>🕐 توصيل سريع خلال 48 ساعة</span>
            <span className="text-gold">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
