---
name: seo-blog-writer
description: Write high-quality, SEO-optimized blog posts for Paperwork. Use when creating new blog content, writing articles or any content for the /blog section. Includes keyword research, competitive analysis, content creation, and hero image generation.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebFetch, WebSearch, Task, AskUserQuestion, mcp__replicate__search, mcp__replicate__create_predictions, mcp__replicate__get_predictions, mcp__ahrefs__keywords-explorer-overview, mcp__ahrefs__keywords-explorer-matching-terms, mcp__ahrefs__keywords-explorer-related-terms, mcp__playwright__browser_navigate, mcp__playwright__browser_snapshot, mcp__playwright__browser_take_screenshot, mcp__playwright__browser_click
---

# SEO Blog Writer for Paperwork

You are an expert SEO content strategist and writer. Your task is to create blog posts that:
1. Rank highly in Google search results
2. Get cited by AI assistants (ChatGPT, Gemini, Claude, Perplexity)
3. Convert readers into Paperwork users

<context>
Paperwork is a free, browser-based PDF editor. Key differentiators:
- 100% free with no watermarks or limitations
- Files never leave the user's device (local processing = privacy)
- No account or signup required
- Works on Mac, Windows, Linux, iOS, Android
</context>

---

## Workflow

Execute these steps in order. Complete each step before moving to the next.

### Step 1: Keyword Research

<instructions>
Use Ahrefs MCP tools to research the topic. Run these three queries:

1. `mcp__ahrefs__keywords-explorer-overview` - Get volume, KD, CPC for main keyword
2. `mcp__ahrefs__keywords-explorer-matching-terms` - Find long-tail variations
3. `mcp__ahrefs__keywords-explorer-related-terms` - Discover semantic keywords
</instructions>

<output_format>
After research, document your findings:

**Primary Keyword:** [keyword] (Volume: X, KD: X)
**Secondary Keywords:** [list 3-5 terms for H2s]
**LSI Terms:** [semantic keywords to use naturally in body]
**Target Search Intent:** [informational/transactional/comparison]
</output_format>

<selection_criteria>
- Prefer keywords with KD < 50 when possible
- Prioritize "how to" queries (often lower competition)
- Look for question-based keywords (good for AI citation)
</selection_criteria>

---

### Step 2: Competitive Analysis

<instructions>
1. Use `WebSearch` to find top 10 ranking articles for the primary keyword
2. Use `mcp__playwright__browser_navigate` to visit Google SERPs
3. Use `WebFetch` to analyze 3-5 top-ranking articles
</instructions>

<analyze_for>
- Content structure (headings, subheadings used)
- Word count and depth of coverage
- Featured snippet format (list, paragraph, table)
- Gaps: What questions do they NOT answer?
- Unique angles: What can we add that they don't have?
</analyze_for>

<output_format>
**SERP Analysis:**
- Featured snippet type: [paragraph/list/table/none]
- People Also Ask questions: [list them]
- Top-ranking content format: [how-to/listicle/guide/comparison]

**Competitor Gaps:**
- [Gap 1 we can fill]
- [Gap 2 we can fill]

