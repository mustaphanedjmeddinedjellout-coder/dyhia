import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Cairo, Tajawal } from "next/font/google";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cairo"
});

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal"
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f5efe9"
};

export const metadata: Metadata = {
  title: "أناقة ستور | روبة تونسية مطرزة بالذهب",
  description:
    "روبة تونسية فاخرة مطرزة بتفاصيل ذهبية، قماش بارد ومريح، متوفرة بثلاثة ألوان. الدفع عند الاستلام — توصيل لجميع ولايات الجزائر.",
  openGraph: {
    title: "أناقة ستور | روبة تونسية مطرزة بالذهب",
    description: "روبة تونسية فاخرة، قماش بارد، تطريز ذهبي، 3 ألوان. 2800 دج فقط.",
    type: "website",
    locale: "ar_DZ"
  },
  twitter: {
    card: "summary_large_image",
    title: "أناقة ستور | روبة تونسية",
    description: "روبة تونسية فاخرة بتطريز ذهبي — 2800 دج فقط مع توصيل لكل الجزائر."
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${cairo.variable} ${tajawal.variable} font-[family-name:var(--font-cairo)] text-base bg-sand`}
      >
        {children}
      </body>
    </html>
  );
}
