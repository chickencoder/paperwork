import { PDFDocument } from "pdf-lib";

export interface MergeSource {
  bytes: Uint8Array;
  fileName: string;
}

export interface MergeResult {
  mergedBytes: Uint8Array;
  fileName: string;
}

/**
 * Merge multiple PDF documents into a single document.
 * Pages are added in the order of the sources array.
 */
export async function mergePDFs(sources: MergeSource[]): Promise<MergeResult> {
  if (sources.length === 0) {
    throw new Error("No sources to merge");
  }

  // If only one source, just return it as-is
  if (sources.length === 1) {
    return {
      mergedBytes: sources[0].bytes,
      fileName: sources[0].fileName,
    };
  }

  // Create a new document for the merged result
  const mergedDoc = await PDFDocument.create();

  for (const source of sources) {
    try {
      // Load each source document
      const sourceDoc = await PDFDocument.load(source.bytes, {
        ignoreEncryption: true,
      });

      // Get all page indices
      const pageCount = sourceDoc.getPageCount();
      const pageIndices = Array.from({ length: pageCount }, (_, i) => i);

      // Copy all pages from source to merged document
      const copiedPages = await mergedDoc.copyPages(sourceDoc, pageIndices);

      // Add each copied page to the merged document
      for (const page of copiedPages) {
        mergedDoc.addPage(page);
      }
    } catch (error) {
      console.error(`Failed to merge ${source.fileName}:`, error);
      throw new Error(
        `Failed to merge "${source.fileName}": ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // Save the merged document
  const mergedBytes = await mergedDoc.save();

  // Generate a meaningful filename
  const fileName = generateMergedFileName(sources);

  return {
    mergedBytes: new Uint8Array(mergedBytes),
    fileName,
  };
}

/**
 * Generate a filename for the merged document based on source filenames.
 */
function generateMergedFileName(sources: MergeSource[]): string {
  // Remove .pdf extension from all filenames
  const baseNames = sources.map((s) =>
    s.fileName.replace(/\.pdf$/i, "").trim()
  );

  if (sources.length === 2) {
    // For two files: "file1 + file2.pdf"
    return `${baseNames[0]} + ${baseNames[1]}.pdf`;
  }

  // For more files: "merged (N documents).pdf"
  return `merged (${sources.length} documents).pdf`;
}
