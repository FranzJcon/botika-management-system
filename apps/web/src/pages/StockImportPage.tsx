import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { MasterDataEmptyState } from "../components/master-data/MasterDataEmptyState";
import { MasterDataErrorState } from "../components/master-data/MasterDataErrorState";
import { MasterDataLoadingState } from "../components/master-data/MasterDataLoadingState";
import { MasterDataPageHeader } from "../components/master-data/MasterDataPageHeader";
import { QuickAddProductModal } from "../components/products/QuickAddProductModal";
import { ProductPicker } from "../components/stock-ins/ProductPicker";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useToast } from "../components/ui/ToastProvider";
import { useStockImport } from "../hooks/useStockImport";
import type { Product, ProductPayload } from "../types/product";
import type { CreateStockInPayload } from "../types/stock-in";
import type {
  StockImportParsedRow,
  StockImportRow,
  StockImportRowStatus,
} from "../types/stock-import";

type QuickAddTarget = {
  rowId: string;
  initialName: string;
};

const supportedHeaders = {
  productName: "product name",
  quantity: "quantity",
  buyingPrice: "buying price",
  sellingPrice: "selling price",
  lotNumber: "lot number",
  expirationDate: "expiration date",
};

const today = () => new Date().toISOString().slice(0, 10);

const normalize = (value: unknown) => String(value ?? "").trim().toLowerCase();

const optionalText = (value: string) => value.trim() || null;

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

const getCell = (
  row: Record<string, unknown>,
  headerLookup: Map<string, string>,
  header: string,
) => {
  const actualHeader = headerLookup.get(header);

  return actualHeader ? row[actualHeader] : "";
};

const parseWorkbookRows = async (file: File): Promise<StockImportParsedRow[]> => {
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
        quantity: String(getCell(row, headerLookup, supportedHeaders.quantity))
          .trim(),
        buyingPrice: String(
          getCell(row, headerLookup, supportedHeaders.buyingPrice),
        ).trim(),
        sellingPrice: String(
          getCell(row, headerLookup, supportedHeaders.sellingPrice),
        ).trim(),
        lotNumber: String(getCell(row, headerLookup, supportedHeaders.lotNumber))
          .trim(),
        expirationDate: formatExcelDate(
          getCell(row, headerLookup, supportedHeaders.expirationDate),
          XLSX.SSF.parse_date_code,
        ),
      };
    })
    .filter((row) => row.productName || row.quantity || row.buyingPrice);
};

const findProductMatch = (products: Product[], productName: string) => {
  const query = productName.trim().toLowerCase();

  if (!query) {
    return null;
  }

  return (
    products.find((product) => product.sku?.toLowerCase() === query) ??
    products.find((product) => product.name.toLowerCase() === query) ??
    null
  );
};

const getRowStatus = (
  row: StockImportRow,
  previousStatus?: StockImportRowStatus,
): StockImportRowStatus => {
  if (!row.productId) {
    return "UNKNOWN";
  }

  return previousStatus === "NEW_PRODUCT" ? "NEW_PRODUCT" : "MATCHED";
};

const validateRows = (rows: StockImportRow[]) => {
  if (rows.length === 0) {
    return "Upload an Excel file with at least one stock row.";
  }

  if (rows.some((row) => !row.productId)) {
    return "Match or quick add every product before creating the draft.";
  }

  for (const row of rows) {
    if (Number(row.quantity) <= 0) {
      return "Quantity must be greater than zero for every row.";
    }

    if (row.buyingPrice.trim() === "" || Number(row.buyingPrice) < 0) {
      return "Buying price must be zero or greater for every row.";
    }

    if (row.sellingPrice.trim() && Number(row.sellingPrice) < 0) {
      return "Selling price must be zero or greater.";
    }
  }

  return null;
};

const statusLabel = (status: StockImportRowStatus) => {
  if (status === "NEW_PRODUCT") {
    return "New Product";
  }

  return status === "MATCHED" ? "Matched" : "Unknown Product";
};

