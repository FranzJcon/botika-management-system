import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";

export function Header() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="app-header">
      <div>
        <h1>Botika Management System</h1>
        <p>Smart inventory foundation</p>
      </div>
      <div className="header-user">
        <span>{user?.displayName ?? "Signed in"}</span>
        <Button variant="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
