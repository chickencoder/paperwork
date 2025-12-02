# AI SEO Playbook: Getting Cited by ChatGPT, Gemini & Perplexity

> Practical tactics to get your content cited in AI-generated answers.

## Quick Stats

- 400M+ weekly ChatGPT users
- AI Overviews appear on 85%+ of Google searches
- 80% of AI citations don't appear in traditional Google results
- AI-referred traffic converts 4.4x higher than organic
- Only 4.5% of AI-cited URLs match Page 1 organic results

---

## 1. The Answer Capsule (Most Important)

The #1 predictor of AI citations. 72.4% of cited posts have one.

**What it is:** A 120-150 character self-contained answer placed directly after your H1 or H2 question heading.

**Rules:**

- [ ] Keep it link-free (91% of cited capsules have zero links)
- [ ] Place immediately after a question-formatted heading
- [ ] Make it quotable as a standalone statement
- [ ] Add original data when possible (2nd strongest predictor)

**Example for PDF tools:**

```
## What is PDF Merge?

PDF merge combines multiple PDF files into a single document.
Upload your files, arrange the order, and download instantly—no
software installation required.
```

---

## 2. Content Structure Checklist

Clean structure = 39.7% higher citation rates.

- [ ] Lead with TL;DR or summary box (50-70 words)
- [ ] Use inverted pyramid (answer first, details after)
- [ ] Break content into scannable sections with H2/H3s
- [ ] Use bullet points and numbered lists liberally
- [ ] Include data tables for comparisons
- [ ] Add FAQ section at bottom

**Listicle Power:** Content with data tables gets 2.3x more AI citations than narrative articles.

---

## 3. Platform-Specific Tactics

### ChatGPT

| Priority | Action                                                         |
| -------- | -------------------------------------------------------------- |
| Critical | Get indexed by Bing (submit via Bing Webmaster Tools)          |
| Critical | Allow OAI-SearchBot in robots.txt                              |
| High     | Update content monthly (76.4% of cited pages updated in 30 days) |
| High     | Maintain Wikipedia presence if applicable                      |
| Medium   | Get featured in authoritative publications                     |

**What ChatGPT ignores:** UGC, vendor blogs (<3% of citations)

**Top citation sources:** Wikipedia (47.9%), Reuters, Financial Times, Forbes

### Google AI Overviews

| Priority | Action                                                     |
| -------- | ---------------------------------------------------------- |
| Critical | Standard Google indexing requirements                      |
| High     | Implement FAQPage and HowTo schema                         |
| High     | Build E-E-A-T signals (authorship, credentials, citations) |
| High     | Earn third-party mentions and backlinks                    |
| Medium   | Target featured snippet optimization                       |

**Top citation sources:** Blogs (~46%), news (~20%), Reddit prominent

### Perplexity

| Priority | Action                                              |
| -------- | --------------------------------------------------- |
| Critical | Keep content fresh (prefers 25.7% newer content)    |
| High     | Build Reddit presence (40%+ of citations from Reddit) |
| High     | Create video content (YouTube prominent)            |
| Medium   | Focus on blog-style editorial content               |

**Top citation sources:** YouTube (~3%), blogs (~39%), news (~26%)

### Claude

| Priority | Action                                     |
| -------- | ------------------------------------------ |
| Critical | Use neutral, analyst tone                  |
| Critical | Avoid salesy superlatives                  |
| High     | Focus on factual, whitepaper-style content |
| Medium   | Include citations and references           |

**Key insight:** Claude penalizes "salesy" language—if content reads like a sales brochure, it may be filtered out.

### Gemini

| Priority | Action                                          |
| -------- | ----------------------------------------------- |
| Critical | Create YouTube video content (dominant source)  |
| High     | Ensure high readability scores                  |
| High     | Get featured in listicle/comparison articles    |
| Medium   | Build presence on review platforms              |

**Top citation sources:** YouTube (~23%), PCMag, Capterra, TechRadar (listicle/affiliate sites)

