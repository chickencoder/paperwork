# Programmatic AI SEO Implementation Plan

> A data-driven approach to generating 30+ optimized PDF tool landing pages.

## Overview

This document outlines a **programmatic SEO strategy** that leverages structured data to automatically generate AI-optimized landing pages for each PDF tool. The approach prioritizes:

1. **Answer Capsules** - The #1 predictor of AI citations
2. **Schema Markup** - Automatic FAQPage, HowTo, and WebApplication schema
3. **Internal Linking** - Topic clusters for better AI understanding
4. **Scalability** - Add new tools by adding data, not code

---

## Architecture: Data-Driven Landing Pages

```
┌─────────────────────────────────────────────────────────────┐
│                     tools.ts (Data Layer)                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │merge-pdf│  │sign-pdf │  │compress │  │  ...    │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
└───────┼────────────┼────────────┼────────────┼──────────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────┐
│              ToolLandingPage (Template Component)           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ H1: {tool.title}                                      │  │
│  │ Answer Capsule: {tool.answerCapsule}                  │  │
│  │ Tool Widget: <PDFTool type={tool.id} />               │  │
│  │ How-To: {tool.howToSteps.map(...)}                    │  │
│  │ Features: {tool.features.map(...)}                    │  │
│  │ FAQ: {tool.faqs.map(...)}                             │  │
│  │ Related: {tool.relatedTools.map(...)}                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Generated Output                         │
│  /tools/merge-pdf     → Static HTML + Embedded Tool         │
│  /tools/sign-pdf      → Static HTML + Embedded Tool         │
│  /tools/compress-pdf  → Static HTML + Embedded Tool         │
│  ...                                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Schema

### Core Tool Definition

```typescript
interface PDFTool {
  // Identity
  id: string;                    // "merge-pdf"
  slug: string;                  // "merge-pdf" (URL path)
  name: string;                  // "Merge PDF"
  action: string;                // "Merge" (verb for "How to X")
  category: ToolCategory;        // "manipulation" | "conversion" | "security" | "annotation"

  // AI SEO (Critical)
  answerCapsule: string;         // 120-150 chars, NO LINKS

  // Traditional SEO
  title: string;                 // "Merge PDF - Combine PDF Files Free Online"
  metaDescription: string;       // 150-160 chars
  h1: string;                    // Can differ from title

  // Keywords (from Ahrefs research)
  primaryKeyword: string;        // "merge pdf"
  secondaryKeywords: string[];   // ["combine pdf", "pdf merger", ...]
  questionKeywords: string[];    // ["how to merge pdf files", ...]
  volume: number;                // 126000
  kd: number;                    // 71
  cpc: number;                   // 0.60

  // Content Sections
  features: Feature[];           // 3-6 features with icons
  howToSteps: HowToStep[];       // 3-5 steps
  faqs: FAQ[];                   // 5-8 questions

  // Internal Linking
  relatedTools: string[];        // ["split-pdf", "compress-pdf"]

  // Tool Configuration
  toolType: ToolType;            // Which tool component to render
  acceptedFormats: string[];     // [".pdf"] or [".jpg", ".png", ".pdf"]
  outputFormat: string;          // ".pdf"

  // Metadata
  lastUpdated: string;           // "2025-12" (for freshness signals)
  tier: 1 | 2 | 3;               // Priority tier
}

interface Feature {
  icon: string;                  // Lucide icon name
  title: string;                 // "Unlimited Files"
  description: string;           // "Merge as many PDFs as you need"
}

interface HowToStep {
  step: number;
  title: string;                 // "Select files"
  description: string;           // "Click 'Select Files' or drag and drop"
}

interface FAQ {
  question: string;              // "How do I merge PDF files?"
  answer: string;                // Direct answer (will become answer capsule in schema)
}

