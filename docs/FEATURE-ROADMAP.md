# Paperwork Feature Roadmap

## Overview

Paperwork is a privacy-first, browser-based PDF editor. All processing happens locally—files never leave the user's device.

**Target Users**: Individual consumers & knowledge workers
**Business Model**: Free with usage-based freemium limits

---

## Current Features

- **Annotations**: Text, signatures (draw/type), highlights, strikethroughs, redactions
- **PDF Manipulation**: Form filling, merge documents, flatten/rasterize
- **Multi-document**: Tabbed interface with drag-drop reordering
- **Session Persistence**: Auto-save and restore via IndexedDB
- **Privacy**: 100% local processing, no uploads, no account required

---

## Roadmap

### Phase 1: Table Stakes

| Feature | Description |
|---------|-------------|
| **Page Management** | Rotate, delete, reorder, extract, insert blank, duplicate pages. Thumbnail sidebar with drag-drop. |
| **Split PDF** | Split by page ranges, fixed page count, or extract specific pages. Batch download as ZIP. |
| **Compress PDF** | Quality presets (Web/Standard/Print), show before/after size, image downsampling. |

### Phase 2: Differentiation

| Feature | Description |
|---------|-------------|
| **OCR** | Make scanned PDFs searchable using Tesseract.js. Enable text selection on image-based pages. *Premium candidate.* |
| **Drawing & Shapes** | Freehand pen, rectangle, ellipse, line, arrow. Color and stroke options. |
| **Image Import** | Import JPG/PNG/WEBP as PDF pages. Drag-drop images into document. |

### Phase 3: Professional Polish

| Feature | Description |
|---------|-------------|
| **Sticky Notes** | Add comments anywhere. Author names, filter/list view, export summary. |
| **Stamps & Watermarks** | Preset stamps (APPROVED, DRAFT, etc.), custom text, batch apply. |
| **Export to Images** | Export pages as PNG/JPG. |

### Phase 4: Power Features

| Feature | Description |
|---------|-------------|
| **Password Protection** | Add open password, set permissions, encrypt/decrypt locally. *Premium.* |
| **Compare PDFs** | Side-by-side diff, highlight changes, overlay mode. *Premium.* |
| **Batch Processing** | Batch merge, compress, watermark, flatten. *Premium.* |

---

## Freemium Strategy

**Free Tier**:
- All current annotation features
- Page management (rotate, delete, reorder)
- Merge up to 3 documents
- Split PDF
- Drawing tools
- Basic compression

**Premium Tier**:
- OCR (or 5 pages/month free)
- Unlimited merges
- Batch processing
- Compare PDFs
- Advanced compression
- Password protection

---

## Competitive Advantage

| Feature | Paperwork | Adobe Acrobat | Smallpdf | iLovePDF |
|---------|-----------|---------------|----------|----------|
| 100% Local/Private | Yes | No | No | No |
| Free (no limits) | Yes | No | No | No |
| No Account Required | Yes | No | No | Yes |
| Redaction | Yes | Paid | Paid | No |
| OCR | Planned | Yes | Paid | Paid |

**Key Differentiator**: Privacy + Free + Redaction + OCR = unmatched value
