import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../api";

export function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiPost("/api/admin/login", { username, password });
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-box">
        <div className="text-center mb-4">
          <i className="fas fa-lock fa-3x mb-3" style={{ color: "#ffb6c1" }} />
          <h2>Вход в админ панель</h2>
          <p className="text-muted">Введите учётные данные</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="username">
              Имя пользователя
            </label>
            <input
              id="username"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label" htmlFor="password">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            <i className="fas fa-sign-in-alt me-2" />
            {loading ? "Вход…" : "Войти"}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link to="/" className="text-decoration-none">
            <i className="fas fa-arrow-left me-2" />
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