type ToolCategory = "manipulation" | "conversion" | "security" | "annotation" | "forms";
type ToolType = "merge" | "split" | "compress" | "sign" | "edit" | "convert" | "unlock" | "rotate" | "crop" | "redact" | "annotate" | "fill" | "flatten" | "extract" | "delete" | "reorder" | "watermark" | "ocr" | "highlight";
```

---

## Complete Tool Data

### Tier 1: Quick Wins (Low KD, Launch First)

```typescript
const tier1Tools: PDFTool[] = [
  {
    id: "flatten-pdf",
    slug: "flatten-pdf",
    name: "Flatten PDF",
    action: "Flatten",
    category: "manipulation",
    answerCapsule: "Flatten PDF removes form fields and annotations, merging them into the document. Creates a static PDF that looks the same everywhere.",
    title: "Flatten PDF - Remove Form Fields & Annotations Free",
    metaDescription: "Flatten PDF files online for free. Remove interactive form fields and merge annotations into a static document. No software needed.",
    h1: "Flatten PDF Online Free",
    primaryKeyword: "flatten pdf",
    secondaryKeywords: ["how to flatten a pdf", "pdf flatten", "flatten pdf form"],
    questionKeywords: ["how to flatten a pdf", "what does flatten pdf mean"],
    volume: 4000,
    kd: 8,
    cpc: 0.80,
    features: [
      { icon: "Layers", title: "Remove Interactivity", description: "Convert form fields to static content" },
      { icon: "Eye", title: "Preserve Appearance", description: "Document looks identical after flattening" },
      { icon: "Shield", title: "Prevent Editing", description: "Flattened PDFs can't be easily modified" },
    ],
    howToSteps: [
      { step: 1, title: "Upload PDF", description: "Select your PDF with form fields or annotations" },
      { step: 2, title: "Flatten", description: "Click Flatten to merge all layers" },
      { step: 3, title: "Download", description: "Save your flattened PDF" },
    ],
    faqs: [
      { question: "What does flatten PDF mean?", answer: "Flattening a PDF merges all interactive elements (form fields, annotations) into the document, making them permanent and non-editable." },
      { question: "Why would I flatten a PDF?", answer: "To ensure the document looks the same on all devices, prevent further editing, or reduce file size by removing interactive elements." },
      { question: "Can I unflatten a PDF?", answer: "No, flattening is permanent. Always keep a backup of your original PDF before flattening." },
      { question: "Does flattening reduce file size?", answer: "Often yes, because it removes the data needed to make elements interactive." },
    ],
    relatedTools: ["compress-pdf", "fill-pdf", "edit-pdf"],
    toolType: "flatten",
    acceptedFormats: [".pdf"],
    outputFormat: ".pdf",
    lastUpdated: "2025-12",
    tier: 1,
  },

  {
    id: "redact-pdf",
    slug: "redact-pdf",
    name: "Redact PDF",
    action: "Redact",
    category: "security",
    answerCapsule: "Redact PDF permanently removes sensitive information like names, addresses, or SSNs. Blacked-out content is completely erased, not just hidden.",
    title: "Redact PDF - Permanently Remove Sensitive Information Free",
    metaDescription: "Redact PDF files online for free. Permanently remove sensitive text and images. True redaction that erases data, not just covers it.",
    h1: "Redact PDF Online Free",
    primaryKeyword: "redact pdf",
    secondaryKeywords: ["how to redact a pdf", "pdf redaction", "redact pdf free", "black out text in pdf"],
    questionKeywords: ["how to redact a pdf", "how to black out text in pdf"],
    volume: 3500,
    kd: 12,
    cpc: 1.80,
    features: [
      { icon: "EyeOff", title: "True Redaction", description: "Data is erased, not just covered" },
      { icon: "Shield", title: "Secure", description: "Processed locally in your browser" },
      { icon: "Paintbrush", title: "Easy Selection", description: "Draw boxes over content to redact" },
    ],
    howToSteps: [
      { step: 1, title: "Upload PDF", description: "Select the PDF containing sensitive information" },
      { step: 2, title: "Select content", description: "Draw rectangles over text or images to redact" },
      { step: 3, title: "Apply & download", description: "Click Redact to permanently remove content and download" },
    ],
    faqs: [
      { question: "How do I redact a PDF?", answer: "Upload your PDF, draw rectangles over sensitive content, then click Redact. The content is permanently removed." },
      { question: "Is PDF redaction permanent?", answer: "Yes, our tool performs true redaction that erases data. Unlike highlighting in black, the underlying text is completely removed." },
      { question: "Can redacted content be recovered?", answer: "No, properly redacted content is permanently erased from the PDF. There is no way to recover it." },
      { question: "Is my data secure?", answer: "Yes, all processing happens in your browser. Your files are never uploaded to any server." },
    ],
    relatedTools: ["unlock-pdf", "flatten-pdf", "compress-pdf"],
    toolType: "redact",
    acceptedFormats: [".pdf"],
    outputFormat: ".pdf",
    lastUpdated: "2025-12",
    tier: 1,
  },

  {
    id: "sign-pdf",
    slug: "sign-pdf",
    name: "Sign PDF",
    action: "Sign",
    category: "forms",
    answerCapsule: "Add your signature to any PDF. Draw, type, or upload your signature and place it anywhere on the document—free, no account required.",
    title: "Sign PDF - Add Signature to PDF Free Online",
    metaDescription: "Sign PDF documents online for free. Draw, type, or upload your signature. No registration required, works on any device.",
    h1: "Sign PDF Online Free",
    primaryKeyword: "sign pdf",
    secondaryKeywords: ["how to sign a pdf", "esign pdf", "sign pdf online", "electronic signature pdf", "add signature to pdf"],
    questionKeywords: ["how to sign a pdf", "how to electronically sign a pdf", "how to digitally sign a pdf"],
    volume: 12000,
    kd: 31,
    cpc: 1.10,
    features: [
      { icon: "Pen", title: "Draw Signature", description: "Use mouse or touchscreen to draw" },
      { icon: "Type", title: "Type Signature", description: "Type your name in signature fonts" },
      { icon: "Upload", title: "Upload Image", description: "Use an existing signature image" },
      { icon: "Move", title: "Position Anywhere", description: "Drag to place signature on any page" },
    ],
    howToSteps: [
      { step: 1, title: "Upload PDF", description: "Select the document you need to sign" },
      { step: 2, title: "Create signature", description: "Draw, type, or upload your signature" },
      { step: 3, title: "Place signature", description: "Click where you want to add your signature" },
      { step: 4, title: "Download", description: "Save your signed PDF" },
    ],
    faqs: [
      { question: "How do I sign a PDF?", answer: "Upload your PDF, create your signature by drawing or typing, then click to place it on the document. Download when done." },
      { question: "Is an electronic signature legally binding?", answer: "Yes, electronic signatures are legally valid in most countries under laws like ESIGN (US) and eIDAS (EU) for most documents." },
      { question: "Can I sign a PDF on my phone?", answer: "Yes, our tool works on any device with a browser. You can draw your signature with your finger on touchscreens." },
      { question: "Do I need to create an account?", answer: "No, you can sign PDFs immediately without registration or login." },
    ],
    relatedTools: ["fill-pdf", "edit-pdf", "flatten-pdf"],
    toolType: "sign",
    acceptedFormats: [".pdf"],
    outputFormat: ".pdf",
    lastUpdated: "2025-12",
    tier: 1,
  },

  {
    id: "rotate-pdf",
    slug: "rotate-pdf",
    name: "Rotate PDF",
    action: "Rotate",
    category: "manipulation",
    answerCapsule: "Rotate PDF pages 90° or 180°. Fix upside-down scans, change page orientation, or reorganize your document—free and instant.",
    title: "Rotate PDF - Turn PDF Pages Free Online",
    metaDescription: "Rotate PDF pages online for free. Turn pages 90° or 180° to fix orientation. Rotate all pages or select specific ones.",
    h1: "Rotate PDF Online Free",
    primaryKeyword: "rotate pdf",
    secondaryKeywords: ["pdf rotate", "how to rotate a pdf", "rotate pdf pages", "turn pdf sideways"],
    questionKeywords: ["how to rotate a pdf", "how to rotate pdf and save"],
    volume: 8100,
    kd: 34,
    cpc: 0.07,
    features: [
      { icon: "RotateCw", title: "90° Rotation", description: "Rotate clockwise or counter-clockwise" },
      { icon: "RotateCcw", title: "180° Flip", description: "Turn pages upside-down" },
      { icon: "FileCheck", title: "Selective Rotation", description: "Rotate all pages or specific ones" },
    ],
    howToSteps: [
      { step: 1, title: "Upload PDF", description: "Select the PDF you need to rotate" },
      { step: 2, title: "Choose rotation", description: "Select 90° left, 90° right, or 180°" },
      { step: 3, title: "Select pages", description: "Apply to all pages or specific ones" },
      { step: 4, title: "Download", description: "Save your rotated PDF" },
    ],
    faqs: [
      { question: "How do I rotate a PDF?", answer: "Upload your PDF, choose the rotation angle (90° or 180°), select which pages to rotate, then download." },
      { question: "Can I rotate just one page?", answer: "Yes, you can select specific pages to rotate while leaving others unchanged." },
      { question: "How do I save a rotated PDF?", answer: "After rotating, click Download to save the PDF with your changes permanently applied." },
      { question: "Why is my scanned PDF sideways?", answer: "Scanners sometimes save pages in the wrong orientation. Use this tool to fix the rotation permanently." },
    ],
    relatedTools: ["crop-pdf", "split-pdf", "merge-pdf"],
    toolType: "rotate",
    acceptedFormats: [".pdf"],
    outputFormat: ".pdf",
    lastUpdated: "2025-12",
    tier: 1,
  },

  {
    id: "unlock-pdf",
    slug: "unlock-pdf",
    name: "Unlock PDF",
    action: "Unlock",
    category: "security",
    answerCapsule: "Remove password protection from PDF files. Unlock PDFs to enable printing, copying, and editing—if you have the password.",
    title: "Unlock PDF - Remove Password Protection Free",
    metaDescription: "Unlock password-protected PDF files online. Remove restrictions on printing, copying, and editing. Free, secure, instant.",
    h1: "Unlock PDF Online Free",
    primaryKeyword: "unlock pdf",
    secondaryKeywords: ["remove password from pdf", "pdf password remover", "unprotect pdf", "remove pdf password"],
    questionKeywords: ["how to unlock a pdf", "how to remove password from pdf"],
    volume: 12000,
    kd: 18,
    cpc: 0.70,
    features: [
      { icon: "Unlock", title: "Remove Passwords", description: "Unlock password-protected PDFs" },
      { icon: "Printer", title: "Enable Printing", description: "Remove print restrictions" },
      { icon: "Copy", title: "Enable Copying", description: "Remove copy/paste restrictions" },
    ],
    howToSteps: [
      { step: 1, title: "Upload PDF", description: "Select your password-protected PDF" },
      { step: 2, title: "Enter password", description: "Provide the document password if required" },
      { step: 3, title: "Unlock & download", description: "Download the unlocked PDF" },
    ],
    faqs: [
      { question: "How do I unlock a PDF?", answer: "Upload the protected PDF, enter the password if prompted, and download the unlocked version without restrictions." },
      { question: "Can I unlock a PDF without the password?", answer: "No, you need the document password to unlock it. We don't crack passwords." },
      { question: "What restrictions can be removed?", answer: "You can remove restrictions on printing, copying text, editing, and form filling." },
      { question: "Is this legal?", answer: "Yes, if you have the password and permission to access the document. This tool is for legitimate use only." },
    ],
    relatedTools: ["protect-pdf", "redact-pdf", "flatten-pdf"],
    toolType: "unlock",
    acceptedFormats: [".pdf"],
    outputFormat: ".pdf",
    lastUpdated: "2025-12",
    tier: 1,
  },

  {
    id: "annotate-pdf",
    slug: "annotate-pdf",
    name: "Annotate PDF",
    action: "Annotate",
    category: "annotation",
    answerCapsule: "Add highlights, notes, and comments to any PDF. Mark up documents for review, study, or collaboration—works in your browser.",
    title: "Annotate PDF - Add Highlights & Notes Free Online",
    metaDescription: "Annotate PDF files online for free. Add highlights, text notes, and comments. Perfect for document review and collaboration.",
    h1: "Annotate PDF Online Free",
    primaryKeyword: "annotate pdf",
    secondaryKeywords: ["how to annotate a pdf", "pdf annotation", "mark up pdf", "add notes to pdf"],
    questionKeywords: ["how to annotate a pdf", "how to annotate a pdf on mac"],
    volume: 1600,
    kd: 16,
    cpc: 1.60,
    features: [
      { icon: "Highlighter", title: "Highlight Text", description: "Multiple colors available" },
      { icon: "MessageSquare", title: "Add Notes", description: "Insert text comments anywhere" },
      { icon: "Strikethrough", title: "Strikethrough", description: "Mark text for deletion" },
    ],
    howToSteps: [
      { step: 1, title: "Upload PDF", description: "Select the document to annotate" },
      { step: 2, title: "Add annotations", description: "Highlight, comment, or mark up content" },
      { step: 3, title: "Download", description: "Save your annotated PDF" },
    ],
    faqs: [
      { question: "How do I annotate a PDF?", answer: "Upload your PDF, select text to highlight or click to add notes, then download the annotated document." },
      { question: "Can I highlight in different colors?", answer: "Yes, we offer multiple highlight colors including yellow, green, blue, pink, and orange." },
      { question: "Will annotations print?", answer: "Yes, highlights and visible annotations will appear when you print the PDF." },
      { question: "Can others see my annotations?", answer: "Yes, annotations are saved in the PDF and visible to anyone who opens the file." },
    ],
    relatedTools: ["highlight-pdf", "edit-pdf", "sign-pdf"],
    toolType: "annotate",
    acceptedFormats: [".pdf"],
    outputFormat: ".pdf",
    lastUpdated: "2025-12",
    tier: 1,
  },

  {
    id: "highlight-pdf",
    slug: "highlight-pdf",
    name: "Highlight PDF",
    action: "Highlight",
    category: "annotation",
    answerCapsule: "Highlight text in any PDF with multiple colors. Select text to mark important passages for study, review, or reference.",
    title: "Highlight PDF - Mark Up Text Free Online",
    metaDescription: "Highlight text in PDF files online for free. Multiple colors available. Perfect for studying, reviewing documents, or marking important sections.",
    h1: "Highlight PDF Online Free",
    primaryKeyword: "highlight pdf",
    secondaryKeywords: ["how to highlight a pdf", "pdf highlighter", "highlight text in pdf"],
    questionKeywords: ["how to highlight a pdf", "how to highlight text in a pdf"],
    volume: 1300,
    kd: 2,
    cpc: 1.10,
    features: [
      { icon: "Highlighter", title: "Multiple Colors", description: "Yellow, green, blue, pink, orange" },
      { icon: "MousePointer", title: "Select & Highlight", description: "Simply select text to highlight" },
      { icon: "Layers", title: "Layer Control", description: "Remove highlights anytime before saving" },
    ],
    howToSteps: [
      { step: 1, title: "Upload PDF", description: "Select the document to highlight" },
      { step: 2, title: "Select text", description: "Click and drag to select text" },
      { step: 3, title: "Choose color", description: "Pick your highlight color" },
      { step: 4, title: "Download", description: "Save your highlighted PDF" },
    ],
    faqs: [
      { question: "How do I highlight a PDF?", answer: "Upload your PDF, select the text you want to highlight, choose a color, and download. Repeat for multiple highlights." },
      { question: "What highlight colors are available?", answer: "Yellow, green, blue, pink, and orange. Yellow is the default." },
      { question: "Can I remove highlights?", answer: "Yes, click on a highlight to select it, then delete. You can edit highlights before downloading." },
      { question: "Do highlights work on scanned PDFs?", answer: "No, highlights only work on PDFs with selectable text. Scanned documents need OCR first." },
    ],
    relatedTools: ["annotate-pdf", "edit-pdf", "sign-pdf"],
    toolType: "highlight",
    acceptedFormats: [".pdf"],
    outputFormat: ".pdf",
    lastUpdated: "2025-12",
    tier: 1,
  },

  {
    id: "crop-pdf",
    slug: "crop-pdf",
    name: "Crop PDF",
    action: "Crop",
    category: "manipulation",
    answerCapsule: "Crop PDF pages to remove margins, white space, or unwanted areas. Resize the visible area of your document instantly.",
    title: "Crop PDF - Remove Margins & Trim Pages Free",
    metaDescription: "Crop PDF pages online for free. Remove margins, trim white space, or resize page boundaries. Works on all pages or selected ones.",
    h1: "Crop PDF Online Free",
    primaryKeyword: "crop pdf",
    secondaryKeywords: ["how to crop a pdf", "pdf crop", "trim pdf", "remove pdf margins"],
    questionKeywords: ["how to crop a pdf", "how to crop pdf pages"],
    volume: 7700,
    kd: 31,
    cpc: 0.30,
    features: [
      { icon: "Crop", title: "Visual Cropping", description: "Drag to define crop area" },
      { icon: "Maximize2", title: "Remove Margins", description: "Trim white space automatically" },
      { icon: "FileCheck", title: "Batch Crop", description: "Apply to all pages at once" },
    ],
    howToSteps: [
      { step: 1, title: "Upload PDF", description: "Select the PDF to crop" },
      { step: 2, title: "Set crop area", description: "Drag the crop handles or enter dimensions" },
      { step: 3, title: "Apply to pages", description: "Crop all pages or select specific ones" },
      { step: 4, title: "Download", description: "Save your cropped PDF" },
    ],
    faqs: [
      { question: "How do I crop a PDF?", answer: "Upload your PDF, drag the crop handles to define the area you want to keep, then download the cropped version." },
      { question: "Can I crop different pages differently?", answer: "The same crop area is applied to selected pages. For different crops, process pages separately." },
      { question: "Does cropping reduce file size?", answer: "Usually no—the content outside the crop area may still be in the file. Use Compress PDF to reduce size." },
      { question: "Can I undo a crop?", answer: "Not after downloading. The original content outside the crop area is removed. Keep your original file." },
    ],
    relatedTools: ["rotate-pdf", "resize-pdf", "split-pdf"],
    toolType: "crop",
    acceptedFormats: [".pdf"],
    outputFormat: ".pdf",
    lastUpdated: "2025-12",
    tier: 1,
  },

  {
    id: "extract-pdf-pages",
    slug: "extract-pdf-pages",
    name: "Extract PDF Pages",
    action: "Extract",
    category: "manipulation",
    answerCapsule: "Extract specific pages from a PDF into a new document. Select the pages you need and download them as a separate file.",
    title: "Extract PDF Pages - Pull Pages from PDF Free",
    metaDescription: "Extract pages from PDF files online for free. Select specific pages and save them as a new PDF. No software installation needed.",
    h1: "Extract PDF Pages Online Free",
    primaryKeyword: "extract pages from pdf",
    secondaryKeywords: ["how to extract pages from pdf", "extract pdf pages", "pull pages from pdf", "save specific pages from pdf"],
    questionKeywords: ["how to extract pages from pdf", "how to save specific pages from a pdf"],
    volume: 3100,
    kd: 20,
    cpc: 0.50,
    features: [
      { icon: "FileOutput", title: "Select Pages", description: "Choose exactly which pages to extract" },
      { icon: "Layers", title: "Visual Preview", description: "See page thumbnails before extracting" },
      { icon: "Download", title: "New PDF", description: "Extracted pages saved as new file" },
    ],
    howToSteps: [
      { step: 1, title: "Upload PDF", description: "Select the PDF containing pages to extract" },
      { step: 2, title: "Select pages", description: "Click pages or enter page numbers (e.g., 1-3, 5, 7)" },
      { step: 3, title: "Extract", description: "Click Extract to create new PDF with selected pages" },
      { step: 4, title: "Download", description: "Save your extracted pages" },
    ],
    faqs: [
      { question: "How do I extract pages from a PDF?", answer: "Upload your PDF, select the pages you want (click or enter page numbers), then extract and download them as a new PDF." },
      { question: "Can I extract non-consecutive pages?", answer: "Yes, select any combination like pages 1, 3, 5-7, 10." },
      { question: "Does this modify my original PDF?", answer: "No, your original file is unchanged. Extracted pages are saved as a new PDF." },
      { question: "What's the difference between extract and split?", answer: "Extract creates one new PDF with selected pages. Split divides a PDF into multiple separate files." },
    ],
    relatedTools: ["split-pdf", "delete-pdf-pages", "merge-pdf"],
    toolType: "extract",
    acceptedFormats: [".pdf"],
    outputFormat: ".pdf",
    lastUpdated: "2025-12",
    tier: 1,
  },
];
```

### Tier 2: Core Tools (High Volume)

```typescript
const tier2Tools: PDFTool[] = [
  {
    id: "merge-pdf",
    slug: "merge-pdf",
    name: "Merge PDF",
    action: "Merge",
    category: "manipulation",
    answerCapsule: "Combine multiple PDFs into one document. Drag, drop, arrange, and download—free, no signup required.",
    title: "Merge PDF - Combine PDF Files Free Online",
    metaDescription: "Merge PDF files online for free. Combine multiple PDFs into one document in seconds. No registration, no watermarks, no limits.",
    h1: "Merge PDF Files Online Free",
    primaryKeyword: "merge pdf",
    secondaryKeywords: ["combine pdf", "pdf merger", "pdf combiner", "join pdf files", "merge pdf files", "combine pdf files"],
    questionKeywords: ["how to merge pdf files", "how to combine pdf files"],
    volume: 126000,
    kd: 71,
    cpc: 0.60,
    features: [
      { icon: "Layers", title: "Unlimited Files", description: "Merge as many PDFs as you need" },
      { icon: "GripVertical", title: "Drag to Reorder", description: "Arrange files in any order" },
      { icon: "Zap", title: "Instant Processing", description: "Merge happens in your browser" },
      { icon: "Shield", title: "Secure & Private", description: "Files never leave your device" },
    ],
    howToSteps: [
      { step: 1, title: "Select files", description: "Click 'Select Files' or drag and drop your PDFs" },
      { step: 2, title: "Arrange order", description: "Drag files to reorder them as needed" },
      { step: 3, title: "Merge", description: "Click Merge to combine all files" },
      { step: 4, title: "Download", description: "Save your merged PDF" },
    ],
    faqs: [
      { question: "How do I merge PDF files?", answer: "Upload your PDFs by dragging and dropping or clicking Select Files. Arrange them in order, click Merge, then download your combined document." },
      { question: "Is it free to merge PDFs?", answer: "Yes, completely free with no limits on file size or number of files. No registration required." },
      { question: "Are my files secure?", answer: "Yes, all processing happens in your browser. Files are never uploaded to any server." },
      { question: "Can I change the page order?", answer: "Yes, drag files to rearrange them before merging. The final PDF follows your arranged order." },
      { question: "What's the maximum file size?", answer: "There's no hard limit, but very large files may be slow to process depending on your device." },
    ],
    relatedTools: ["split-pdf", "compress-pdf", "rotate-pdf", "reorder-pdf-pages"],
    toolType: "merge",
    acceptedFormats: [".pdf"],
    outputFormat: ".pdf",
    lastUpdated: "2025-12",
    tier: 2,
  },

  {
    id: "split-pdf",
    slug: "split-pdf",
    name: "Split PDF",
    action: "Split",
    category: "manipulation",
    answerCapsule: "Split a PDF into multiple separate files. Divide by page ranges, extract every page, or split at specific points.",
    title: "Split PDF - Divide PDF into Multiple Files Free",
    metaDescription: "Split PDF files online for free. Divide one PDF into multiple documents by page range or extract individual pages.",
    h1: "Split PDF Online Free",
    primaryKeyword: "split pdf",
    secondaryKeywords: ["pdf split", "split pdf pages", "divide pdf", "separate pdf pages", "split pdf into multiple files"],
    questionKeywords: ["how to split a pdf", "how to split pdf pages", "how to split a pdf into multiple files"],
    volume: 39000,
    kd: 45,
    cpc: 0.35,
    features: [
      { icon: "Scissors", title: "Split by Range", description: "Define custom page ranges" },
      { icon: "FileStack", title: "Extract All Pages", description: "Split into individual pages" },
      { icon: "Split", title: "Split at Points", description: "Divide at specific pages" },
    ],
    howToSteps: [
      { step: 1, title: "Upload PDF", description: "Select the PDF you want to split" },
      { step: 2, title: "Choose split method", description: "Split by range, every N pages, or extract all" },
      { step: 3, title: "Define ranges", description: "Enter page numbers or ranges (e.g., 1-5, 6-10)" },
      { step: 4, title: "Download", description: "Save your split PDF files" },
    ],
    faqs: [
      { question: "How do I split a PDF?", answer: "Upload your PDF, choose how to split (by page range, at specific pages, or every N pages), then download the resulting files." },
      { question: "Can I split into individual pages?", answer: "Yes, choose 'Extract all pages' to create a separate PDF for each page." },
      { question: "How do I specify page ranges?", answer: "Enter ranges like 1-5, 6-10, 11-15. Each range becomes a separate PDF file." },
      { question: "Is the original file modified?", answer: "No, the original PDF remains unchanged. Split creates new files." },
    ],
    relatedTools: ["merge-pdf", "extract-pdf-pages", "delete-pdf-pages"],
    toolType: "split",
    acceptedFormats: [".pdf"],
    outputFormat: ".pdf",
    lastUpdated: "2025-12",
    tier: 2,
  },

  {
    id: "compress-pdf",
    slug: "compress-pdf",
    name: "Compress PDF",
    action: "Compress",
    category: "manipulation",
    answerCapsule: "Reduce PDF file size by up to 90% while maintaining quality. Perfect for email attachments and faster uploads.",
    title: "Compress PDF - Reduce PDF Size Free Online",
    metaDescription: "Compress PDF files online for free. Reduce file size up to 90% while keeping quality. Perfect for email and web uploads.",
    h1: "Compress PDF Online Free",
    primaryKeyword: "compress pdf",
    secondaryKeywords: ["pdf compressor", "reduce pdf size", "shrink pdf", "compress pdf file", "make pdf smaller"],
    questionKeywords: ["how to compress a pdf", "how to reduce pdf file size"],
    volume: 105000,
    kd: 66,
    cpc: 0.70,
    features: [
      { icon: "Minimize2", title: "Up to 90% Smaller", description: "Significant file size reduction" },
      { icon: "Image", title: "Quality Options", description: "Balance size vs quality" },
      { icon: "Mail", title: "Email Ready", description: "Perfect for attachments" },
    ],
    howToSteps: [
      { step: 1, title: "Upload PDF", description: "Select the PDF to compress" },
      { step: 2, title: "Choose quality", description: "Select compression level (high/medium/low quality)" },
      { step: 3, title: "Compress", description: "Click to reduce file size" },
      { step: 4, title: "Download", description: "Save your compressed PDF" },
    ],
    faqs: [
      { question: "How do I compress a PDF?", answer: "Upload your PDF, select compression quality (higher quality = larger file), then download the compressed version." },
      { question: "How much can file size be reduced?", answer: "Typically 50-90% depending on content. PDFs with images compress more than text-only documents." },
      { question: "Will compression affect quality?", answer: "Some quality loss occurs, especially in images. Choose 'High quality' for minimal loss or 'Maximum compression' for smallest file." },
      { question: "Why compress PDFs?", answer: "Smaller files are easier to email, upload faster, and take less storage space." },
    ],
    relatedTools: ["merge-pdf", "resize-pdf", "flatten-pdf"],
    toolType: "compress",
    acceptedFormats: [".pdf"],
    outputFormat: ".pdf",
    lastUpdated: "2025-12",
    tier: 2,
  },

  {
    id: "fill-pdf",
    slug: "fill-pdf",
    name: "Fill PDF",
    action: "Fill",
    category: "forms",
    answerCapsule: "Fill out PDF forms online. Type into form fields, add checkmarks, select options, and save your completed document.",
    title: "Fill PDF Forms - Complete PDF Forms Free Online",
    metaDescription: "Fill out PDF forms online for free. Type in text fields, check boxes, select options. No software needed, works on any device.",
    h1: "Fill PDF Forms Online Free",
    primaryKeyword: "fill pdf",
    secondaryKeywords: ["pdf filler", "fill out pdf", "fill pdf form", "fillable pdf", "complete pdf form"],
    questionKeywords: ["how to fill out a pdf form", "how to make a pdf fillable"],
    volume: 900,
    kd: 65,
    cpc: 1.20,
    features: [
      { icon: "FormInput", title: "Text Fields", description: "Type in any text field" },
      { icon: "CheckSquare", title: "Checkboxes", description: "Check and uncheck boxes" },
      { icon: "List", title: "Dropdowns", description: "Select from dropdown options" },
      { icon: "Radio", title: "Radio Buttons", description: "Choose single options" },
    ],
    howToSteps: [
      { step: 1, title: "Upload PDF", description: "Select the PDF form to fill" },
      { step: 2, title: "Fill fields", description: "Click fields to enter text, check boxes, make selections" },
      { step: 3, title: "Review", description: "Check all fields are completed correctly" },
      { step: 4, title: "Download", description: "Save your completed form" },
    ],
    faqs: [
      { question: "How do I fill out a PDF form?", answer: "Upload the PDF form, click on fields to fill them in, then download the completed document." },
      { question: "Can I fill non-fillable PDFs?", answer: "For non-fillable PDFs, use our Edit PDF tool to add text anywhere on the document." },
      { question: "Are my form entries saved?", answer: "Yes, when you download, all entries are saved in the PDF." },
      { question: "Can I sign the form too?", answer: "Yes, use our Sign PDF tool after filling, or add a signature using the annotation tools." },
    ],
    relatedTools: ["sign-pdf", "edit-pdf", "flatten-pdf"],
    toolType: "fill",
    acceptedFormats: [".pdf"],
    outputFormat: ".pdf",
    lastUpdated: "2025-12",
    tier: 2,
  },

  {
    id: "edit-pdf",
    slug: "edit-pdf",
    name: "Edit PDF",
    action: "Edit",
    category: "annotation",
    answerCapsule: "Edit any PDF directly in your browser. Add text, images, annotations, and signatures. No software installation required.",
    title: "Edit PDF - Free Online PDF Editor",
    metaDescription: "Edit PDF files online for free. Add text, images, highlights, and signatures. Full-featured PDF editor that works in your browser.",
    h1: "Edit PDF Online Free",
    primaryKeyword: "edit pdf",
    secondaryKeywords: ["pdf editor", "edit pdf free", "online pdf editor", "modify pdf", "change pdf"],
    questionKeywords: ["how to edit a pdf", "how to edit a pdf for free", "how to edit a pdf on mac"],
    volume: 71000,
    kd: 72,
    cpc: 1.40,
    features: [
      { icon: "Type", title: "Add Text", description: "Insert text anywhere on pages" },
      { icon: "Image", title: "Add Images", description: "Insert images and logos" },
      { icon: "Highlighter", title: "Annotate", description: "Highlight, underline, strikethrough" },
      { icon: "Pen", title: "Sign", description: "Add your signature" },
      { icon: "Eraser", title: "Redact", description: "Black out sensitive info" },
    ],
    howToSteps: [
      { step: 1, title: "Upload PDF", description: "Select the PDF you want to edit" },
      { step: 2, title: "Choose tool", description: "Select text, image, annotation, or signature tool" },
      { step: 3, title: "Make edits", description: "Click to add content, drag to position" },
      { step: 4, title: "Download", description: "Save your edited PDF" },
    ],
    faqs: [
      { question: "How do I edit a PDF?", answer: "Upload your PDF, select an editing tool (text, image, highlight, etc.), click to add content, then download your edited document." },
      { question: "Can I edit existing text in a PDF?", answer: "You can add new text and cover existing text, but directly modifying embedded text requires the original source file." },
      { question: "Is this a full PDF editor?", answer: "Yes, you can add text, images, highlights, signatures, and redactions. For text extraction, use our OCR tool." },
      { question: "Do I need to install software?", answer: "No, everything works in your browser. No downloads or installations required." },
    ],
    relatedTools: ["annotate-pdf", "sign-pdf", "fill-pdf", "redact-pdf"],
    toolType: "edit",
    acceptedFormats: [".pdf"],
    outputFormat: ".pdf",
    lastUpdated: "2025-12",
    tier: 2,
  },

  {
    id: "delete-pdf-pages",
    slug: "delete-pdf-pages",
    name: "Delete PDF Pages",
    action: "Delete",
    category: "manipulation",
    answerCapsule: "Remove unwanted pages from any PDF. Select pages to delete and download the updated document instantly.",
    title: "Delete PDF Pages - Remove Pages from PDF Free",
    metaDescription: "Delete pages from PDF files online for free. Remove unwanted pages with a single click. Keep your original file intact.",
    h1: "Delete PDF Pages Online Free",
    primaryKeyword: "delete pages from pdf",
    secondaryKeywords: ["remove pages from pdf", "delete pdf pages", "remove pdf pages"],
    questionKeywords: ["how to delete pages from pdf", "how to remove pages from a pdf"],
    volume: 5900,
    kd: 31,
    cpc: 0.25,
    features: [
      { icon: "Trash2", title: "Quick Delete", description: "Click pages to remove them" },
      { icon: "Eye", title: "Visual Preview", description: "See all pages before deleting" },
      { icon: "RotateCcw", title: "Undo Support", description: "Restore pages before downloading" },
    ],
    howToSteps: [
      { step: 1, title: "Upload PDF", description: "Select the PDF with pages to remove" },
      { step: 2, title: "Select pages", description: "Click on pages you want to delete" },
      { step: 3, title: "Delete", description: "Click Delete to remove selected pages" },
      { step: 4, title: "Download", description: "Save your updated PDF" },
    ],
    faqs: [
      { question: "How do I delete pages from a PDF?", answer: "Upload your PDF, click on the pages you want to remove to select them, then click Delete and download." },
      { question: "Can I delete multiple pages at once?", answer: "Yes, select all the pages you want to remove, then delete them together." },
      { question: "Is my original file changed?", answer: "No, the original remains untouched. You download a new PDF without the deleted pages." },
      { question: "Can I undo deleted pages?", answer: "Yes, before downloading you can restore deleted pages. After download, deletion is permanent." },
    ],
    relatedTools: ["extract-pdf-pages", "split-pdf", "merge-pdf"],
    toolType: "delete",
    acceptedFormats: [".pdf"],
    outputFormat: ".pdf",
    lastUpdated: "2025-12",
    tier: 2,
  },

  {
    id: "reorder-pdf-pages",
    slug: "reorder-pdf-pages",
    name: "Reorder PDF Pages",
    action: "Reorder",
    category: "manipulation",
    answerCapsule: "Rearrange pages in any PDF by dragging and dropping. Change page order without splitting or merging files.",
    title: "Reorder PDF Pages - Rearrange PDF Pages Free",
    metaDescription: "Reorder PDF pages online for free. Drag and drop to rearrange pages in any order. No software needed.",
    h1: "Reorder PDF Pages Online Free",
    primaryKeyword: "reorder pdf pages",
    secondaryKeywords: ["rearrange pdf pages", "change pdf page order", "reorganize pdf", "move pdf pages"],
    questionKeywords: ["how to rearrange pdf pages", "how to reorder pages in a pdf"],
    volume: 1200,
    kd: 17,
    cpc: 0.70,
    features: [
      { icon: "GripVertical", title: "Drag & Drop", description: "Visually rearrange pages" },
      { icon: "LayoutGrid", title: "Thumbnail View", description: "See all pages at once" },
      { icon: "ArrowUpDown", title: "Quick Move", description: "Move pages to start or end" },
    ],
    howToSteps: [
      { step: 1, title: "Upload PDF", description: "Select the PDF to reorder" },
      { step: 2, title: "View pages", description: "See thumbnail previews of all pages" },
      { step: 3, title: "Drag to reorder", description: "Drag pages to their new positions" },
      { step: 4, title: "Download", description: "Save your reordered PDF" },
    ],
    faqs: [
      { question: "How do I reorder PDF pages?", answer: "Upload your PDF, then drag and drop page thumbnails to rearrange them in your desired order. Download when done." },
      { question: "Can I move a page to the beginning?", answer: "Yes, drag any page to the first position, or use the 'Move to start' option." },
      { question: "Does this work with large PDFs?", answer: "Yes, though very large PDFs may take longer to load previews." },
      { question: "Can I also delete pages while reordering?", answer: "Use our Delete PDF Pages tool for that, or do both operations sequentially." },
    ],
    relatedTools: ["merge-pdf", "split-pdf", "delete-pdf-pages", "rotate-pdf"],
    toolType: "reorder",
    acceptedFormats: [".pdf"],
    outputFormat: ".pdf",
    lastUpdated: "2025-12",
    tier: 2,
  },
];
```

### Tier 3: Conversion Tools

```typescript
const tier3Tools: PDFTool[] = [
  {
    id: "jpg-to-pdf",
    slug: "jpg-to-pdf",
    name: "JPG to PDF",
    action: "Convert",
    category: "conversion",
    answerCapsule: "Convert JPG images to PDF. Combine multiple images into one PDF or convert single images—free, instant, no quality loss.",
    title: "JPG to PDF - Convert Images to PDF Free Online",
    metaDescription: "Convert JPG to PDF online for free. Turn images into PDF documents. Combine multiple JPGs into one PDF. No quality loss.",
    h1: "Convert JPG to PDF Online Free",
    primaryKeyword: "jpg to pdf",
    secondaryKeywords: ["convert jpg to pdf", "image to pdf", "jpeg to pdf", "photo to pdf"],
    questionKeywords: ["how to convert jpg to pdf", "how to make a jpg into a pdf"],
    volume: 174000,
    kd: 70,
    cpc: 0.25,
    features: [
      { icon: "Image", title: "Multiple Images", description: "Convert several JPGs at once" },
      { icon: "Layers", title: "Combine into One", description: "Merge all images into single PDF" },
      { icon: "Settings", title: "Page Options", description: "Set page size and orientation" },
    ],
    howToSteps: [
      { step: 1, title: "Select images", description: "Upload one or more JPG files" },
      { step: 2, title: "Arrange order", description: "Drag to reorder images" },
      { step: 3, title: "Set options", description: "Choose page size and margins" },
      { step: 4, title: "Convert & download", description: "Get your PDF instantly" },
    ],
    faqs: [
      { question: "How do I convert JPG to PDF?", answer: "Upload your JPG images, arrange them in order, optionally set page size, then download as PDF." },
      { question: "Can I convert multiple images?", answer: "Yes, upload multiple JPGs and they'll be combined into a single multi-page PDF." },
      { question: "Will image quality be reduced?", answer: "No, images are embedded at their original quality. The PDF may be larger than the original images." },
      { question: "What image formats are supported?", answer: "JPG, JPEG, PNG, and most common image formats." },
    ],
    relatedTools: ["pdf-to-jpg", "png-to-pdf", "merge-pdf"],
    toolType: "convert",
    acceptedFormats: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
    outputFormat: ".pdf",
    lastUpdated: "2025-12",
    tier: 3,
  },

  {
    id: "pdf-to-jpg",
    slug: "pdf-to-jpg",
    name: "PDF to JPG",
    action: "Convert",
    category: "conversion",
    answerCapsule: "Convert PDF pages to JPG images. Extract all pages as high-quality images or select specific pages to convert.",
    title: "PDF to JPG - Convert PDF to Images Free Online",
    metaDescription: "Convert PDF to JPG online for free. Turn PDF pages into high-quality images. Download individual pages or all at once.",
    h1: "Convert PDF to JPG Online Free",
    primaryKeyword: "pdf to jpg",
    secondaryKeywords: ["convert pdf to jpg", "pdf to image", "pdf to jpeg", "extract images from pdf"],
    questionKeywords: ["how to convert pdf to jpg", "how to save pdf as image"],
    volume: 162000,
    kd: 62,
    cpc: 0.15,
    features: [
      { icon: "Image", title: "High Quality", description: "Crisp, clear image output" },
      { icon: "FileStack", title: "All Pages", description: "Convert entire PDF at once" },
      { icon: "Download", title: "ZIP Download", description: "Get all images in one ZIP" },
    ],
    howToSteps: [
      { step: 1, title: "Upload PDF", description: "Select the PDF to convert" },
      { step: 2, title: "Choose quality", description: "Select image resolution (72-300 DPI)" },
      { step: 3, title: "Select pages", description: "Convert all pages or specific ones" },
      { step: 4, title: "Download", description: "Get images individually or as ZIP" },
    ],
    faqs: [
      { question: "How do I convert PDF to JPG?", answer: "Upload your PDF, choose quality settings, select which pages to convert, then download the JPG images." },
      { question: "What resolution are the images?", answer: "You can choose from 72 DPI (web) to 300 DPI (print quality). Higher DPI means larger files." },
      { question: "Can I convert specific pages only?", answer: "Yes, select individual pages or enter page ranges to convert." },
      { question: "How do I download multiple images?", answer: "Multiple pages are downloaded as a ZIP file containing all the JPG images." },
    ],
    relatedTools: ["jpg-to-pdf", "pdf-to-png", "compress-pdf"],
    toolType: "convert",
    acceptedFormats: [".pdf"],
    outputFormat: ".jpg",
    lastUpdated: "2025-12",
    tier: 3,
  },

  // Additional conversion tools follow same pattern:
  // png-to-pdf, pdf-to-png, word-to-pdf, pdf-to-word
];
```

---

## Schema Generation

### Automatic Schema from Tool Data

```typescript
// lib/seo/schema-generator.ts

