"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ToolsNavigation } from "./tools-dropdown";

export function HomepageNavbar() {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className={`
        fixed top-0 left-0 right-0 z-50 px-6 lg:px-12 py-3 transition-all duration-150 ease-out
        ${hasScrolled ? "bg-background/80 backdrop-blur-md border-b border-border/50" : ""}
      `}
    >
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/">
          <span
            className="text-xl sm:text-2xl text-foreground font-medium"
            style={{
              fontFamily: "'Fraunces', serif",
              letterSpacing: "-0.02em",
            }}
          >
            Paperwork
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1">
            <Link
              href="/blog"
              className="flex items-center px-3 py-2 rounded-full text-sm font-medium transition-colors duration-150 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              Blog
            </Link>
            <ToolsNavigation />
          </div>
          <Button asChild size="sm">
            <Link href="/editor">Get Started</Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