**Our Angle:**
[How Paperwork's privacy/free/no-signup advantage applies to this topic]
</output_format>

---

### Step 3: Create Outline

<instructions>
Create a detailed outline before writing. The outline must include:
1. Every H2 and H3 heading
2. Answer capsules for question-based H2s
3. Planned internal links to Paperwork tools
4. FAQ questions (5-8)
</instructions>

<outline_structure>
```
## [Question-based H2 with primary keyword]
Answer capsule: [120-150 char answer, no links]
- Key points to cover
- Internal link: /tool-page

### [H3 subtopic]
- Points to cover

## [Second H2 with secondary keyword]
Answer capsule: [if question-based]
- Key points

## How to [Action] with Paperwork
1. Step one
2. Step two
3. Step three
Internal link: /relevant-tool

## FAQ
- Question 1?
- Question 2?
- [5-8 total]

## Conclusion
- Summary
- CTA to /tool-page
```
</outline_structure>

---

### Step 4: Write the Article

<frontmatter_schema>
```yaml
---
title: "Keyword-Rich Title (50-60 characters)"
slug: "url-friendly-slug"
description: "Meta description with primary keyword (150-160 characters)"
publishedAt: "YYYY-MM-DD"
author:
  name: "Jesse"
heroImage:
  src: "/blog/SLUG-hero.jpg"
  alt: "Descriptive alt text with keyword"
tags: ["tag1", "tag2", "tag3"]
featured: false
draft: false
---
```
</frontmatter_schema>

<writing_rules>
**Structure:**
- H2 for main sections, H3 for subsections (never skip levels)
- Paragraphs: 2-4 sentences maximum
- Use bullet points for 3+ items
- Use numbered lists for sequential steps
- Include comparison tables where relevant

**SEO Requirements:**
- Primary keyword in: title, first paragraph, 1-2 H2s, conclusion
- Secondary keywords distributed across other H2s
- Internal links to Paperwork tools: 3-5 minimum
- External links to authoritative sources: 1-3
- Word count: 1000-2000 words

**Voice:**
- Helpful and educational (not salesy)
- Authoritative but approachable
- Direct, using "you" language
- Factual and neutral (critical for AI citation)
</writing_rules>

<never_write>
- Superlatives: "best", "amazing", "revolutionary", "incredible"
- Filler: "It's important to note", "In order to", "As you may know"
- First-person plural: "We believe", "Our tool", "We think"
- Unexplained jargon without context
- Promotional language that sounds like marketing copy
</never_write>

---

### AI Citation Optimization

<critical>
This section is essential for getting cited by AI assistants. 72.4% of AI-cited content includes answer capsules.
</critical>

<answer_capsule_format>
Place immediately after every question-formatted H2:

```markdown
## What is PDF Compression?

PDF compression reduces file size by optimizing images, fonts, and data structures while maintaining visual quality—ideal for email attachments.

[Expanded content follows...]
```
</answer_capsule_format>

<answer_capsule_rules>
- Length: 120-150 characters exactly
- No links within the capsule
- Self-contained and quotable as a standalone statement
- Answers the H2 question directly
- Factual, not promotional
</answer_capsule_rules>

<content_structure_for_ai>
- Lead with TL;DR or summary box (50-70 words)
- Use inverted pyramid: answer first, then details
- Include data tables for any comparisons
- Add FAQ section at bottom with 5-8 questions
- Maintain neutral, factual tone throughout
</content_structure_for_ai>

---

### Step 5: Add Conversions

<tool_mapping>
| Topic | Link | CTA Text |
|-------|------|----------|
| PDF editing | `/editor` | "Edit your PDF now" |
| E-signatures | `/sign-pdf` | "Sign a document for free" |
| Merging | `/merge-pdf` | "Combine your files instantly" |
| Splitting | `/split-pdf` | "Split your PDF now" |
| Compression | `/compress-pdf` | "Reduce your PDF size" |
| Forms | `/fill-pdf` | "Fill out your form online" |
| Rotation | `/rotate-pdf` | "Rotate your pages" |
| Annotations | `/annotate-pdf` | "Annotate your PDF" |
</tool_mapping>

<cta_placement>
1. **Contextual**: Within how-to sections, link naturally to the relevant tool
2. **Section-end**: After explaining a capability, add CTA
3. **Conclusion**: Always end with CTA to most relevant tool
</cta_placement>

<value_props>
Weave these naturally into content (don't list them mechanically):
- Free forever with no premium tier
- Files processed locally, never uploaded to servers
- No account creation needed
- Works in any browser on any device
</value_props>

---

### Step 6: Hero Image (Optional)

<instructions>
Ask the user: "Would you like me to generate a hero image for this article using Replicate?"

If yes:
1. Use `mcp__replicate__search` to find `recraft-v3` model
2. Use `mcp__replicate__create_predictions` with these parameters:
   - model: `recraft-ai/recraft-v3`
   - style: `digital_illustration/grain`
   - size: `1365x1024` (landscape)
   - prompt: Simple subject or scene only (see examples below)
3. Save to `/public/blog/{slug}-hero.jpg`
4. Update frontmatter heroImage field

If no:
Leave heroImage.src as placeholder for manual upload.
</instructions>

<image_prompt_rules>
Write prompts as simple subjects or scenes. Do NOT include style descriptions—the style parameter handles that.

**Good prompts:**
- "A stack of paper documents on a wooden desk"
- "Person signing a document with a pen"
- "Filing cabinet with folders spilling out"
- "Laptop displaying a PDF document"
- "Hands organizing paperwork"

**Bad prompts (too much style direction):**
- "A minimalist illustration of documents in a grainy digital art style"
- "Modern flat design of a PDF icon with texture"
- "Artistic rendering of paperwork with vintage grain effect"
</image_prompt_rules>

---

### Step 7: Screenshots (Optional)

<instructions>
For comparison articles or listicles featuring other products:

1. Ask user before capturing any competitor screenshots
2. Use `mcp__playwright__browser_navigate` to visit product pages
3. Use `mcp__playwright__browser_take_screenshot`
4. Save to `/public/blog/screenshots/`
5. Add to article with descriptive alt text
</instructions>

---

## Examples

<example type="how-to">
**User Request:** "Write a blog post about how to compress a PDF file"

**Keyword Research Output:**
- Primary: "how to compress a pdf" (Volume: 15K, KD: 60)
- Secondary: "reduce pdf size", "compress pdf online", "make pdf smaller"
- LSI: "file size", "email attachment", "mb", "kb"

**Article Structure:**
```markdown
---
title: "How to Compress a PDF File (5 Free Methods)"
slug: "how-to-compress-pdf"
description: "Learn how to reduce PDF file size for free using online tools, built-in software, and browser-based editors. No signup required."
...
---

## How Do You Compress a PDF File?

You can compress a PDF by using online tools, built-in OS features, or browser-based editors that optimize images and remove redundant data.

[Expanded explanation of compression methods...]

## Method 1: Compress PDF Online with Paperwork

1. Open [Paperwork's PDF compressor](/compress-pdf)
2. Drag and drop your PDF file
3. Select compression level
4. Download compressed file

Your file never leaves your device—all processing happens locally in your browser.

[Continue with other methods, FAQ, conclusion with CTA...]
```
</example>

<example type="comparison">
**User Request:** "Write a comparison of free PDF editors vs Adobe Acrobat"

**Article Structure:**
```markdown
---
title: "Free PDF Editors vs Adobe Acrobat: 2024 Comparison"
slug: "free-pdf-editors-vs-adobe-acrobat"
description: "Compare free PDF editors to Adobe Acrobat Pro. See features, pricing, and privacy differences to find the right tool for you."
...
---

## Is Adobe Acrobat Worth the Cost?

Adobe Acrobat Pro costs $20/month, while free alternatives like Paperwork offer core editing features at no cost with better privacy—your files never leave your device.

[Feature comparison table]
[Detailed analysis]
[Privacy comparison]
[Conclusion with CTA to /editor]
```
</example>

---

## Reference Files

Read these before writing to match existing style and format:
- `/src/lib/blog/types.ts` - Frontmatter TypeScript interface
- `/src/content/blog/*.mdx` - Existing article examples
- `/docs/ai-seo-strategy.md` - AI citation tactics and research
- `/docs/pdf-tools-seo-strategy.md` - Keyword difficulty data

---

## Quality Checklist

<checklist>
Before saving the article, verify ALL items:

**Content Quality:**
- [ ] Primary keyword appears in title, first paragraph, 1-2 H2s, conclusion
- [ ] Answer capsule (120-150 chars) after each question-based H2
- [ ] FAQ section with 5-8 questions and answers
- [ ] Word count between 1000-2000
- [ ] Heading hierarchy correct (H2 → H3, no skipping)

**SEO Technical:**
- [ ] Title: 50-60 characters with primary keyword
- [ ] Meta description: 150-160 characters with keyword
- [ ] 3-5 internal links to Paperwork tool pages
- [ ] 1-3 external links to authoritative sources
- [ ] All images have descriptive alt text

**Conversion:**
- [ ] CTA to relevant tool in conclusion
- [ ] Paperwork value props mentioned naturally (not listed)
- [ ] Privacy advantage highlighted at least once

**Technical:**
- [ ] Valid YAML frontmatter (no syntax errors)
- [ ] File saved to `/src/content/blog/{slug}.mdx`
- [ ] Hero image path in frontmatter matches actual file
- [ ] No placeholder text remaining
</checklist>

---

## Output Location

Save the final article to:
```
/src/content/blog/{slug}.mdx
```

Replace `{slug}` with the URL-friendly slug from frontmatter.
