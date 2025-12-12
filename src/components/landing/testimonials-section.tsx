"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "I was skeptical about online PDF editors, but Paperwork changed my mind. Signed a 40-page contract in minutes without downloading anything. The fact that files never leave my browser is a huge plus for client confidentiality.",
    name: "Sarah Chen",
    role: "Managing Partner",
    company: "Chen & Associates Law",
    avatar: "https://static.landing.so/avatars/female-1.png",
  },
  {
    quote:
      "We process hundreds of invoices monthly. Paperwork lets our team fill, sign, and compress PDFs without any per-document fees. It's saved us thousands compared to Adobe Acrobat licenses.",
    name: "Michael Torres",
    role: "Finance Director",
    company: "Vertex Solutions",
    avatar: "https://static.landing.so/avatars/male-2.png",
  },
  {
    quote:
      "As a freelance designer, I'm constantly updating my portfolio and resume. Being able to make quick edits without expensive software is a game-changer. Clean interface, fast, and completely free.",
    name: "Emma Lindqvist",
    role: "UX Designer",
    company: "Freelance",
    avatar: "https://static.landing.so/avatars/female-3.png",
  },
  {
    quote:
      "Tax season used to mean printing, signing, and scanning dozens of forms. Now I fill everything out digitally and keep perfect records. The OCR feature is incredibly accurate.",
    name: "David Park",
    role: "CPA",
    company: "Park Accounting Group",
    avatar: "https://static.landing.so/avatars/male-4.png",
  },
  {
    quote:
      "I recommend Paperwork to all my students for annotating research papers. Highlighting, notes, merging chapters—it handles everything our university's expensive tools do, but free.",
    name: "Dr. Rachel Adams",
    role: "Professor of Economics",
    company: "Stanford University",
    avatar: "https://static.landing.so/avatars/female-5.png",
  },
  {
    quote:
      "Running a real estate agency means contracts, disclosures, and signatures all day. Paperwork streamlined our entire document workflow. Clients love how fast we turn things around now.",
    name: "James Mitchell",
    role: "Broker & Owner",
    company: "Mitchell Realty",
    avatar: "https://static.landing.so/avatars/male-6.jpg",
  },
];

function StarRating() {
  return (
    <div className="flex gap-0.5 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className="w-4 h-4 fill-amber-400 text-amber-400"
        />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-24 px-6 lg:px-12 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground mb-4"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Trusted by Professionals Everywhere
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of lawyers, accountants, designers, and business owners who edit PDFs with Paperwork every day.
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-card border border-border rounded-xl p-6 flex flex-col"
            >
              <StarRating />
              <blockquote className="text-foreground text-sm leading-relaxed mb-6 flex-grow">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={44}
                  height={44}
                  className="rounded-full"
                />
                <div>
                  <p className="font-medium text-foreground text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