export function StockImportPage() {
  const {
    categories,
    createProduct,
    createStockInDraft,
    error,
    isLoading,
    products,
    reload,
  } = useStockImport();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [rows, setRows] = useState<StockImportRow[]>([]);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const [quickAddTarget, setQuickAddTarget] = useState<QuickAddTarget | null>(
    null,
  );
  const [quickAddError, setQuickAddError] = useState<string | null>(null);
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  const matchedCount = rows.filter((row) => row.productId).length;
  const canCreateDraft = rows.length > 0 && matchedCount === rows.length;

  const currentStep = useMemo(() => {
    if (rows.length === 0) {
      return "Step 1: Upload Excel";
    }

    if (!canCreateDraft) {
      return "Step 2: Match Products";
    }

    return "Step 3: Review and Create Draft";
  }, [canCreateDraft, rows.length]);

  const buildRows = (
    parsedRows: StockImportParsedRow[],
    productList: Product[],
  ): StockImportRow[] =>
    parsedRows.map((row) => {
      const match = findProductMatch(productList, row.productName);

      return {
        id: crypto.randomUUID(),
        sourceProductName: row.productName,
        productId: match?.id ?? "",
        status: match ? "MATCHED" : "UNKNOWN",
        quantity: row.quantity,
        buyingPrice: row.buyingPrice,
        sellingPrice: row.sellingPrice,
        lotNumber: row.lotNumber,
        expirationDate: row.expirationDate,
      };
    });

  const handleUpload = async (file: File | null) => {
    setParseError(null);
    setMutationError(null);

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setParseError("Only .xlsx files are supported for Stock Import v1.");
      return;
    }

    setSelectedFileName(file.name);
    setIsParsing(true);

    try {
      const parsedRows = await parseWorkbookRows(file);
      setRows(buildRows(parsedRows, products));
      showToast("success", "Excel file parsed");
    } catch {
      const message = "Unable to parse Excel file. Please check the template.";
      setParseError(message);
      showToast("error", message);
    } finally {
      setIsParsing(false);
    }
  };

  const updateRow = (
    rowId: string,
    field: keyof Omit<StockImportRow, "id" | "status">,
    value: string,
  ) => {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        const nextRow = { ...row, [field]: value };

        return {
          ...nextRow,
          status:
            field === "productId"
              ? getRowStatus(nextRow, row.status)
              : row.status,
        };
      }),
    );
  };

  const handleQuickAddProduct = async (payload: ProductPayload) => {
    if (!quickAddTarget) {
      return;
    }

    setIsQuickAdding(true);
    setQuickAddError(null);

    try {
      const product = await createProduct(payload);
      setRows((current) =>
        current.map((row) =>
          row.id === quickAddTarget.rowId
            ? { ...row, productId: product.id, status: "NEW_PRODUCT" }
            : row,
        ),
      );
      setQuickAddTarget(null);
      showToast("success", "Product created and matched");
    } catch {
      const message = "Unable to create product. Please try again.";
      setQuickAddError(message);
      showToast("error", message);
    } finally {
      setIsQuickAdding(false);
    }
  };

  const handleCreateDraft = async () => {
    const validationMessage = validateRows(rows);

    if (validationMessage) {
      setMutationError(validationMessage);
      showToast("error", validationMessage);
      return;
    }

    const payload: CreateStockInPayload = {
      supplierId: null,
      sourceType: "EXCEL",
      referenceType: null,
      referenceNumber: null,
      receivedDate: today(),
      notes: selectedFileName
        ? `Created from stock import: ${selectedFileName}`
        : "Created from stock import",
      items: rows.map((row) => ({
        productId: row.productId,
        quantity: Number(row.quantity),
        buyingPrice: Number(row.buyingPrice),
        sellingPrice: row.sellingPrice.trim() ? Number(row.sellingPrice) : null,
        lotNumber: optionalText(row.lotNumber),
        expirationDate: optionalText(row.expirationDate),
        notes: row.sourceProductName
          ? `Imported row: ${row.sourceProductName}`
          : null,
      })),
    };

    setIsCreatingDraft(true);
    setMutationError(null);

    try {
      await createStockInDraft(payload);
      showToast("success", "Stock in draft created");
      navigate("/stock-ins");
    } catch {
      const message = "Unable to create stock in draft. Please review the rows.";
      setMutationError(message);
      showToast("error", message);
    } finally {
      setIsCreatingDraft(false);
    }
  };

  return (
    <section className="page">
      <MasterDataPageHeader eyebrow="Inventory" title="Stock Import" />

      <Card className="content-card">
        <div className="stock-import-header">
          <div>
            <p className="eyebrow">{currentStep}</p>
            <h2>Import Excel Delivery</h2>
            <p className="muted-text">
              Upload an .xlsx file, match products, then create a Stock In draft
              for review.
            </p>
          </div>
          {error ? (
            <Button variant="secondary" onClick={() => void reload()}>
              Retry
            </Button>
          ) : null}
        </div>

        {isLoading ? (
          <MasterDataLoadingState message="Loading products..." />
        ) : error ? (
          <MasterDataErrorState message={error} />
        ) : (
          <>
            <div className="stock-import-upload">
              <Input
                accept=".xlsx"
                label="Excel File"
                onChange={(event) =>
                  void handleUpload(event.target.files?.[0] ?? null)
                }
                type="file"
              />
              <span className="muted-text">
                Supported columns: Product Name, Quantity, Buying Price, Selling
                Price, Lot Number, Expiration Date.
              </span>
            </div>

            {isParsing ? (
              <MasterDataLoadingState message="Parsing Excel rows..." />
            ) : null}

            {parseError ? <p className="form-error">{parseError}</p> : null}
            {mutationError ? <p className="form-error">{mutationError}</p> : null}

            {rows.length === 0 && !isParsing ? (
              <MasterDataEmptyState message="No import rows yet. Upload an .xlsx delivery file to begin." />
            ) : null}

            {rows.length > 0 ? (
              <>
                <div className="stock-import-summary">
                  <span>{rows.length} rows parsed</span>
                  <span>{matchedCount} matched</span>
                  <span>{rows.length - matchedCount} need review</span>
                </div>

                <div className="table-wrap">
                  <table className="table stock-import-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Status</th>
                        <th>Matched</th>
                        <th>New Product</th>
                        <th>Quantity</th>
                        <th>Buying Price</th>
                        <th>Selling Price</th>
                        <th>Lot Number</th>
                        <th>Expiration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id}>
                          <td className="stock-import-product-cell">
                            <ProductPicker
                              onChange={(productId) =>
                                updateRow(row.id, "productId", productId)
                              }
                              onQuickAdd={(initialName) =>
                                setQuickAddTarget({
                                  rowId: row.id,
                                  initialName:
                                    initialName || row.sourceProductName,
                                })
                              }
                              products={products}
                              value={row.productId}
                            />
                            {row.sourceProductName ? (
                              <small>Imported: {row.sourceProductName}</small>
                            ) : null}
                          </td>
                          <td>
                            <span
                              className={
                                row.status === "UNKNOWN"
                                  ? "status-pill archived"
                                  : row.status === "NEW_PRODUCT"
                                    ? "status-pill warning"
                                    : "status-pill active"
                              }
                            >
                              {statusLabel(row.status)}
                            </span>
                          </td>
                          <td>{row.productId ? "Yes" : "No"}</td>
                          <td>{row.status === "NEW_PRODUCT" ? "Yes" : "No"}</td>
                          <td>
                            <Input
                              min="0.001"
                              onChange={(event) =>
                                updateRow(row.id, "quantity", event.target.value)
                              }
                              step="0.001"
                              type="number"
                              value={row.quantity}
                            />
                          </td>
                          <td>
                            <Input
                              min="0"
                              onChange={(event) =>
                                updateRow(
                                  row.id,
                                  "buyingPrice",
                                  event.target.value,
                                )
                              }
                              step="0.01"
                              type="number"
                              value={row.buyingPrice}
                            />
                          </td>
                          <td>
                            <Input
                              min="0"
                              onChange={(event) =>
                                updateRow(
                                  row.id,
                                  "sellingPrice",
                                  event.target.value,
                                )
                              }
                              step="0.01"
                              type="number"
                              value={row.sellingPrice}
                            />
                          </td>
                          <td>
                            <Input
                              onChange={(event) =>
                                updateRow(row.id, "lotNumber", event.target.value)
                              }
                              value={row.lotNumber}
                            />
                          </td>
                          <td>
                            <Input
                              onChange={(event) =>
                                updateRow(
                                  row.id,
                                  "expirationDate",
                                  event.target.value,
                                )
                              }
                              type="date"
                              value={row.expirationDate}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="modal-actions">
                  <Button
                    disabled={isCreatingDraft || !canCreateDraft}
                    onClick={() => void handleCreateDraft()}
                  >
                    {isCreatingDraft ? "Creating..." : "Create Stock In Draft"}
                  </Button>
                </div>
              </>
            ) : null}
          </>
        )}
      </Card>

      {quickAddTarget ? (
        <QuickAddProductModal
          categories={categories}
          error={quickAddError}
          initialName={quickAddTarget.initialName}
          isSubmitting={isQuickAdding}
          onClose={() => {
            setQuickAddTarget(null);
            setQuickAddError(null);
          }}
          onSubmit={handleQuickAddProduct}
        />
      ) : null}
    </section>
  );
}
