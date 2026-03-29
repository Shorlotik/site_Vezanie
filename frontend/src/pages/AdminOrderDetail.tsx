import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiError, apiGet, apiPatch } from "../api";
import type { OrderDto } from "../types";
import { formatDateTimeMinsk } from "../minskDate";

export function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    apiGet<{ order: OrderDto }>(`/api/admin/orders/${id}`)
      .then((d) => {
        if (!cancelled) {
          setOrder(d.order);
          setStatus(d.order.status);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          if (err instanceof ApiError && err.status === 401) navigate("/admin/login");
          else if (err instanceof ApiError && err.status === 404) navigate("/admin/dashboard");
          else setError(err instanceof Error ? err.message : "Ошибка");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  async function saveStatus(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      const d = await apiPatch<{ order: OrderDto }>(`/api/admin/orders/${id}/status`, { status });
      setOrder(d.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  if (!order && !error) {
    return (
      <div className="container py-5 text-center text-muted">
        <i className="fas fa-spinner fa-spin fa-2x" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
        <Link to="/admin/dashboard">Назад</Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/admin/dashboard">
              <i className="fas fa-tachometer-alt me-1" />
              Админ панель
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Заказ #{order.id}
          </li>
        </ol>
      </nav>

      {error && <div className="alert alert-warning">{error}</div>}

      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 overflow-hidden">
            <div
              className="text-white p-4"
              style={{ background: "linear-gradient(135deg, #ffb6c1, #ffc0cb)" }}
            >
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h1 className="h3 mb-2">
                    <i className="fas fa-shopping-cart me-2" />
                    Заказ #{order.id}
                  </h1>
                  <p className="mb-0 opacity-90">
                    <i className="fas fa-calendar me-2" />
                    {formatDateTimeMinsk(order.order_date)}
                    <span className="small ms-1 opacity-75">(Минск)</span>
                  </p>
                </div>
                <div className="col-md-4 text-md-end mt-2 mt-md-0">
                  <span className="badge bg-light text-dark fs-6">{order.status}</span>
                </div>
              </div>
            </div>
            <div className="card-body p-4">
              <section className="mb-4 pb-4 border-bottom">
                <h4 className="mb-3">
                  <i className="fas fa-user me-2 text-primary" />
                  Клиент
                </h4>
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <div className="fw-semibold text-secondary small">Имя</div>
                    {order.customer_name}
                  </div>
                  <div className="col-md-6 mb-2">
                    <div className="fw-semibold text-secondary small">Email</div>
                    <a href={`mailto:${order.customer_email}`}>{order.customer_email}</a>
                  </div>
                  <div className="col-md-6 mb-2">
                    <div className="fw-semibold text-secondary small">Телефон</div>
                    <a href={`tel:${order.customer_phone}`}>{order.customer_phone}</a>
                  </div>
                </div>
              </section>
              <section className="mb-4 pb-4 border-bottom">
                <h4 className="mb-3">
                  <i className="fas fa-box me-2 text-primary" />
                  Товар
                </h4>
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <div className="fw-semibold text-secondary small">Тип</div>
                    {order.product_type}
                  </div>
                  <div className="col-md-6 mb-2">
                    <div className="fw-semibold text-secondary small">Цвета</div>
                    {order.colors || "—"}
                  </div>
                  <div className="col-md-6 mb-2">
                    <div className="fw-semibold text-secondary small">Размеры</div>
                    {order.sizes || "—"}
                  </div>
                  <div className="col-md-6 mb-2">
                    <div className="fw-semibold text-secondary small">Оплата (из формы)</div>
                    {order.preferred_payment?.trim() ? order.preferred_payment : "—"}
                  </div>
                </div>
                <div className="mt-2">
                  <div className="fw-semibold text-secondary small">Описание</div>
                  <div className="p-3 bg-light rounded">{order.description}</div>
                </div>
              </section>
              <section>
                <h4 className="mb-3">
                  <i className="fas fa-map-marker-alt me-2 text-primary" />
                  Адрес доставки
                </h4>
                <div className="p-3 bg-light rounded">{order.delivery_address}</div>
              </section>
            </div>
          </div>
        </div>

        <div className="col-lg-4 mt-4 mt-lg-0">
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-tools me-2" />
                Действия
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={saveStatus} className="p-3 bg-light rounded mb-3">
                <h6 className="mb-3">Статус заказа</h6>
                <select
                  className="form-select mb-3"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {["Новый", "В обработке", "Завершен", "Отменен"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn btn-primary w-100" disabled={saving}>
                  <i className="fas fa-save me-2" />
                  {saving ? "Сохранение…" : "Обновить статус"}
                </button>
              </form>
              <div className="d-grid gap-2">
                <a
                  href={`mailto:${order.customer_email}?subject=${encodeURIComponent(`Заказ #${order.id}`)}`}
                  className="btn btn-outline-primary"
                >
                  <i className="fas fa-envelope me-2" />
                  Написать клиенту
                </a>
                <a href={`tel:${order.customer_phone}`} className="btn btn-outline-success">
                  <i className="fas fa-phone me-2" />
                  Позвонить
                </a>
                <button type="button" className="btn btn-outline-secondary" onClick={() => window.print()}>
                  <i className="fas fa-print me-2" />
                  Печать
                </button>
                <Link to="/admin/dashboard" className="btn btn-outline-dark">
                  <i className="fas fa-arrow-left me-2" />
                  К списку
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
