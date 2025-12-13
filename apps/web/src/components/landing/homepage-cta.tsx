"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HomepageCta() {
  return (
    <section className="py-24 px-6 lg:px-12 bg-muted/30">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground mb-6"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Start Editing PDFs for Free
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            No account needed. No software to install. Your files stay private on your device.
          </p>
          <Button asChild size="lg" className="!px-10 !py-6 text-base rounded-full">
            <Link href="/editor" className="flex items-center gap-2">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
