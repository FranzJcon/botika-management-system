import type { Express } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const json = (schema: unknown, example?: unknown) => ({
  content: {
    "application/json": {
      schema,
      ...(example ? { example } : {}),
    },
  },
});

const ref = (name: string) => ({
  $ref: `#/components/schemas/${name}`,
});

const arrayOf = (schema: unknown) => ({
  type: "array",
  items: schema,
});

const idParam = (name = "id", description = "Resource id") => ({
  name,
  in: "path",
  required: true,
  description,
  schema: {
    type: "string",
    format: "uuid",
  },
});

const responses = {
  validationFailed: {
    description: "Validation failed",
    ...json(ref("ErrorResponse"), { message: "Validation failed" }),
  },
  notFound: (message: string) => ({
    description: message,
    ...json(ref("ErrorResponse"), { message }),
  }),
  conflict: (message: string) => ({
    description: message,
    ...json(ref("ErrorResponse"), { message }),
  }),
};

const masterDataPaths = ({
  tag,
  basePath,
  resourceName,
  notFoundMessage,
  conflictMessage,
  archiveMessage,
  createExample,
}: {
  tag: string;
  basePath: string;
  resourceName: string;
  notFoundMessage: string;
  conflictMessage: string;
  archiveMessage: string;
  createExample: Record<string, unknown>;
}) => ({
  [basePath]: {
    get: {
      tags: [tag],
      summary: `List ${resourceName}`,
      responses: {
        200: {
          description: `${resourceName} list`,
          ...json(arrayOf(ref("MasterDataRecord")), [createExample]),
        },
      },
    },
    post: {
      tags: [tag],
      summary: `Create ${resourceName}`,
      requestBody: {
        required: true,
        ...json(ref("MasterDataCreateRequest"), createExample),
      },
      responses: {
        201: {
          description: `${resourceName} created`,
          ...json(ref("MasterDataRecord"), createExample),
        },
        400: responses.validationFailed,
        409: responses.conflict(conflictMessage),
      },
    },
  },
  [`${basePath}/{id}`]: {
    get: {
      tags: [tag],
      summary: `Get ${resourceName} by id`,
      parameters: [idParam()],
      responses: {
        200: {
          description: `${resourceName} found`,
          ...json(ref("MasterDataRecord"), createExample),
        },
        404: responses.notFound(notFoundMessage),
      },
    },
    patch: {
      tags: [tag],
      summary: `Update ${resourceName}`,
      parameters: [idParam()],
      requestBody: {
        required: true,
        ...json(ref("MasterDataUpdateRequest"), {
          ...createExample,
          isActive: true,
        }),
      },
      responses: {
        200: {
          description: `${resourceName} updated`,
          ...json(ref("MasterDataRecord"), createExample),
        },
        400: responses.validationFailed,
        404: responses.notFound(notFoundMessage),
        409: responses.conflict(conflictMessage),
      },
    },
    delete: {
      tags: [tag],
      summary: `Archive ${resourceName}`,
      parameters: [idParam()],
      responses: {
        200: {
          description: `${resourceName} archived`,
          ...json(ref("MessageResponse"), { message: archiveMessage }),
        },
        404: responses.notFound(notFoundMessage),
      },
    },
  },
});

const masterDataModules = {
  ...masterDataPaths({
    tag: "Product Classifications",
    basePath: "/product-classifications",
    resourceName: "product classifications",
    notFoundMessage: "Product classification not found",
    conflictMessage: "Product classification already exists",
    archiveMessage: "Product classification archived successfully",
    createExample: {
      name: "Analgesic",
      description: "Pain relievers",
    },
  }),
  ...masterDataPaths({
    tag: "Generic Drugs",
    basePath: "/generic-drugs",
    resourceName: "generic drugs",
    notFoundMessage: "Generic drug not found",
    conflictMessage: "Generic drug already exists",
    archiveMessage: "Generic drug archived successfully",
    createExample: {
      name: "Paracetamol",
      description: "Analgesic and antipyretic",
    },
  }),
  ...masterDataPaths({
    tag: "Dosage Forms",
    basePath: "/dosage-forms",
    resourceName: "dosage forms",
    notFoundMessage: "Dosage form not found",
    conflictMessage: "Dosage form already exists",
    archiveMessage: "Dosage form archived successfully",
    createExample: {
      name: "Tablet",
      description: "Solid oral dosage form",
    },
  }),
  ...masterDataPaths({
    tag: "Brands",
    basePath: "/brands",
    resourceName: "brands",
    notFoundMessage: "Brand not found",
    conflictMessage: "Brand already exists",
    archiveMessage: "Brand archived successfully",
    createExample: {
      name: "Biogesic",
      description: "Commercial brand name",
    },
  }),
};