export function generateToolSchemas(tool: PDFTool): string[] {
  return [
    generateWebApplicationSchema(tool),
    generateFAQSchema(tool.faqs),
    generateHowToSchema(tool),
  ];
}

function generateWebApplicationSchema(tool: PDFTool): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": tool.name,
    "description": tool.answerCapsule,
    "url": `https://domain.com/tools/${tool.slug}`,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Any",
    "browserRequirements": "Requires JavaScript",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": tool.features.map(f => f.title),
  });
}

function generateFAQSchema(faqs: FAQ[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  });
}

function generateHowToSchema(tool: PDFTool): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to ${tool.action} a PDF`,
    "description": tool.answerCapsule,
    "step": tool.howToSteps.map(step => ({
      "@type": "HowToStep",
      "position": step.step,
      "name": step.title,
      "text": step.description
    })),
    "tool": {
      "@type": "HowToTool",
      "name": tool.name
    }
  });
}
```

---

## Internal Linking Strategy

### Topic Clusters

```
                    ┌─────────────┐
                    │  Edit PDF   │ (Hub)
                    │  /edit-pdf  │
                    └──────┬──────┘
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Annotate    │     │   Sign      │     │   Redact    │
│ /annotate   │────▶│  /sign-pdf  │◀────│  /redact    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Fill PDF   │
                    │  /fill-pdf  │
                    └─────────────┘
```

