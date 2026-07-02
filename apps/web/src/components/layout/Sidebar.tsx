import { NavLink } from "react-router-dom";

type NavItem = {
  label: string;
  path: string;
};

type NavGroup = {
  title?: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    items: [{ label: "Dashboard", path: "/" }],
  },
  {
    title: "Master Data",
    items: [
      { label: "Categories", path: "/categories" },
      {
        label: "Product Classifications",
        path: "/master-data/product-classifications",
      },
      { label: "Generic Drugs", path: "/master-data/generic-drugs" },
      { label: "Dosage Forms", path: "/master-data/dosage-forms" },
      { label: "Brands", path: "/brands" },
    ],
  },
  {
    items: [{ label: "Products", path: "/products" }],
  },
  {
    title: "Inventory",
    items: [
      { label: "Stock In", path: "/stock-ins" },
      { label: "Inventory Levels", path: "/inventory" },
      { label: "Stock Adjustments", path: "/stock-adjustments" },
    ],
  },
  {
    items: [{ label: "Sales", path: "/sales" }],
  },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">B</span>
        <div>
          <strong>Botika</strong>
          <span>Management</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Primary navigation">
        {navGroups.map((group, groupIndex) => (
          <div className="nav-group" key={group.title ?? groupIndex}>
            {group.title ? <p className="nav-group-title">{group.title}</p> : null}
            {group.items.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link nav-link-active" : "nav-link"
                }
                key={item.path}
                to={item.path}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