const definition = {
  openapi: "3.0.0",
  info: {
    title: "Botika Management System API",
    version: "0.1.0",
    description: "API documentation for the Botika Management System backend.",
  },
  tags: [
    { name: "Health" },
    { name: "Categories" },
    { name: "Product Classifications" },
    { name: "Generic Drugs" },
    { name: "Dosage Forms" },
    { name: "Brands" },
    { name: "Products" },
    { name: "Product Aliases" },
    { name: "Product Barcodes" },
    { name: "Stock In" },
    { name: "Inventory Levels" },
    { name: "Stock Adjustments" },
    { name: "Sales" },
  ],
  components: {
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
        required: ["message"],
      },
      MessageResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
        required: ["message"],
      },
      HealthResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "ok" },
          service: { type: "string", example: "botika-api" },
          version: { type: "string", example: "1.0.0" },
          timestamp: { type: "string", format: "date-time" },
        },
      },
      MasterDataRecord: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          description: { type: "string", nullable: true },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      MasterDataCreateRequest: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string", nullable: true },
        },
        required: ["name"],
      },
      MasterDataUpdateRequest: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string", nullable: true },
          isActive: { type: "boolean" },
        },
      },
      CategoryRecord: {
        allOf: [
          ref("MasterDataRecord"),
          {
            type: "object",
            properties: {
              parentId: { type: "string", format: "uuid", nullable: true },
              parent: { nullable: true, allOf: [ref("MasterDataRecord")] },
              children: arrayOf(ref("MasterDataRecord")),
            },
          },
        ],
      },
      CategoryCreateRequest: {
        allOf: [
          ref("MasterDataCreateRequest"),
          {
            type: "object",
            properties: {
              parentId: { type: "string", format: "uuid", nullable: true },
            },
          },
        ],
      },
      CategoryUpdateRequest: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string", nullable: true },
          parentId: { type: "string", format: "uuid", nullable: true },
          isActive: { type: "boolean" },
        },
      },
      ProductRequest: {
        type: "object",
        properties: {
          name: { type: "string" },
          sku: { type: "string", nullable: true },
          categoryId: { type: "string", format: "uuid", nullable: true },
          classificationId: { type: "string", format: "uuid", nullable: true },
          genericDrugId: { type: "string", format: "uuid", nullable: true },
          dosageFormId: { type: "string", format: "uuid", nullable: true },
          brandId: { type: "string", format: "uuid", nullable: true },
          genericName: { type: "string", nullable: true },
          brandName: { type: "string", nullable: true },
          dosageForm: { type: "string", nullable: true },
          strength: { type: "string", nullable: true },
          unit: { type: "string" },
          productType: { type: "string", enum: ["MEDICINE", "NON_MEDICINE"] },
          defaultSellingPrice: { type: "number", nullable: true },
          reorderLevel: { type: "number" },
          requiresPrescription: { type: "boolean" },
          requiresExpiryTracking: { type: "boolean" },
          requiresLotTracking: { type: "boolean" },
        },
        required: ["name"],
      },
      ProductUpdateRequest: {
        allOf: [
          ref("ProductRequest"),
          {
            type: "object",
            properties: {
              status: {
                type: "string",
                enum: ["ACTIVE", "INACTIVE", "DISCONTINUED"],
              },
            },
          },
        ],
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          sku: { type: "string", nullable: true },
          category: { nullable: true, allOf: [ref("CategoryRecord")] },
          classification: { nullable: true, allOf: [ref("MasterDataRecord")] },
          genericDrug: { nullable: true, allOf: [ref("MasterDataRecord")] },
          dosageFormRef: { nullable: true, allOf: [ref("MasterDataRecord")] },
          brand: { nullable: true, allOf: [ref("MasterDataRecord")] },
          aliases: arrayOf(ref("ProductAlias")),
          barcodes: arrayOf(ref("ProductBarcode")),
          status: { type: "string" },
        },
      },
      ProductAlias: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          productId: { type: "string", format: "uuid" },
          alias: { type: "string" },
          source: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      ProductBarcode: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          productId: { type: "string", format: "uuid" },
          barcode: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      StockInCreateRequest: {
        type: "object",
        properties: {
          supplierId: { type: "string", format: "uuid", nullable: true },
          receivedByUserId: { type: "string", format: "uuid" },
          sourceType: {
            type: "string",
            enum: ["MANUAL", "EXCEL", "CSV", "OCR", "WO_POS_MIGRATION"],
          },
          referenceType: {
            type: "string",
            nullable: true,
            enum: [
              "INVOICE",
              "DELIVERY_RECEIPT",
              "OFFICIAL_RECEIPT",
              "PURCHASE_ORDER",
              "MANUAL",
              "OPENING_INVENTORY",
              "DONATION",
              "OTHER",
            ],
          },
          referenceNumber: { type: "string", nullable: true },
          receivedDate: { type: "string", format: "date" },
          notes: { type: "string", nullable: true },
          items: arrayOf(ref("StockInItemRequest")),
        },
        required: ["receivedByUserId", "sourceType", "receivedDate", "items"],
      },
      StockInItemRequest: {
        type: "object",
        properties: {
          productId: { type: "string", format: "uuid" },
          quantity: { type: "number", example: 100 },
          buyingPrice: { type: "number", example: 3 },
          sellingPrice: { type: "number", nullable: true, example: 5 },
          expirationDate: { type: "string", format: "date", nullable: true },
          lotNumber: { type: "string", nullable: true },
          notes: { type: "string", nullable: true },
        },
        required: ["productId", "quantity", "buyingPrice"],
      },
      InventoryLevel: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          sku: { type: "string", nullable: true },
          category: { nullable: true, allOf: [ref("CategoryRecord")] },
          brand: { nullable: true, allOf: [ref("MasterDataRecord")] },
          totalQuantityOnHand: { type: "number" },
          reorderLevel: { type: "number" },
          status: { type: "string" },
        },
      },
      StockAdjustmentCreateRequest: {
        type: "object",
        properties: {
          adjustedByUserId: { type: "string", format: "uuid" },
          reason: { type: "string" },
          notes: { type: "string", nullable: true },
          items: arrayOf(ref("StockAdjustmentItemRequest")),
        },
        required: ["adjustedByUserId", "reason", "items"],
      },
      StockAdjustmentItemRequest: {
        type: "object",
        properties: {
          productId: { type: "string", format: "uuid" },
          inventoryBatchId: { type: "string", format: "uuid", nullable: true },
          quantityChange: { type: "number", example: -5 },
          notes: { type: "string", nullable: true },
        },
        required: ["productId", "quantityChange"],
      },
      SaleCreateRequest: {
        type: "object",
        properties: {
          saleDate: { type: "string", format: "date" },
          notes: { type: "string", nullable: true },
          items: arrayOf(ref("SaleItemRequest")),
        },
        required: ["items"],
      },
      SaleItemRequest: {
        type: "object",
        properties: {
          productId: { type: "string", format: "uuid" },
          quantity: { type: "number", example: 2 },
          sellingPrice: { type: "number", example: 5 },
        },
        required: ["productId", "quantity", "sellingPrice"],
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Check API health",
        responses: {
          200: {
            description: "API is healthy",
            ...json(ref("HealthResponse"), {
              status: "ok",
              service: "botika-api",
              version: "1.0.0",
              timestamp: "2026-07-02T10:00:00.000Z",
            }),
          },
        },
      },
    },
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "List categories",
        responses: {
          200: {
            description: "Category list",
            ...json(arrayOf(ref("CategoryRecord")), [
              { name: "Personal Care", parentId: null },
            ]),
          },
        },
      },
      post: {
        tags: ["Categories"],
        summary: "Create category",
        requestBody: {
          required: true,
          ...json(ref("CategoryCreateRequest"), {
            name: "Oral Care",
            description: "Products related to oral hygiene",
            parentId: null,
          }),
        },
        responses: {
          201: { description: "Category created", ...json(ref("CategoryRecord")) },
          400: responses.validationFailed,
          409: responses.conflict("Category already exists"),
        },
      },
    },
    "/categories/{id}": {
      get: {
        tags: ["Categories"],
        summary: "Get category by id",
        parameters: [idParam()],
        responses: {
          200: { description: "Category found", ...json(ref("CategoryRecord")) },
          404: responses.notFound("Category not found"),
        },
      },
      patch: {
        tags: ["Categories"],
        summary: "Update category",
        parameters: [idParam()],
        requestBody: {
          required: true,
          ...json(ref("CategoryUpdateRequest"), {
            name: "Oral Care",
            description: "Products related to oral hygiene",
            parentId: null,
            isActive: true,
          }),
        },
        responses: {
          200: { description: "Category updated", ...json(ref("CategoryRecord")) },
          400: responses.validationFailed,
          404: responses.notFound("Category not found"),
          409: responses.conflict("Category already exists"),
        },
      },
      delete: {
        tags: ["Categories"],
        summary: "Archive category",
        parameters: [idParam()],
        responses: {
          200: {
            description: "Category archived",
            ...json(ref("MessageResponse"), {
              message: "Category archived successfully",
            }),
          },
          404: responses.notFound("Category not found"),
        },
      },
    },
    ...masterDataModules,
    "/products": {
      get: {
        tags: ["Products"],
        summary: "List products",
        responses: {
          200: { description: "Product list", ...json(arrayOf(ref("Product"))) },
        },
      },
      post: {
        tags: ["Products"],
        summary: "Create product",
        requestBody: {
          required: true,
          ...json(ref("ProductRequest"), {
            name: "Biogesic 500mg Tablet",
            sku: "BIOG-500-TAB",
            categoryId: null,
            classificationId: null,
            genericDrugId: null,
            dosageFormId: null,
            brandId: null,
            genericName: null,
            brandName: null,
            dosageForm: null,
            strength: "500mg",
            unit: "tablet",
            productType: "MEDICINE",
            defaultSellingPrice: 5,
            reorderLevel: 10,
            requiresPrescription: false,
            requiresExpiryTracking: true,
            requiresLotTracking: true,
          }),
        },
        responses: {
          201: { description: "Product created", ...json(ref("Product")) },
          400: responses.validationFailed,
          409: responses.conflict("Product already exists"),
        },
      },
    },
    "/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get product by id",
        parameters: [idParam()],
        responses: {
          200: { description: "Product found", ...json(ref("Product")) },
          404: responses.notFound("Product not found"),
        },
      },
      patch: {
        tags: ["Products"],
        summary: "Update product",
        parameters: [idParam()],
        requestBody: {
          required: true,
          ...json(ref("ProductUpdateRequest"), {
            name: "Biogesic 500mg Tablet",
            status: "ACTIVE",
          }),
        },
        responses: {
          200: { description: "Product updated", ...json(ref("Product")) },
          400: responses.validationFailed,
          404: responses.notFound("Product not found"),
          409: responses.conflict("SKU already exists"),
        },
      },
      delete: {
        tags: ["Products"],
        summary: "Archive product",
        parameters: [idParam()],
        responses: {
          200: {
            description: "Product archived",
            ...json(ref("MessageResponse"), {
              message: "Product archived successfully",
            }),
          },
          404: responses.notFound("Product not found"),
        },
      },
    },
    "/products/{id}/aliases": {
      get: {
        tags: ["Product Aliases"],
        summary: "List product aliases",
        parameters: [idParam("id", "Product id")],
        responses: {
          200: {
            description: "Alias list",
            ...json(arrayOf(ref("ProductAlias"))),
          },
          404: responses.notFound("Product not found"),
        },
      },
      post: {
        tags: ["Product Aliases"],
        summary: "Create product alias",
        parameters: [idParam("id", "Product id")],
        requestBody: {
          required: true,
          ...json(
            {
              type: "object",
              properties: { alias: { type: "string" } },
              required: ["alias"],
            },
            { alias: "BIOGESIC TAB 500MG" },
          ),
        },
        responses: {
          201: { description: "Alias created", ...json(ref("ProductAlias")) },
          400: responses.validationFailed,
          404: responses.notFound("Product not found"),
          409: responses.conflict("Alias already exists"),
        },
      },
    },
    "/products/{id}/aliases/{aliasId}": {
      delete: {
        tags: ["Product Aliases"],
        summary: "Delete product alias",
        parameters: [idParam("id", "Product id"), idParam("aliasId", "Alias id")],
        responses: {
          200: {
            description: "Alias removed",
            ...json(ref("MessageResponse"), {
              message: "Alias removed successfully",
            }),
          },
          404: responses.notFound("Alias not found"),
        },
      },
    },
    "/products/{id}/barcodes": {
      get: {
        tags: ["Product Barcodes"],
        summary: "List product barcodes",
        parameters: [idParam("id", "Product id")],
        responses: {
          200: {
            description: "Barcode list",
            ...json(arrayOf(ref("ProductBarcode"))),
          },
          404: responses.notFound("Product not found"),
        },
      },
      post: {
        tags: ["Product Barcodes"],
        summary: "Create product barcode",
        parameters: [idParam("id", "Product id")],
        requestBody: {
          required: true,
          ...json(
            {
              type: "object",
              properties: { barcode: { type: "string" } },
              required: ["barcode"],
            },
            { barcode: "4800016645012" },
          ),
        },
        responses: {
          201: { description: "Barcode created", ...json(ref("ProductBarcode")) },
          400: responses.validationFailed,
          404: responses.notFound("Product not found"),
          409: responses.conflict("Barcode already exists"),
        },
      },
    },
    "/products/{id}/barcodes/{barcodeId}": {
      delete: {
        tags: ["Product Barcodes"],
        summary: "Delete product barcode",
        parameters: [
          idParam("id", "Product id"),
          idParam("barcodeId", "Barcode id"),
        ],
        responses: {
          200: {
            description: "Barcode removed",
            ...json(ref("MessageResponse"), {
              message: "Barcode removed successfully",
            }),
          },
          404: responses.notFound("Barcode not found"),
        },
      },
    },
    "/stock-ins": {
      get: {
        tags: ["Stock In"],
        summary: "List stock-ins",
        responses: {
          200: { description: "Stock-in list", ...json(arrayOf({ type: "object" })) },
        },
      },
      post: {
        tags: ["Stock In"],
        summary: "Create stock-in draft",
        requestBody: {
          required: true,
          ...json(ref("StockInCreateRequest"), {
            supplierId: null,
            receivedByUserId: "00000000-0000-0000-0000-000000000000",
            sourceType: "MANUAL",
            referenceType: "MANUAL",
            referenceNumber: "DR-1001",
            receivedDate: "2026-07-02",
            notes: "Opening inventory",
            items: [
              {
                productId: "00000000-0000-0000-0000-000000000000",
                quantity: 100,
                buyingPrice: 3,
                sellingPrice: 5,
                expirationDate: "2027-07-02",
                lotNumber: "LOT-001",
              },
            ],
          }),
        },
        responses: {
          201: { description: "Stock-in draft created", ...json({ type: "object" }) },
          400: responses.validationFailed,
        },
      },
    },
    "/stock-ins/{id}": {
      get: {
        tags: ["Stock In"],
        summary: "Get stock-in by id",
        parameters: [idParam()],
        responses: {
          200: { description: "Stock-in found", ...json({ type: "object" }) },
          404: responses.notFound("Stock in not found"),
        },
      },
    },
    "/stock-ins/{id}/post": {
      post: {
        tags: ["Stock In"],
        summary: "Post a stock-in draft",
        parameters: [idParam()],
        responses: {
          200: { description: "Stock-in posted", ...json({ type: "object" }) },
          400: responses.validationFailed,
          404: responses.notFound("Stock in not found"),
          409: responses.conflict("Stock in cannot be posted"),
        },
      },
    },
    "/inventory-levels": {
      get: {
        tags: ["Inventory Levels"],
        summary: "List product inventory levels",
        responses: {
          200: {
            description: "Inventory levels",
            ...json(arrayOf(ref("InventoryLevel"))),
          },
        },
      },
    },
    "/inventory-levels/products/{productId}": {
      get: {
        tags: ["Inventory Levels"],
        summary: "Get inventory level for one product",
        parameters: [idParam("productId", "Product id")],
        responses: {
          200: { description: "Product inventory level", ...json({ type: "object" }) },
          404: responses.notFound("Product not found"),
        },
      },
    },
    "/inventory-levels/low-stock": {
      get: {
        tags: ["Inventory Levels"],
        summary: "List low-stock products",
        responses: {
          200: {
            description: "Low-stock product list",
            ...json(arrayOf(ref("InventoryLevel"))),
          },
        },
      },
    },
    "/inventory-levels/expiring-soon": {
      get: {
        tags: ["Inventory Levels"],
        summary: "List batches expiring within 90 days",
        responses: {
          200: {
            description: "Expiring batch list",
            ...json(arrayOf({ type: "object" })),
          },
        },
      },
    },
    "/stock-adjustments": {
      get: {
        tags: ["Stock Adjustments"],
        summary: "List stock adjustments",
        responses: {
          200: {
            description: "Stock adjustment list",
            ...json(arrayOf({ type: "object" })),
          },
        },
      },
      post: {
        tags: ["Stock Adjustments"],
        summary: "Create and apply stock adjustment",
        requestBody: {
          required: true,
          ...json(ref("StockAdjustmentCreateRequest"), {
            adjustedByUserId: "00000000-0000-0000-0000-000000000000",
            reason: "Damaged items",
            notes: "Removed damaged stock",
            items: [
              {
                productId: "00000000-0000-0000-0000-000000000000",
                inventoryBatchId: "00000000-0000-0000-0000-000000000000",
                quantityChange: -5,
                notes: "Broken packaging",
              },
            ],
          }),
        },
        responses: {
          201: {
            description: "Stock adjustment applied",
            ...json({ type: "object" }),
          },
          400: responses.validationFailed,
          409: responses.conflict("Stock adjustment cannot be applied"),
        },
      },
    },
    "/stock-adjustments/{id}": {
      get: {
        tags: ["Stock Adjustments"],
        summary: "Get stock adjustment by id",
        parameters: [idParam()],
        responses: {
          200: { description: "Stock adjustment found", ...json({ type: "object" }) },
          404: responses.notFound("Stock adjustment not found"),
        },
      },
    },
    "/sales": {
      get: {
        tags: ["Sales"],
        summary: "List sales",
        responses: {
          200: { description: "Sale list", ...json(arrayOf({ type: "object" })) },
        },
      },
      post: {
        tags: ["Sales"],
        summary: "Create completed sale and deduct inventory",
        requestBody: {
          required: true,
          ...json(ref("SaleCreateRequest"), {
            saleDate: "2026-07-02",
            notes: "Simple sale",
            items: [
              {
                productId: "00000000-0000-0000-0000-000000000000",
                quantity: 2,
                sellingPrice: 5,
              },
            ],
          }),
        },
        responses: {
          201: { description: "Sale completed", ...json({ type: "object" }) },
          400: responses.validationFailed,
          409: responses.conflict("Insufficient stock"),
        },
      },
    },
    "/sales/{id}": {
      get: {
        tags: ["Sales"],
        summary: "Get sale by id",
        parameters: [idParam()],
        responses: {
          200: { description: "Sale found", ...json({ type: "object" }) },
          400: responses.validationFailed,
          404: responses.notFound("Sale not found"),
        },
      },
    },
  },
};

export const swaggerSpec = swaggerJsdoc({
  definition,
  apis: [],
});

export const registerSwaggerDocs = (app: Express) => {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