---

## 4. Video Strategy (High Impact)

YouTube accounts for 23-93% of AI citations depending on industry.

### Quick Wins for PDF Tools

- [ ] Create "How to [action] a PDF" tutorial videos
- [ ] Keep videos under 5 minutes for how-tos
- [ ] Include timestamps/chapters
- [ ] Write detailed descriptions with keywords
- [ ] Add closed captions (AI reads these)

### Video Content Ideas

1. "How to Merge PDF Files (Free, No Software)"
2. "5 Ways to Compress a PDF File"
3. "Sign PDF Documents Online - Step by Step"
4. "Best Free PDF Tools Comparison 2025"

### YouTube SEO for AI

- **Title:** Include primary keyword + modifier
- **Description:** First 150 chars = answer capsule
- **Tags:** Include question variations
- **Pinned comment:** Link to your tool

---

## 5. Off-Site Citation Building

Brands are 6.5x more likely to be cited through third-party sources than their own domains.

### Priority Actions

1. **Listicle placements** - Get featured in "Best PDF Tools" articles
2. **Review sites** - G2, Capterra, Product Hunt profiles
3. **Reddit presence** - Genuine participation in r/productivity, r/software
4. **Wikipedia** - Create/update relevant articles (crucial for ChatGPT)

### Reddit Strategy

- Reddit sentiment = LLM sentiment about your brand
- Build presence over months (not quick campaigns)
- Perplexity citations appear within weeks
- ChatGPT citations take months
- Focus: Helpful answers, not promotion

### Third-Party Stats

- 82.5% of AI citations link to deeply nested pages (not homepages)
- 28% of ChatGPT's most-cited pages have zero Google organic visibility
- Wikipedia alone accounts for 47.9% of ChatGPT citations

---

## 6. Schema Markup Checklist

Use JSON-LD format (Google recommended).

### Required for Tool Pages

- [ ] FAQPage schema for FAQ sections
- [ ] HowTo schema for tutorials
- [ ] SoftwareApplication schema for tools
- [ ] Organization schema for brand

### Example FAQPage Schema

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I merge PDF files?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Upload your PDF files, arrange them in order, click merge, and download the combined file."
      }
    }
  ]
}
```

### Example HowTo Schema

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Merge PDF Files",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Upload files",
      "text": "Click 'Select Files' or drag and drop your PDF files."
    },
    {
      "@type": "HowToStep",
      "name": "Arrange order",
      "text": "Drag files to arrange them in your preferred order."
    },
    {
      "@type": "HowToStep",
      "name": "Merge and download",
      "text": "Click 'Merge' and download your combined PDF."
    }
  ]
}
```

---

## 7. Technical Requirements

### Crawler Access (robots.txt)

```
User-agent: OAI-SearchBot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Googlebot
Allow: /
```

### Page Requirements

- [ ] Mobile-optimized
- [ ] Fast load times (<3s)
- [ ] Semantic HTML structure
- [ ] Clear heading hierarchy (H1 → H2 → H3)
- [ ] Visible publication/update dates
- [ ] Author attribution

---

## 8. PDF Tools Application

### Tool Page Template

1. **H1:** "[Action] PDF - Free Online Tool"
2. **Answer Capsule:** 120-150 char definition (no links)
3. **Tool Widget:** The actual functionality
4. **How-To Section:** Step-by-step with HowTo schema
5. **Features:** Bullet list of capabilities
6. **FAQ Section:** 5-8 questions with FAQPage schema
7. **Update Date:** "Last updated: [Month] 2025"

### Answer Capsules for Each Tool

