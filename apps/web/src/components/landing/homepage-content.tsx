"use client";

import { motion } from "framer-motion";
import { ScanText, FormInput, PenTool, EyeOff } from "lucide-react";

const features = [
  {
    icon: ScanText,
    title: "Smart Text Recognition",
    description: "AI detects and extracts text from any PDF, even scanned documents.",
  },
  {
    icon: FormInput,
    title: "Intelligent Form Detection",
    description: "Automatically finds and highlights fillable fields in your documents.",
  },
  {
    icon: PenTool,
    title: "One-Click Signatures",
    description: "Draw, type, or upload your signature—placed perfectly every time.",
  },
  {
    icon: EyeOff,
    title: "Instant Redaction",
    description: "Permanently remove sensitive information with secure, one-click redaction.",
  },
];

export function HomepageContent() {
  return (
    <div className="relative w-full overflow-hidden bg-background">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 opacity-60">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% 20%, rgba(120, 119, 198, 0.12), transparent),
              radial-gradient(ellipse 60% 40% at 80% 50%, rgba(255, 200, 150, 0.06), transparent),
              radial-gradient(ellipse 50% 30% at 20% 80%, rgba(100, 180, 255, 0.05), transparent)
            `,
          }}
        />
      </div>

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-32">
        {/* AI Features Section */}
        <section className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-block px-4 py-1.5 text-[11px] font-medium tracking-[0.2em] uppercase text-muted-foreground border border-border rounded-full mb-6"
            >
              AI-Powered Features
            </motion.span>
            <h2
              className="text-4xl sm:text-5xl lg:text-6xl font-medium text-foreground mb-5 tracking-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Intelligent PDF Editing
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto font-light">
              Smart tools that understand your documents and help you work faster.
            </p>
          </motion.div>

          {/* Features grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group relative p-6 rounded-2xl bg-muted/30 border border-border hover:bg-muted/50 hover:border-border transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-muted transition-colors">
                    <feature.icon className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Stats bar */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative py-10 px-8 rounded-2xl border border-border bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30">
            <div className="grid sm:grid-cols-3 gap-8 sm:gap-0 sm:divide-x divide-border">
              {[
                { label: "Processing", value: "Instant", subtext: "In your browser" },
                { label: "Privacy", value: "100%", subtext: "Files never uploaded" },
                { label: "Cost", value: "Free", subtext: "No limits" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="text-center px-6"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70 mb-2">{stat.label}</p>
                  <p
                    className="text-3xl lg:text-4xl font-medium text-foreground mb-1"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.subtext}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
