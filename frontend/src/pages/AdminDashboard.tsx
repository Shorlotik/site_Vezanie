import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, apiGet } from "../api";
import { formatDateMinsk } from "../minskDate";
import type { OrderDto } from "../types";

function statusClass(status: string): string {
  if (status === "Новый") return "status-badge-new";
  if (status === "В обработке") return "status-badge-processing";
  if (status === "Завершен") return "status-badge-done";
  return "status-badge-new";
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiGet<{ orders: OrderDto[] }>("/api/admin/orders")
      .then((d) => {
        if (!cancelled) setOrders(d.orders);
      })
      .catch((err) => {
        if (!cancelled) {
          if (err instanceof ApiError && err.status === 401) navigate("/admin/login");
          else setError(err instanceof Error ? err.message : "Ошибка загрузки");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const stats = useMemo(() => {
    const total = orders.length;
    const nov = orders.filter((o) => o.status === "Новый").length;
    const proc = orders.filter((o) => o.status === "В обработке").length;
    const done = orders.filter((o) => o.status === "Завершен").length;
    return { total, nov, proc, done };
  }, [orders]);

  return (
    <>
      <div className="admin-header-bar">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="mb-2">
                <i className="fas fa-tachometer-alt me-2" />
                Админ панель
              </h1>
              <p className="mb-0 opacity-75">Управление заказами</p>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <Link to="/" className="btn btn-outline-light">
                <i className="fas fa-home me-2" />
                На сайт
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row mb-4">
          {[
            { icon: "fa-shopping-cart", n: stats.total, label: "Всего заказов" },
            { icon: "fa-clock", n: stats.nov, label: "Новых" },
            { icon: "fa-cogs", n: stats.proc, label: "В обработке" },
            { icon: "fa-check-circle", n: stats.done, label: "Завершенных" },
          ].map((s) => (
            <div key={s.label} className="col-md-3">
              <div className="stats-card-admin">
                <i className={`fas ${s.icon}`} />
                <h3>{s.n}</h3>
                <p className="text-muted mb-0">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="order-table-wrap">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>№</th>
                  <th>Клиент</th>
                  <th>Товар</th>
                  <th>Дата (Минск)</th>
                  <th>Статус</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-muted">
                      <i className="fas fa-inbox fa-3x mb-3 d-block" />
                      Заказов пока нет
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => {
                    const { d, t } = formatDateMinsk(o.order_date);
                    return (
                      <tr key={o.id}>
                        <td>
                          <strong>#{o.id}</strong>
                        </td>
                        <td>
                          <strong>{o.customer_name}</strong>
                          <br />
                          <small className="text-muted">{o.customer_email}</small>
                          <br />
                          <small className="text-muted">{o.customer_phone}</small>
                        </td>
                        <td>
                          <strong>{o.product_type}</strong>
                          <br />
                          <small className="text-muted">
                            {o.description.length > 50 ? `${o.description.slice(0, 50)}…` : o.description}
                          </small>
                        </td>
                        <td>
                          <strong>{d}</strong>
                          <br />
                          <small className="text-muted">{t}</small>
                        </td>
                        <td>
                          <span className={statusClass(o.status)}>{o.status}</span>
                        </td>
                        <td>
                          <Link to={`/admin/order/${o.id}`} className="btn btn-primary btn-sm">
                            <i className="fas fa-eye me-1" />
                            Просмотр
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="row mt-4 mb-5">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="fas fa-tools me-2" />
                  Быстрые действия
                </h5>
                <div className="row">
                  <div className="col-md-4">
                    <Link to="/" className="btn btn-outline-primary w-100 mb-2">
                      <i className="fas fa-home me-2" />
                      Перейти на сайт
                    </Link>
                  </div>
                  <div className="col-md-4">
                    <a href="mailto:vezanienashedelo@gmail.com" className="btn btn-outline-success w-100 mb-2">
                      <i className="fas fa-envelope me-2" />
                      Открыть почту
                    </a>
                  </div>
                  <div className="col-md-4">
                    <button type="button" className="btn btn-outline-secondary w-100 mb-2" onClick={() => window.print()}>
                      <i className="fas fa-print me-2" />
                      Печать
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
