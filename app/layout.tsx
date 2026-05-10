import type { Metadata } from "next";
import { Be_Vietnam_Pro, Noto_Serif } from "next/font/google";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/ui/BackToTop";
import "./globals.css";

const fontSansVN = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-vn",
});

const fontSerifVN = Noto_Serif({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif-vn",
});

export const metadata: Metadata = {
  title: {
    default: "Blog ca nhan",
    template: "%s - Blog ca nhan",
  },
  description: "Blog ca nhan - Noi chia se ve cong nghe, doi song va suy ngam",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${fontSansVN.variable} ${fontSerifVN.variable}`}
    >
      <body className="flex min-h-screen flex-col font-sans">
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <BackToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
