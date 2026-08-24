import "./globals.css";
import Backdrop from "@/components/Backdrop";
import { event } from "@/config/event";

export const metadata = {
  title: `${event.title} ${event.year}`,
  description: event.tagline,
  openGraph: {
    title: `${event.title} ${event.year}`,
    description: event.tagline,
    images: ["/maveli-full.webp"],
  },
};

export const viewport = {
  themeColor: "#a32c29",
  width: "device-width",
  initialScale: 1,
  // without this, env(safe-area-inset-*) always reports 0 on notched phones
  viewportFit: "cover",
};

// Fonts load from Google over a plain <link>, so if the machine is offline the
// page still renders with the fallback stack instead of failing the build.
const FONTS =
  "https://fonts.googleapis.com/css2" +
  "?family=Baloo+Chettan+2:wght@500;600;700;800" +
  "&family=Manrope:wght@400;500;700;800" +
  "&family=Noto+Sans+Malayalam:wght@400;600;700" +
  "&display=swap";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS} />
      </head>
      <body>
        <Backdrop />
        <div className="kasavu" />
        {children}
      </body>
    </html>
  );
}
