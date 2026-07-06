import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { MasterDataEmptyState } from "../components/master-data/MasterDataEmptyState";
import { MasterDataErrorState } from "../components/master-data/MasterDataErrorState";
import { MasterDataLoadingState } from "../components/master-data/MasterDataLoadingState";
import { MasterDataPageHeader } from "../components/master-data/MasterDataPageHeader";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { useToast } from "../components/ui/ToastProvider";
import { useStockImport } from "../hooks/useStockImport";
import {
  getImportSourceForFile,
  getImportParser,
  getUnavailableImportMessage,
} from "../lib/import-engine/parsers";
import { isPharmaceuticalCategory } from "../lib/product-categories";
import type { Category } from "../types/category";
import type { DosageForm } from "../types/dosage-form";
import type { GenericDrug } from "../types/generic-drug";
import type { ImportedRow, ImportSource } from "../types/import-engine";
import type { Product, ProductPayload } from "../types/product";
import type { ProductClassification } from "../types/product-classification";
import type { CreateStockInPayload } from "../types/stock-in";
import type {
  StockImportRow,
  StockImportSuggestionConfidence,
  StockImportRowStatus,
} from "../types/stock-import";

const dosageFormNameSuggestions = [
  { keyword: "suspension", dosageForm: "Suspension" },
  { keyword: "suppository", dosageForm: "Suppository" },
  { keyword: "ointment", dosageForm: "Ointment" },
  { keyword: "solution", dosageForm: "Solution" },
  { keyword: "capsule", dosageForm: "Capsule" },
  { keyword: "inhaler", dosageForm: "Inhaler" },
  { keyword: "ampoule", dosageForm: "Ampoule" },
  { keyword: "sachet", dosageForm: "Sachet" },
  { keyword: "powder", dosageForm: "Powder" },
  { keyword: "nebule", dosageForm: "Nebule" },
  { keyword: "lotion", dosageForm: "Lotion" },
  { keyword: "tablet", dosageForm: "Tablet" },
  { keyword: "syrup", dosageForm: "Syrup" },
  { keyword: "cream", dosageForm: "Cream" },
  { keyword: "drops", dosageForm: "Drops" },
  { keyword: "spray", dosageForm: "Spray" },
  { keyword: "patch", dosageForm: "Patch" },
  { keyword: "vial", dosageForm: "Vial" },
  { keyword: "gel", dosageForm: "Gel" },
  { keyword: "tab", dosageForm: "Tablet" },
  { keyword: "cap", dosageForm: "Capsule" },
];

const genericDrugNameSuggestions = [
  { keyword: "biogesic", genericDrug: "Paracetamol" },
  {
    keyword: "bioflu",
    genericDrug: "Phenylephrine + Paracetamol + Chlorphenamine",
  },
  { keyword: "amoxicillin", genericDrug: "Amoxicillin" },
  { keyword: "losartan", genericDrug: "Losartan" },
  { keyword: "metformin", genericDrug: "Metformin" },
  { keyword: "cetirizine", genericDrug: "Cetirizine" },
  { keyword: "omeprazole", genericDrug: "Omeprazole" },
  { keyword: "salbutamol", genericDrug: "Salbutamol" },
  { keyword: "mefenamic", genericDrug: "Mefenamic Acid" },
  { keyword: "vitamin c", genericDrug: "Ascorbic Acid" },
];

const classificationNameSuggestions = [
  { keyword: "paracetamol", classification: "Analgesic" },
  { keyword: "amoxicillin", classification: "Antibiotic" },
  { keyword: "cetirizine", classification: "Antihistamine" },
  { keyword: "losartan", classification: "Antihypertensive" },
  { keyword: "metformin", classification: "Antidiabetic" },
  { keyword: "omeprazole", classification: "Proton Pump Inhibitor" },
  { keyword: "salbutamol", classification: "Bronchodilator" },
];

const today = () => new Date().toISOString().slice(0, 10);

const optionalText = (value: string) => value.trim() || null;

const toStockInSourceType = (source: ImportSource) => {
  if (source === "CSV") {
    return "CSV";
  }

  if (source === "OCR") {
    return "OCR";
  }

  return "EXCEL";
};