### Link Matrix

| Tool | Links To |
|------|----------|
| merge-pdf | split-pdf, compress-pdf, rotate-pdf, reorder-pdf-pages |
| split-pdf | merge-pdf, extract-pdf-pages, delete-pdf-pages |
| compress-pdf | merge-pdf, resize-pdf, flatten-pdf |
| sign-pdf | fill-pdf, edit-pdf, flatten-pdf |
| edit-pdf | annotate-pdf, sign-pdf, fill-pdf, redact-pdf |
| rotate-pdf | crop-pdf, split-pdf, merge-pdf |
| redact-pdf | unlock-pdf, flatten-pdf, compress-pdf |
| flatten-pdf | compress-pdf, fill-pdf, edit-pdf |

---

## robots.txt

```
# Allow all AI crawlers
User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: GPTBot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Googlebot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

# Sitemap
Sitemap: https://domain.com/sitemap.xml
```

---

## Sitemap Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaporg/schemas/sitemap/0.9">
  <url>
    <loc>https://domain.com/</loc>
    <lastmod>2025-12-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- Tool pages generated from tools.ts -->
  <url>
    <loc>https://domain.com/tools/merge-pdf</loc>
    <lastmod>2025-12-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- ... all other tools ... -->
</urlset>
```

---

## Implementation Priority

### Phase 1: Foundation
1. Create `src/data/tools.ts` with all tool definitions
2. Create schema generation utilities
3. Set up Next.js project with `/tools/[slug]` dynamic routes

### Phase 2: Template
1. Build `ToolLandingPage` component
2. Implement answer capsule section
3. Build FAQ, HowTo, Features sections
4. Add schema injection

### Phase 3: Tools Integration
1. Embed actual PDF tools in landing pages
2. Connect to existing pdf-lib functionality
3. Test each tool works correctly

### Phase 4: SEO Polish
1. Generate sitemap
2. Configure robots.txt
3. Add meta tags and OG images
4. Submit to Bing Webmaster Tools

### Phase 5: Launch & Iterate
1. Deploy and monitor
2. Track AI citations
3. A/B test answer capsules
4. Expand to remaining tools

---

## Success Metrics

- **AI Citations:** Track mentions in ChatGPT, Perplexity, Gemini responses
- **Organic Traffic:** Monitor search console for tool page impressions/clicks
- **Conversion:** Users who complete a tool action after landing on page
- **Freshness:** Automated "Last updated" date refresh monthly
