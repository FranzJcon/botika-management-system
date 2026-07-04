import type { ImportedRow, ImportParser } from "../../types/import-engine";

const supportedHeaders = {
  productName: "product name",
  sku: "sku",
  quantity: "quantity",
  buyingPrice: "buying price",
  sellingPrice: "selling price",
  lotNumber: "lot number",
  expirationDate: "expiration date",
};

const normalize = (value: unknown) => String(value ?? "").trim().toLowerCase();

const getCell = (
  row: Record<string, unknown>,
  headerLookup: Map<string, string>,
  header: string,
) => {
  const actualHeader = headerLookup.get(header);

  return actualHeader ? row[actualHeader] : "";
};

const formatExcelDate = (
  value: unknown,
  parseDateCode: (value: number) => { y: number; m: number; d: number } | null,
) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "number") {
    const parsed = parseDateCode(value);

    if (parsed) {
      const month = String(parsed.m).padStart(2, "0");
      const day = String(parsed.d).padStart(2, "0");

      return `${parsed.y}-${month}-${day}`;
    }
  }

  return String(value ?? "").trim();
};

export const excelImportParser: ImportParser = {
  parse: async (file: File): Promise<ImportedRow[]> => {
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { cellDates: true, type: "array" });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      return [];
    }

    const sheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
    });

    return rawRows
      .map((row) => {
        const headerLookup = new Map(
          Object.keys(row).map((key) => [normalize(key), key]),
        );

        return {
          productName: String(
            getCell(row, headerLookup, supportedHeaders.productName),
          ).trim(),
          sku: String(getCell(row, headerLookup, supportedHeaders.sku)).trim(),
          quantity: String(getCell(row, headerLookup, supportedHeaders.quantity))
            .trim(),
          buyingPrice: String(
            getCell(row, headerLookup, supportedHeaders.buyingPrice),
          ).trim(),
          sellingPrice: String(
            getCell(row, headerLookup, supportedHeaders.sellingPrice),
          ).trim(),
          lotNumber: String(
            getCell(row, headerLookup, supportedHeaders.lotNumber),
          ).trim(),
          expirationDate: formatExcelDate(
            getCell(row, headerLookup, supportedHeaders.expirationDate),
            XLSX.SSF.parse_date_code,
          ),
        };
      })
      .filter((row) => row.productName || row.sku || row.quantity || row.buyingPrice);
  },
};
