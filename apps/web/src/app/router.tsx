import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "../components/layout/AppLayout";
import { BrandsPage } from "../pages/BrandsPage";
import { CategoriesPage } from "../pages/CategoriesPage";
import { DashboardPage } from "../pages/DashboardPage";
import { DosageFormsPage } from "../pages/DosageFormsPage";
import { GenericDrugsPage } from "../pages/GenericDrugsPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ProductClassificationsPage } from "../pages/ProductClassificationsPage";
import { ProductsPage } from "../pages/ProductsPage";
import { StockInsPage } from "../pages/StockInsPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
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
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
