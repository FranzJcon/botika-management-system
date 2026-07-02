import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "../components/layout/AppLayout";
import { BrandsPage } from "../pages/BrandsPage";
import { CategoriesPage } from "../pages/CategoriesPage";
import { DashboardPage } from "../pages/DashboardPage";
import { DosageFormsPage } from "../pages/DosageFormsPage";
import { GenericDrugsPage } from "../pages/GenericDrugsPage";
import { NotFoundPage } from "../pages/NotFoundPage";

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
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
