import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Cairo, Tajawal } from "next/font/google";
import Script from "next/script";

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
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '785104514535282');
fbq('track', 'PageView');`}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=785104514535282&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
