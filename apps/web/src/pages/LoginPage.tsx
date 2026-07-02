import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../hooks/useAuth";
import { ApiRequestError } from "../lib/api";

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState("admin@botika.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (caughtError) {
      if (caughtError instanceof ApiRequestError && caughtError.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError("Unable to reach the API. Please make sure the backend is running.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div>
          <p className="eyebrow">Botika</p>
          <h1>Sign in</h1>
          <p>Use your staff account to continue.</p>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
          <Input
            label="Email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
          <Input
            label="Password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />

          {error ? <p className="form-error">{error}</p> : null}

          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Signing in..." : "Login"}
          </Button>
        </form>
      </section>
    </main>
  );
}
