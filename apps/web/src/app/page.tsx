"use client";

import { HomepageNavbar } from "@/components/landing/homepage-navbar";
import { HomepageHero } from "@/components/landing/homepage-hero";
import { UseCasesSection } from "@/components/landing/use-cases-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { HomepageFaq } from "@/components/landing/homepage-faq";
import { HomepageCta } from "@/components/landing/homepage-cta";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <main className="relative bg-background">
      <HomepageNavbar />
      <HomepageHero />
      <UseCasesSection />
      <TestimonialsSection />
      <HomepageFaq />
      <HomepageCta />
      <Footer />
    </main>
  );
}