| Tool         | Answer Capsule                                                                                              |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| Merge PDF    | Combine multiple PDFs into one document. Drag, drop, arrange, and download—free, no signup required.        |
| Sign PDF     | Add your signature to any PDF. Draw, type, or upload your signature and place it anywhere on the document.  |
| Compress PDF | Reduce PDF file size by up to 90% while maintaining quality. Perfect for email attachments and uploads.     |
| Split PDF    | Extract specific pages or split PDFs into separate files. Select pages, split, and download instantly.      |
| Edit PDF     | Add text, images, and annotations to any PDF. Make changes directly in your browser without software.       |
| Rotate PDF   | Rotate PDF pages 90° or 180°. Fix upside-down scans or reorganize document orientation in seconds.          |
| Unlock PDF   | Remove password protection from PDFs. Upload your locked file and download an unlocked version.             |
| Fill PDF     | Fill out PDF forms online. Type into form fields, add checkmarks, and save your completed document.         |

### Original Data to Add

Include proprietary statistics to boost citation likelihood:

- "Based on [X] documents processed..."
- "Average compression: 73% file size reduction"
- "Most popular tool: Merge PDF (used [X] times daily)"
- "Users save an average of [X] minutes per document"

---

## 9. Measurement

### Tools to Track AI Visibility

- [Profound](https://profound.com) - AI citation tracking
- [Goodie](https://higoodie.com) - Brand mentions in AI
- [Daydream](https://daydream.ai) - AI visibility monitoring
- Semrush AI visibility features
- Ahrefs AI-specific dashboards

### KPIs

- AI citation mentions (weekly tracking)
- Referral traffic from ChatGPT/Perplexity
- Brand sentiment in AI responses
- Third-party mention growth

### Expected Impact

- 17% increase in inbound leads within 6 weeks (GEO implementers)
- 38% boost in organic clicks when mentioned by AI
- AI-referred traffic converts 4.4x higher than traditional organic

---

## Quick Reference: Priority Actions

### This Week

1. Add answer capsules to all tool pages
2. Implement FAQ schema on existing content
3. Submit site to Bing Webmaster Tools
4. Check robots.txt allows AI crawlers

### This Month

1. Create 3-5 "How to" YouTube videos
2. Update all tool pages with fresh dates
3. Add original usage statistics
4. Build Reddit presence in relevant subreddits

### Ongoing

1. Monitor AI citations weekly
2. Get featured in 2-3 listicle articles monthly
3. Keep content updated (monthly minimum)
4. Expand video library

---

## Key Takeaways

1. **Answer capsules are everything** - 72.4% of cited content has one
2. **Links hurt citability** - 91% of cited capsules have zero links
3. **Off-site matters more** - 6.5x more likely to be cited via third parties
4. **YouTube dominates** - Especially for Gemini (23-93% of citations)
5. **Reddit drives Perplexity** - 40%+ of Perplexity citations
6. **Freshness is critical** - 76.4% of ChatGPT citations are from last 30 days
7. **Traditional SEO ≠ AI visibility** - 80% of AI citations aren't in Google top results

---

## Sources

- [SEO Sherpa - ChatGPT SEO](https://seosherpa.com/chatgpt-seo/)
- [Backlinko - GEO Guide](https://backlinko.com/generative-engine-optimization-geo)
- [Search Engine Land - Content Traits LLMs Quote](https://searchengineland.com/how-to-get-cited-by-chatgpt-the-content-traits-llms-quote-most-464868)
- [a16z - GEO Over SEO](https://a16z.com/geo-over-seo/)
- [Surfer SEO - AI Citation Report](https://surferseo.com/blog/ai-citation-report/)
- [Semrush - AI SEO Statistics](https://www.semrush.com/blog/ai-seo-statistics/)
- [Neil Patel - LLM Seeding](https://neilpatel.com/blog/llm-seeding/)
- [Google Search Central - AI Features](https://developers.google.com/search/docs/appearance/ai-features)
- [First Page Sage - ChatGPT Optimization](https://firstpagesage.com/seo-blog/chatgpt-optimization-guide/)
- [Geostar - Schema Markup for AI](https://www.geostar.ai/blog/complete-guide-schema-markup-ai-search-optimization)
