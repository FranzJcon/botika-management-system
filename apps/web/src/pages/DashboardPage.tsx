import { Card } from "../components/ui/Card";

const dashboardCards = [
  {
    title: "Products",
    description: "Catalog and product details",
  },
  {
    title: "Inventory",
    description: "Stock visibility and batch tracking",
  },
  {
    title: "Stock In",
    description: "Receiving workflow foundation",
  },
  {
    title: "Sales",
    description: "Inventory stock-out workflow",
  },
];

export function DashboardPage() {
  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>Operations overview</h2>
        </div>
        <p className="page-summary">
          Core pharmacy workflows are ready for UI screens as the backend modules
          come online.
        </p>
      </div>

      <div className="dashboard-grid">
        {dashboardCards.map((card) => (
          <Card className="dashboard-card" key={card.title}>
            <div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
            <span>Coming soon</span>
          </Card>
        ))}
      </div>
    </section>
  );
}
