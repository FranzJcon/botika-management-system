import { excelImportParser } from "./excel-parser";
import type { ImportedRow, ImportParser, ImportSource } from "../../types/import-engine";

type ImportSourceOption = {
  value: ImportSource;
  label: string;
  enabled: boolean;
  accept: string;
  parser?: ImportParser;
};

export const importSourceOptions: ImportSourceOption[] = [
  {
    value: "EXCEL",
    label: "Excel",
    enabled: true,
    accept: ".xlsx",
    parser: excelImportParser,
  },
  {
    value: "CSV",
    label: "CSV (Coming Soon)",
    enabled: false,
    accept: ".csv",
  },
  {
    value: "PDF",
    label: "PDF (Coming Soon)",
    enabled: false,
    accept: ".pdf",
  },
  {
    value: "OCR",
    label: "Image / OCR (Coming Soon)",
    enabled: false,
    accept: "image/*",
  },
];

export const getImportSourceOption = (source: ImportSource) =>
  importSourceOptions.find((option) => option.value === source) ??
  importSourceOptions[0];

export const parseImportFile = async (
  source: ImportSource,
  file: File,
): Promise<ImportedRow[]> => {
  const option = getImportSourceOption(source);

  if (!option.enabled || !option.parser) {
    throw new Error("Import source is not supported yet.");
  }

  return option.parser.parse(file);
};
