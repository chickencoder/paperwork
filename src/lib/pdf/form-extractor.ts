export interface ExtractedFormValues {
  [fieldName: string]: string | boolean;
}

/**
 * Extract form field values from the PDFjs-rendered annotation layer DOM elements.
 * This queries the native HTML inputs rendered by PDFjs and extracts their values.
 */
export function extractFormValues(container: HTMLElement): ExtractedFormValues {
  const values: ExtractedFormValues = {};

  // Query all form inputs in annotation layers
  const inputs = container.querySelectorAll(
    ".annotationLayer input, .annotationLayer select, .annotationLayer textarea"
  );

  inputs.forEach((element) => {
    // PDFjs uses data-element-id for field identification
    const fieldName =
      element.getAttribute("data-element-id") ||
      element.getAttribute("name") ||
      element.id;

    if (!fieldName) return;

    if (element instanceof HTMLInputElement) {
      if (element.type === "checkbox") {
        values[fieldName] = element.checked;
      } else if (element.type === "radio") {
        // Only capture if checked
        if (element.checked) {
          // Use the radio group name as key, value as the selected option
          const groupName = element.name || fieldName;
          values[groupName] = element.value;
        }
      } else {
        // Text, number, etc.
        values[fieldName] = element.value;
      }
    } else if (element instanceof HTMLSelectElement) {
      values[fieldName] = element.value;
    } else if (element instanceof HTMLTextAreaElement) {
      values[fieldName] = element.value;
    }
  });

  return values;
}

/**
 * Get field names that exist in the PDF form
 */
export function getFormFieldNames(container: HTMLElement): string[] {
  const names = new Set<string>();

  const inputs = container.querySelectorAll(
    ".annotationLayer input, .annotationLayer select, .annotationLayer textarea"
  );

  inputs.forEach((element) => {
    const fieldName =
      element.getAttribute("data-element-id") ||
      element.getAttribute("name") ||
      element.id;

    if (fieldName) {
      names.add(fieldName);
    }
  });

  return Array.from(names);
}
