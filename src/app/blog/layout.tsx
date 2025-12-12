import type { Metadata } from "next";
import { HomepageNavbar } from "@/components/landing/homepage-navbar";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: {
    template: "%s | Paperwork Blog",
    default: "Blog | Paperwork",
  },
  description:
    "Tips, tutorials, and insights about PDF editing, electronic signatures, and document management.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative bg-background min-h-screen">
      <HomepageNavbar />
      {children}
      <Footer />
    </main>
  );
}
