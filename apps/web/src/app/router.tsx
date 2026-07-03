import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppLayout } from "../components/layout/AppLayout";
import { getAuthToken } from "../lib/api";
import { BrandsPage } from "../pages/BrandsPage";
import { CategoriesPage } from "../pages/CategoriesPage";
import { DashboardPage } from "../pages/DashboardPage";
import { DosageFormsPage } from "../pages/DosageFormsPage";
import { GenericDrugsPage } from "../pages/GenericDrugsPage";
import { InventoryLevelsPage } from "../pages/InventoryLevelsPage";
import { LoginPage } from "../pages/LoginPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ProductClassificationsPage } from "../pages/ProductClassificationsPage";
import { ProductsPage } from "../pages/ProductsPage";
import { SalesPage } from "../pages/SalesPage";
import { StockAdjustmentsPage } from "../pages/StockAdjustmentsPage";
import { StockImportPage } from "../pages/StockImportPage";
import { StockInsPage } from "../pages/StockInsPage";

function ProtectedLayout() {
  return getAuthToken() ? <AppLayout /> : <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  {
    path: "login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "categories",
        element: <CategoriesPage />,
      },
      {
        path: "brands",
        element: <BrandsPage />,
      },
      {
        path: "dosage-forms",
        element: <DosageFormsPage />,
      },
      {
        path: "generic-drugs",
        element: <GenericDrugsPage />,
      },
      {
        path: "product-classifications",
        element: <ProductClassificationsPage />,
      },
      {
        path: "products",
        element: <ProductsPage />,
      },
      {
        path: "stock-ins",
        element: <StockInsPage />,
      },
      {
        path: "stock-import",
        element: <StockImportPage />,
      },
      {
        path: "inventory",
        element: <InventoryLevelsPage />,
      },
      {
        path: "sales",
        element: <SalesPage />,
      },
      {
        path: "stock-adjustments",
        element: <StockAdjustmentsPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
