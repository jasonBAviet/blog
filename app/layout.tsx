import type { Metadata } from "next";
import { Be_Vietnam_Pro, Noto_Serif } from "next/font/google";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/ui/BackToTop";
import { SidebarPanel } from "@/components/layout/SidebarPanel";
import { getAllPosts } from "@/src/core/utils/store";
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
    default: "Blog cá nhân",
    template: "%s - Blog cá nhân",
  },
  description: "Blog cá nhân - Nơi chia sẻ về công nghệ, đời sống và suy ngẫm",
  icons: {
    icon: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const allPosts = await getAllPosts();
  const sidebarPosts = allPosts.map((p) => ({
    slug: p.slug,
    title: p.title,
    createdAt: p.createdAt,
    category: p.category,
    categoryName: p.categoryName,
    tags: p.tags,
  }));

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
          <SidebarPanel posts={sidebarPosts} />
        </ThemeProvider>
      </body>
    </html>
  );
}

