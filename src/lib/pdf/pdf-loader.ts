import { PDFDocument, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown } from "pdf-lib";
import type { FormField, FieldType } from "./types";

export interface LoadedPDF {
  document: PDFDocument;
  bytes: Uint8Array;
  pageCount: number;
  formFields: FormField[];
}

export async function loadPDF(file: File): Promise<LoadedPDF> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const document = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const pageCount = document.getPageCount();
  const formFields = extractFormFields(document);

  return {
    document,
    bytes,
    pageCount,
    formFields,
  };
}

function extractFormFields(document: PDFDocument): FormField[] {
  const form = document.getForm();
  const fields = form.getFields();
  const formFields: FormField[] = [];

  for (const field of fields) {
    const name = field.getName();
    const widgets = field.acroField.getWidgets();

    for (let i = 0; i < widgets.length; i++) {
      const widget = widgets[i];
      const rect = widget.getRectangle();
      const pageRef = widget.P();

      // Find which page this widget is on
      let pageIndex = 0;
      if (pageRef) {
        const pages = document.getPages();
        for (let p = 0; p < pages.length; p++) {
          if (pages[p].ref === pageRef) {
            pageIndex = p;
            break;
          }
        }
      }

      let type: FieldType = "text";
      let defaultValue: string | boolean | undefined;
      let options: string[] | undefined;

      if (field instanceof PDFTextField) {
        type = "text";
        defaultValue = field.getText() ?? "";
      } else if (field instanceof PDFCheckBox) {
        type = "checkbox";
        defaultValue = field.isChecked();
      } else if (field instanceof PDFRadioGroup) {
        type = "radio";
        options = field.getOptions();
        defaultValue = field.getSelected() ?? undefined;
      } else if (field instanceof PDFDropdown) {
        type = "dropdown";
        options = field.getOptions();
        const selected = field.getSelected();
        defaultValue = selected.length > 0 ? selected[0] : undefined;
      }

      formFields.push({
        id: `${name}-${i}`,
        type,
        name,
        page: pageIndex,
        rect: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        },
        defaultValue,
        options,
        groupName: type === "radio" ? name : undefined,
      });
    }
  }

  return formFields;
}

export async function loadPDFFromBytes(bytes: Uint8Array): Promise<PDFDocument> {
  return PDFDocument.load(bytes, { ignoreEncryption: true });
}