const findProductMatch = (
  products: Product[],
  importedRow: Pick<ImportedRow, "productName" | "sku">,
) => {
  const skuQuery = importedRow.sku?.trim().toLowerCase();
  const productNameQuery = importedRow.productName.trim().toLowerCase();

  if (!skuQuery && !productNameQuery) {
    return null;
  }

  return (
    (skuQuery
      ? products.find((product) => product.sku?.toLowerCase() === skuQuery)
      : null) ??
    (productNameQuery
      ? products.find(
          (product) => product.name.toLowerCase() === productNameQuery,
        )
      : null) ??
    null
  );
};

const activeOnly = <TItem extends { isActive: boolean }>(items: TItem[]) =>
  items.filter((item) => item.isActive);

const findByName = <TItem extends { name: string }>(
  items: TItem[],
  name: string,
) => items.find((item) => item.name.trim().toLowerCase() === name.toLowerCase());

const detectDosageForm = (productName: string, dosageForms: DosageForm[]) => {
  const normalizedName = productName.toLowerCase();
  const suggestion = dosageFormNameSuggestions.find(({ keyword }) =>
    normalizedName.includes(keyword),
  );

  if (!suggestion) {
    return null;
  }

  return findByName(dosageForms, suggestion.dosageForm) ?? null;
};

const detectGenericDrug = (productName: string, genericDrugs: GenericDrug[]) => {
  const normalizedName = productName.toLowerCase();
  const suggestion = genericDrugNameSuggestions.find(({ keyword }) =>
    normalizedName.includes(keyword),
  );

  if (!suggestion) {
    return null;
  }

  return findByName(genericDrugs, suggestion.genericDrug) ?? null;
};

const detectClassification = (
  productName: string,
  genericDrug: GenericDrug | null,
  classifications: ProductClassification[],
) => {
  const normalizedName = `${productName} ${genericDrug?.name ?? ""}`.toLowerCase();
  const suggestion = classificationNameSuggestions.find(({ keyword }) =>
    normalizedName.includes(keyword),
  );

  if (!suggestion) {
    return null;
  }

  return findByName(classifications, suggestion.classification) ?? null;
};

const buildNewProductSuggestions = (
  productName: string,
  categories: Category[],
  dosageForms: DosageForm[],
  genericDrugs: GenericDrug[],
  classifications: ProductClassification[],
) => {
  const suggestedDosageForm = detectDosageForm(productName, dosageForms);
  const suggestedGenericDrug = detectGenericDrug(productName, genericDrugs);
  const suggestedClassification = detectClassification(
    productName,
    suggestedGenericDrug,
    classifications,
  );
  const pharmaceuticalCategory = findByName(categories, "Pharmaceuticals");
  const appearsToBeMedicine = Boolean(
    suggestedDosageForm || suggestedGenericDrug || suggestedClassification,
  );
  const confidence: StockImportSuggestionConfidence = suggestedGenericDrug
    ? "HIGH_CONFIDENCE"
    : appearsToBeMedicine
      ? "SUGGESTED"
      : "NEEDS_REVIEW";

  return {
    categoryId: appearsToBeMedicine ? pharmaceuticalCategory?.id ?? "" : "",
    genericDrugId: suggestedGenericDrug?.id ?? "",
    dosageFormId: suggestedDosageForm?.id ?? "",
    classificationId: suggestedClassification?.id ?? "",
    confidence,
  };
};

const getRowStatus = (
  row: StockImportRow,
): StockImportRowStatus => {
  return row.productId ? "MATCHED" : "UNMATCHED";
};

