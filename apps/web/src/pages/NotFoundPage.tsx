import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="page not-found">
      <p className="eyebrow">404</p>
      <h2>Page not found</h2>
      <p className="page-summary">
        This section is reserved for a future Botika workflow screen.
      </p>
      <Link className="button button-primary not-found-button" to="/">
        Back to dashboard
      </Link>
    </section>
  );
}
