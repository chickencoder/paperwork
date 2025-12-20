import { useState, useEffect } from "react";
import {
  loadPDF,
  extractPDFMetadata,
  formatMetadataSummary,
  type PDFMetadata,
} from "@paperwork/pdf-lib";

interface UsePDFMetadataResult {
  metadata: PDFMetadata | null;
  summary: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to extract metadata from a PDF file.
 * Returns the metadata object and a formatted summary string.
 */
export function usePDFMetadata(file: File | null): UsePDFMetadataResult {
  const [metadata, setMetadata] = useState<PDFMetadata | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setMetadata(null);
      setSummary(null);
      setError(null);
      return;
    }

    let cancelled = false;

    async function extract() {
      if (!file) return;

      setLoading(true);
      setError(null);

      try {
        // Load the PDF
        const loadedPDF = await loadPDF(file);

        if (cancelled) return;

        // Extract metadata
        const meta = await extractPDFMetadata(loadedPDF);

        if (cancelled) return;

        // Format summary
        const summaryText = formatMetadataSummary(meta);

        setMetadata(meta);
        setSummary(summaryText);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Failed to extract metadata";
        setError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    extract();

    return () => {
      cancelled = true;
    };
  }, [file]);

  return { metadata, summary, loading, error };
}