const validateRows = (rows: StockImportRow[]) => {
  if (rows.length === 0) {
    return "Upload an Excel file with at least one stock row.";
  }

  if (rows.some((row) => !row.productId)) {
    return "Please match or create all products before creating a Stock In draft.";
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
  return status === "MATCHED" ? "Matched" : "Unmatched / New Product Needed";
};

const confidenceLabel = (confidence: StockImportSuggestionConfidence) => {
  if (confidence === "HIGH_CONFIDENCE") {
    return "High Confidence";
  }

  return confidence === "SUGGESTED" ? "Suggested" : "Needs Review";
};

const confidenceClassName = (confidence: StockImportSuggestionConfidence) => {
  if (confidence === "HIGH_CONFIDENCE") {
    return "status-pill active";
  }

  return confidence === "SUGGESTED"
    ? "status-pill warning"
    : "status-pill archived";
};

type StockImportPageProps = {
  embedded?: boolean;
};

export function StockImportPage({
  embedded = false,
}: StockImportPageProps) {
  const {
    categories,
    createProduct,
    createStockInDraft,
    dosageForms,
    error,
    genericDrugs,
    isLoading,
    productClassifications,
    products,
    reload,
  } = useStockImport();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [rows, setRows] = useState<StockImportRow[]>([]);
  const [importSource, setImportSource] = useState<ImportSource>("EXCEL");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const [bulkCategoryId, setBulkCategoryId] = useState("");
  const [bulkDosageFormId, setBulkDosageFormId] = useState("");
  const [bulkClassificationId, setBulkClassificationId] = useState("");
  const [isCreatingProducts, setIsCreatingProducts] = useState(false);

  const matchedCount = rows.filter((row) => row.productId).length;
  const canCreateDraft = rows.length > 0 && matchedCount === rows.length;
  const unmatchedRows = rows.filter((row) => row.status === "UNMATCHED");
  const selectedUnmatchedCount = unmatchedRows.filter(
    (row) => row.isSelectedForBulk,
  ).length;
  const activeCategories = activeOnly(categories);
  const activeDosageForms = activeOnly(dosageForms);
  const activeGenericDrugs = activeOnly(genericDrugs);
  const activeProductClassifications = activeOnly(productClassifications);

  const buildRows = (
    importedRows: ImportedRow[],
    productList: Product[],
    categoryList: Category[],
    dosageFormList: DosageForm[],
    genericDrugList: GenericDrug[],
    classificationList: ProductClassification[],
  ): StockImportRow[] =>
    importedRows.map((row) => {
      const match = findProductMatch(productList, row);
      const suggestions = buildNewProductSuggestions(
        row.productName,
        categoryList,
        dosageFormList,
        genericDrugList,
        classificationList,
      );

      return {
        id: crypto.randomUUID(),
        sourceProductName: row.productName,
        sourceSku: row.sku ?? "",
        productId: match?.id ?? "",
        status: match ? "MATCHED" : "UNMATCHED",
        newProductCategoryId: match ? "" : suggestions.categoryId,
        newProductGenericDrugId: match ? "" : suggestions.genericDrugId,
        newProductDosageFormId: match ? "" : suggestions.dosageFormId,
        newProductClassificationId: match ? "" : suggestions.classificationId,
        suggestionConfidence: match ? "HIGH_CONFIDENCE" : suggestions.confidence,
        isSelectedForBulk: !match,
        quantity: row.quantity,
        buyingPrice: row.buyingPrice,
        sellingPrice: row.sellingPrice ?? "",
        lotNumber: row.lotNumber ?? "",
        expirationDate: row.expirationDate ?? "",
      };
    });

  const handleUpload = async (file: File | null) => {
    setParseError(null);
    setMutationError(null);

    if (!file) {
      return;
    }

    const detectedSource = getImportSourceForFile(file);

    if (detectedSource !== "EXCEL") {
      setParseError(getUnavailableImportMessage(detectedSource));
      setRows([]);
      setSelectedFileName(file.name);
      return;
    }

    setImportSource(detectedSource);
    setSelectedFileName(file.name);
    setIsParsing(true);

    try {
      const parser = getImportParser(detectedSource);
      const parsedRows = await parser.parse(file);
      setRows(
        buildRows(
          parsedRows,
          products,
          categories,
          dosageForms,
          genericDrugs,
          productClassifications,
        ),
      );
      showToast("success", "Import file parsed");
    } catch {
      const message = "Unable to parse import file. Please check the template.";
      setParseError(message);
      showToast("error", message);
    } finally {
      setIsParsing(false);
    }
  };

  const updateRow = (
    rowId: string,
    field: Exclude<
      keyof StockImportRow,
      "id" | "status" | "suggestionConfidence" | "isSelectedForBulk"
    >,
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
              ? getRowStatus(nextRow)
              : row.status,
        };
      }),
    );
  };

  const updateRowSelection = (rowId: string, isSelectedForBulk: boolean) => {
    setRows((current) =>
      current.map((row) =>
        row.id === rowId ? { ...row, isSelectedForBulk } : row,
      ),
    );
  };

  const updateAllUnmatchedSelection = (isSelectedForBulk: boolean) => {
    setRows((current) =>
      current.map((row) =>
        row.status === "UNMATCHED" ? { ...row, isSelectedForBulk } : row,
      ),
    );
  };

  const applyToSelectedUnmatchedRows = (
    field:
      | "newProductCategoryId"
      | "newProductDosageFormId"
      | "newProductClassificationId",
    value: string,
  ) => {
    if (!value) {
      return;
    }

    setRows((current) =>
      current.map((row) =>
        row.status === "UNMATCHED" && row.isSelectedForBulk
          ? { ...row, [field]: value }
          : row,
      ),
    );
  };

  const validateNewProductRows = () => {
    if (unmatchedRows.length === 0) {
      return "There are no unmatched products to create.";
    }

    for (const row of unmatchedRows) {
      if (!row.sourceProductName.trim()) {
        return "Product name is required for every new product.";
      }

      if (!row.newProductCategoryId) {
        return "Category is required for every new product.";
      }

      if (row.sellingPrice.trim() && Number(row.sellingPrice) < 0) {
        return "Selling price must be zero or greater for every new product.";
      }
    }

    return null;
  };

  const handleCreateProducts = async () => {
    const validationMessage = validateNewProductRows();

    if (validationMessage) {
      setMutationError(validationMessage);
      showToast("error", validationMessage);
      return;
    }

    setIsCreatingProducts(true);
    setMutationError(null);

    try {
      for (const row of unmatchedRows) {
        const selectedCategory =
          categories.find(
            (category) => category.id === row.newProductCategoryId,
          ) ?? null;
        const payload: ProductPayload = {
          name: row.sourceProductName.trim(),
          categoryId: row.newProductCategoryId,
          genericDrugId: row.newProductGenericDrugId || null,
          dosageFormId: row.newProductDosageFormId || null,
          classificationId: row.newProductClassificationId || null,
          defaultSellingPrice: row.sellingPrice.trim()
            ? Number(row.sellingPrice)
            : null,
          unit: "piece",
          productType: isPharmaceuticalCategory(selectedCategory)
            ? "MEDICINE"
            : "NON_MEDICINE",
          reorderLevel: 0,
          requiresPrescription: false,
          requiresExpiryTracking: false,
          requiresLotTracking: false,
        };

        const product = await createProduct(payload);

        setRows((current) =>
          current.map((currentRow) =>
            currentRow.id === row.id
              ? {
                  ...currentRow,
                  productId: product.id,
                  status: "MATCHED",
                  isSelectedForBulk: false,
                }
              : currentRow,
          ),
        );
      }

      showToast("success", "New products created");
    } catch {
      const message = "Unable to create all products. Please review the rows.";
      setMutationError(message);
      showToast("error", message);
    } finally {
      setIsCreatingProducts(false);
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
      sourceType: toStockInSourceType(importSource),
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
    <section className={embedded ? "stock-import-embedded" : "page"}>
      {embedded ? null : (
        <MasterDataPageHeader eyebrow="Inventory" title="Stock Import" />
      )}

      <Card className="content-card">
          <div className="stock-import-header">
            <div>
              <h2>Import File</h2>
              <p className="muted-text">
                Upload a supplier file, review the products, then save a Stock
                In draft.
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
            <div className="stock-import-upload-panel">
              <div className="stock-import-upload-copy">
                <h3>Upload supplier file</h3>
                <p>
                  Choose an Excel .xlsx file from your device. You can review
                  and adjust rows before saving the draft.
                </p>
              </div>

              <label className="stock-import-upload-box">
                <span className="stock-import-upload-instruction">
                  Choose an Excel .xlsx file from your device
                </span>
                <span className="stock-import-upload-title">Choose File</span>
                <input
                  accept=".xlsx,.csv,.pdf,.jpg,.jpeg,.png,.webp"
                  className="stock-import-file-input"
                  onChange={(event) =>
                    void handleUpload(event.target.files?.[0] ?? null)
                  }
                  type="file"
                />
              </label>

              <div className="stock-import-upload-meta">
                <div>
                  <strong>Supported now:</strong>
                  <span>Excel .xlsx</span>
                </div>
                <div>
                  <strong>Coming soon:</strong>
                  <span>CSV, PDF, images</span>
                </div>
              </div>

              {selectedFileName ? (
                <p className="stock-import-selected-file">
                  <span>Selected file:</span>
                  <strong>{selectedFileName}</strong>
                </p>
              ) : null}
            </div>

            {isParsing ? (
              <MasterDataLoadingState message="Parsing imported rows..." />
            ) : null}

            {parseError ? <p className="form-error">{parseError}</p> : null}
            {mutationError ? <p className="form-error">{mutationError}</p> : null}

            {rows.length === 0 && !isParsing ? (
              <MasterDataEmptyState message="No import rows yet. Upload an Excel supplier file to begin." />
            ) : null}

            {rows.length > 0 ? (
              <>
                <div className="stock-import-summary">
                  <span>{rows.length} rows parsed</span>
                  <span>{matchedCount} matched</span>
                  <span>{rows.length - matchedCount} need review</span>
                </div>

                {!canCreateDraft ? (
                  <p className="form-error">
                    Please match or create all products before creating a
                    Stock In draft.
                  </p>
                ) : null}

                {unmatchedRows.length > 0 ? (
                  <div className="stock-import-new-products">
                    <div className="stock-import-section-header">
                      <div>
                        <p className="eyebrow">Review</p>
                        <h3>New Products to Create</h3>
                      </div>
                      <Button
                        disabled={isCreatingProducts}
                        onClick={() => void handleCreateProducts()}
                      >
                        {isCreatingProducts ? "Creating..." : "Create Products"}
                      </Button>
                    </div>

                    <div className="stock-import-bulk-controls">
                      <label className="checkbox-field">
                        <input
                          checked={
                            unmatchedRows.length > 0 &&
                            selectedUnmatchedCount === unmatchedRows.length
                          }
                          onChange={(event) =>
                            updateAllUnmatchedSelection(event.target.checked)
                          }
                          type="checkbox"
                        />
                        <span>Select all unmatched</span>
                      </label>
                      <Select
                        label="Bulk Category"
                        onChange={(event) => setBulkCategoryId(event.target.value)}
                        value={bulkCategoryId}
                      >
                        <option value="">Select category</option>
                        {activeCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </Select>
                      <Button
                        disabled={!bulkCategoryId || selectedUnmatchedCount === 0}
                        variant="secondary"
                        onClick={() =>
                          applyToSelectedUnmatchedRows(
                            "newProductCategoryId",
                            bulkCategoryId,
                          )
                        }
                      >
                        Apply Category
                      </Button>
                      <Select
                        label="Bulk Dosage Form"
                        onChange={(event) =>
                          setBulkDosageFormId(event.target.value)
                        }
                        value={bulkDosageFormId}
                      >
                        <option value="">Select dosage form</option>
                        {activeDosageForms.map((dosageForm) => (
                          <option key={dosageForm.id} value={dosageForm.id}>
                            {dosageForm.name}
                          </option>
                        ))}
                      </Select>
                      <Button
                        disabled={!bulkDosageFormId || selectedUnmatchedCount === 0}
                        variant="secondary"
                        onClick={() =>
                          applyToSelectedUnmatchedRows(
                            "newProductDosageFormId",
                            bulkDosageFormId,
                          )
                        }
                      >
                        Apply Dosage
                      </Button>
                      <Select
                        label="Bulk Classification"
                        onChange={(event) =>
                          setBulkClassificationId(event.target.value)
                        }
                        value={bulkClassificationId}
                      >
                        <option value="">Select classification</option>
                        {activeProductClassifications.map((classification) => (
                          <option key={classification.id} value={classification.id}>
                            {classification.name}
                          </option>
                        ))}
                      </Select>
                      <Button
                        disabled={
                          !bulkClassificationId || selectedUnmatchedCount === 0
                        }
                        variant="secondary"
                        onClick={() =>
                          applyToSelectedUnmatchedRows(
                            "newProductClassificationId",
                            bulkClassificationId,
                          )
                        }
                      >
                        Apply Classification
                      </Button>
                    </div>

                    <div className="table-wrap">
                      <table className="table stock-import-new-products-table">
                        <thead>
                          <tr>
                            <th>Select</th>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Generic Drug</th>
                            <th>Dosage Form</th>
                            <th>Product Classification</th>
                            <th>Buying Price</th>
                            <th>Selling Price</th>
                            <th>Confidence</th>
                          </tr>
                        </thead>
                        <tbody>
                          {unmatchedRows.map((row) => (
                            <tr key={row.id}>
                              <td>
                                <input
                                  checked={row.isSelectedForBulk}
                                  onChange={(event) =>
                                    updateRowSelection(
                                      row.id,
                                      event.target.checked,
                                    )
                                  }
                                  type="checkbox"
                                />
                              </td>
                              <td>
                                <Input
                                  onChange={(event) =>
                                    updateRow(
                                      row.id,
                                      "sourceProductName",
                                      event.target.value,
                                    )
                                  }
                                  value={row.sourceProductName}
                                />
                              </td>
                              <td>
                                <Select
                                  onChange={(event) =>
                                    updateRow(
                                      row.id,
                                      "newProductCategoryId",
                                      event.target.value,
                                    )
                                  }
                                  value={row.newProductCategoryId}
                                >
                                  <option value="">Select category</option>
                                  {activeCategories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                      {category.name}
                                    </option>
                                  ))}
                                </Select>
                              </td>
                              <td>
                                <Select
                                  onChange={(event) =>
                                    updateRow(
                                      row.id,
                                      "newProductGenericDrugId",
                                      event.target.value,
                                    )
                                  }
                                  value={row.newProductGenericDrugId}
                                >
                                  <option value="">None</option>
                                  {activeGenericDrugs.map((genericDrug) => (
                                    <option
                                      key={genericDrug.id}
                                      value={genericDrug.id}
                                    >
                                      {genericDrug.name}
                                    </option>
                                  ))}
                                </Select>
                              </td>
                              <td>
                                <Select
                                  onChange={(event) =>
                                    updateRow(
                                      row.id,
                                      "newProductDosageFormId",
                                      event.target.value,
                                    )
                                  }
                                  value={row.newProductDosageFormId}
                                >
                                  <option value="">None</option>
                                  {activeDosageForms.map((dosageForm) => (
                                    <option
                                      key={dosageForm.id}
                                      value={dosageForm.id}
                                    >
                                      {dosageForm.name}
                                    </option>
                                  ))}
                                </Select>
                              </td>
                              <td>
                                <Select
                                  onChange={(event) =>
                                    updateRow(
                                      row.id,
                                      "newProductClassificationId",
                                      event.target.value,
                                    )
                                  }
                                  value={row.newProductClassificationId}
                                >
                                  <option value="">None</option>
                                  {activeProductClassifications.map(
                                    (classification) => (
                                      <option
                                        key={classification.id}
                                        value={classification.id}
                                      >
                                        {classification.name}
                                      </option>
                                    ),
                                  )}
                                </Select>
                              </td>
                              <td>
                                <Input
                                  className="stock-import-price-input"
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
                                  className="stock-import-price-input"
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
                                <span
                                  className={confidenceClassName(
                                    row.suggestionConfidence,
                                  )}
                                >
                                  {confidenceLabel(row.suggestionConfidence)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}

                <div className="table-wrap">
                  <table className="table stock-import-table">
                    <thead>
                      <tr>
                        <th>Product Name from Excel</th>
                        <th>Matched Product</th>
                        <th>Status</th>
                        <th>Quantity</th>
                        <th>Buying Price</th>
                        <th>Selling Price</th>
                        <th>Lot Number</th>
                        <th>Expiration Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id}>
                          <td className="stock-import-raw-product-cell">
                            <strong>{row.sourceProductName || "Unnamed row"}</strong>
                          </td>
                          <td className="stock-import-product-cell">
                            <Select
                              onChange={(event) =>
                                updateRow(
                                  row.id,
                                  "productId",
                                  event.target.value,
                                )
                              }
                              value={row.productId}
                            >
                              <option value="">Unmatched</option>
                              {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name}
                                  {product.sku ? ` (${product.sku})` : ""}
                                </option>
                              ))}
                            </Select>
                          </td>
                          <td>
                            <span
                              className={
                                row.status === "UNMATCHED"
                                  ? "status-pill archived"
                                  : "status-pill active"
                              }
                            >
                              {statusLabel(row.status)}
                            </span>
                          </td>
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

    </section>
  );
}
