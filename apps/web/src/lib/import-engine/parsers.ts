import { excelImportParser } from "./excel-parser";
import type { ImportParser, ImportSource } from "../../types/import-engine";

type ImportSourceOption = {
  value: ImportSource;
  label: string;
  title: string;
  description: string;
  enabled: boolean;
  acceptedExtensions: string[];
  parser?: ImportParser;
};

export const importSourceOptions: ImportSourceOption[] = [
  {
    value: "EXCEL",
    label: "Excel",
    title: "Excel Spreadsheet",
    description: "Import inventory from supplier spreadsheets.",
    enabled: true,
    acceptedExtensions: [".xlsx"],
    parser: excelImportParser,
  },
  {
    value: "CSV",
    label: "CSV (Coming Soon)",
    title: "CSV File",
    description: "Import tabular supplier files exported as CSV.",
    enabled: false,
    acceptedExtensions: [".csv"],
  },
  {
    value: "PDF",
    label: "PDF (Coming Soon)",
    title: "Supplier PDF",
    description: "Import supplier invoices exported as PDF.",
    enabled: false,
    acceptedExtensions: [".pdf"],
  },
  {
    value: "OCR",
    label: "Image / OCR (Coming Soon)",
    title: "Supplier Image",
    description: "Import printed invoices or photos using OCR.",
    enabled: false,
    acceptedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
  },
];

export const getImportSourceOption = (source: ImportSource) =>
  importSourceOptions.find((option) => option.value === source) ??
  importSourceOptions[0];

export const getImportParser = (source: ImportSource) => {
  const option = getImportSourceOption(source);

  if (!option.enabled || !option.parser) {
    throw new Error("Import source is not supported yet.");
  }

  return option.parser;
};

export const getAcceptedFileDescription = (source: ImportSource) =>
  getImportSourceOption(source).acceptedExtensions.join(", ");

export const isAcceptedImportFile = (source: ImportSource, file: File) => {
  const option = getImportSourceOption(source);
  const fileName = file.name.toLowerCase();

  return option.acceptedExtensions.some((extension) =>
    fileName.endsWith(extension),
  );
};
