import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../api";
import { PaymentMethodsInfo } from "../components/PaymentMethodsInfo";

const COLORS: { hex: string; name: string }[] = [
  { hex: "#8b4513", name: "Коричневый" },
  { hex: "#deb887", name: "Бежевый" },
  { hex: "#f5deb3", name: "Светло-бежевый" },
  { hex: "#000000", name: "Черный" },
  { hex: "#ffffff", name: "Белый" },
  { hex: "#ff6b6b", name: "Красный" },
  { hex: "#4ecdc4", name: "Бирюзовый" },
  { hex: "#45b7d1", name: "Голубой" },
  { hex: "#96ceb4", name: "Мятный" },
  { hex: "#ffeaa7", name: "Желтый" },
  { hex: "#dda0dd", name: "Розовый" },
  { hex: "#98d8c8", name: "Зеленый" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "По размеру"] as const;

const PRODUCTS: { id: string; title: string; desc: string; icon: string; wide?: boolean }[] = [
  { id: "корзинки", title: "Корзинки", desc: "Уютные вязаные корзинки для хранения", icon: "fa-shopping-basket" },
  { id: "сумки", title: "Сумки", desc: "Стильные вязаные сумки", icon: "fa-shopping-bag" },
  { id: "тапочки", title: "Тапочки", desc: "Мягкие вязаные тапочки", icon: "fa-shoe-prints" },
  { id: "брелки", title: "Брелки", desc: "Очаровательные вязаные брелки", icon: "fa-key" },
  { id: "ваши предложения", title: "Ваши предложения", desc: "Есть идея? Расскажите нам!", icon: "fa-lightbulb", wide: true },
];

export function Order() {
  const navigate = useNavigate();
  const [productType, setProductType] = useState("");
  const [selectedColorNames, setSelectedColorNames] = useState<string[]>([]);
  const [colorsExtra, setColorsExtra] = useState("");
  const [pickedSize, setPickedSize] = useState("");
  const [sizesExtra, setSizesExtra] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [description, setDescription] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [flash, setFlash] = useState<{ type: "err"; text: string } | null>(null);
  const [orderPlaced, setOrderPlaced] = useState<{ id: number; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!orderPlaced) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [orderPlaced]);

  /** Без префиксов «Выбранные цвета:» — в письме уже есть заголовок «Цвета:» */
  const colorsField = useMemo(() => {
    const picked = selectedColorNames.join(", ");
    const extra = colorsExtra.trim();
    if (picked && extra) return `${picked}. ${extra}`;
    if (picked) return picked;
    if (extra) return extra;
    return "—";
  }, [selectedColorNames, colorsExtra]);

  const sizesField = useMemo(() => {
    const extra = sizesExtra.trim();
    if (pickedSize && extra) return `${pickedSize}. ${extra}`;
    if (pickedSize) return pickedSize;
    if (extra) return extra;
    return "—";
  }, [pickedSize, sizesExtra]);

  const [preferredPayment, setPreferredPayment] = useState("");

  function toggleColor(name: string) {
    setSelectedColorNames((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name],
    );
  }

  function resetForm() {
    setProductType("");
    setSelectedColorNames([]);
    setColorsExtra("");
    setPickedSize("");
    setSizesExtra("");
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setDescription("");
    setDeliveryAddress("");
    setPreferredPayment("");
    setFlash(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productType) {
      setFlash({ type: "err", text: "Пожалуйста, выберите товар" });
      return;
    }
    setLoading(true);
    setFlash(null);
    try {
      const res = await apiPost<{ message?: string; order_id?: number }>("/api/orders", {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        product_type: productType,
        description,
        colors: colorsField,
        sizes: sizesField,
        delivery_address: deliveryAddress,
        preferred_payment: preferredPayment,
      });
      const oid = typeof res.order_id === "number" ? res.order_id : 0;
      setOrderPlaced({
        id: oid,
        message: res.message || "Заказ успешно отправлен. Мы свяжемся с вами в ближайшее время.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setFlash({
        type: "err",
        text: err instanceof Error ? err.message : "Ошибка отправки",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold">Оформить заказ</h1>
              <p className="lead text-muted">Заполните форму — мы свяжемся с вами</p>
            </div>

            {flash && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                {flash.text}
                <button type="button" className="btn-close" aria-label="Закрыть" onClick={() => setFlash(null)} />
              </div>
            )}

            <form className="order-form" onSubmit={onSubmit}>
              <div className="form-section-order">
                <h3 className="mb-4">
                  <i className="fas fa-user me-2 text-primary" />
                  Контактная информация
                </h3>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="customer_name">
                      Ваше имя *
                    </label>
                    <input
                      id="customer_name"
                      className="form-control"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="customer_email">
                      Email *
                    </label>
                    <input
                      id="customer_email"
                      type="email"
                      className="form-control"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="customer_phone">
                    Номер телефона *
                  </label>
                  <input
                    id="customer_phone"
                    type="tel"
                    className="form-control"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-section-order">
                <h3 className="mb-4">
                  <i className="fas fa-shopping-cart me-2 text-primary" />
                  Выберите товар
                </h3>
                <div className="row">
                  {PRODUCTS.map((p) => (
                    <div key={p.id} className={p.wide ? "col-12 mb-3" : "col-md-6 mb-3"}>
                      <div
                        role="button"
                        tabIndex={0}
                        className={`product-card-pick ${productType === p.id ? "selected" : ""}`}
                        onClick={() => setProductType(p.id)}
                        onKeyDown={(ev) => {
                          if (ev.key === "Enter" || ev.key === " ") {
                            ev.preventDefault();
                            setProductType(p.id);
                          }
                        }}
                      >
                        <div className="text-center">
                          <i className={`fas ${p.icon} fa-2x text-primary mb-2`} />
                          <h5>{p.title}</h5>
                          <p className="text-muted mb-0">{p.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-section-order">
                <h3 className="mb-4">
                  <i className="fas fa-edit me-2 text-primary" />
                  Описание заказа
                </h3>
                <div className="mb-3">
                  <label className="form-label" htmlFor="description">
                    Подробное описание *
                  </label>
                  <textarea
                    id="description"
                    className="form-control"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    placeholder="Например: форма сумки, ручки, подкладка, застёжка…"
                  />
                  <div className="form-text">Опишите изделие словами: это попадёт в заказ и в письмо мастеру.</div>
                </div>
              </div>

              <div className="form-section-order">
                <h3 className="mb-4">
                  <i className="fas fa-palette me-2 text-primary" />
                  Цвета
                </h3>
                <div className="mb-3">
                  <label className="form-label">Предпочитаемые цвета</label>
                  <div className="d-flex flex-wrap gap-3">
                    {COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        title={c.name}
                        className={`color-option-pick ${selectedColorNames.includes(c.name) ? "selected" : ""}`}
                        style={{
                          backgroundColor: c.hex,
                          border: c.hex === "#ffffff" ? "1px solid #ccc" : undefined,
                        }}
                        onClick={() => toggleColor(c.name)}
                        aria-label={c.name}
                      />
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="colors_extra">
                    Дополнительные пожелания по цветам
                  </label>
                  <input
                    id="colors_extra"
                    className="form-control"
                    value={colorsExtra}
                    onChange={(e) => setColorsExtra(e.target.value)}
                    placeholder="Например: сочетание белого и голубого..."
                  />
                </div>
              </div>

              <div className="form-section-order">
                <h3 className="mb-4">
                  <i className="fas fa-ruler me-2 text-primary" />
                  Размеры
                </h3>
                <div className="mb-3">
                  <label className="form-label">Выберите размер</label>
                  <div className="row">
                    {SIZES.map((s) => (
                      <div
                        key={s}
                        className={s === "По размеру" ? "col-12 col-md-6 mb-2" : "col-6 col-md-3 mb-2"}
                      >
                        <div
                          role="button"
                          tabIndex={0}
                          className={`size-option-pick ${pickedSize === s ? "selected" : ""}`}
                          onClick={() => setPickedSize(s)}
                          onKeyDown={(ev) => {
                            if (ev.key === "Enter" || ev.key === " ") {
                              ev.preventDefault();
                              setPickedSize(s);
                            }
                          }}
                        >
                          {s}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="sizes_extra">
                    Дополнительные пожелания по размерам
                  </label>
                  <input
                    id="sizes_extra"
                    className="form-control"
                    value={sizesExtra}
                    onChange={(e) => setSizesExtra(e.target.value)}
                    placeholder="Например: длина 30 см..."
                  />
                </div>
              </div>

              <div className="form-section-order">
                <h3 className="mb-4">
                  <i className="fas fa-map-marker-alt me-2 text-primary" />
                  Адрес доставки
                </h3>
                <div className="alert alert-info mb-3">
                  <h6>
                    <i className="fas fa-info-circle me-2" />
                    Информация о доставке:
                  </h6>
                  <ul className="mb-0">
                    <li>
                      <strong>Минск:</strong> бесплатная доставка по городу
                    </li>
                    <li>
                      <strong>РБ:</strong> доставка по почте (Белпочта или Европочта)
                    </li>
                  </ul>
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="delivery_address">
                    Полный адрес доставки *
                  </label>
                  <textarea
                    id="delivery_address"
                    className="form-control"
                    rows={3}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
                    placeholder="Город, улица, дом, квартира, индекс..."
                  />
                </div>
              </div>

              <div className="form-section-order">
                <PaymentMethodsInfo />
                <div className="mt-4">
                  <label className="form-label" htmlFor="preferred_payment">
                    Предпочтительный способ оплаты
                  </label>
                  <select
                    id="preferred_payment"
                    className="form-select"
                    value={preferredPayment}
                    onChange={(e) => setPreferredPayment(e.target.value)}
                  >
                    <option value="">Не выбрано — согласуем в переписке</option>
                    <option value="Наличные при получении">Наличные при получении</option>
                    <option value="Перевод на карту">Перевод на карту</option>
                    <option value="ЕРИП (Расчёт)">ЕРИП (Расчёт)</option>
                  </select>
                </div>
              </div>

              <p className="small text-muted text-center mb-3 px-2">
                Отправляя заказ, вы соглашаетесь с{" "}
                <Link to="/privacy">обработкой персональных данных</Link> и{" "}
                <Link to="/terms">условиями заказа</Link>.
              </p>

              <div className="text-center">
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading || !!orderPlaced}>
                  <i className="fas fa-paper-plane me-2" />
                  {loading ? "Отправка…" : "Отправить заказ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {orderPlaced && (
        <div
          className="order-success-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-success-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOrderPlaced(null);
          }}
        >
          <div className="modal-inner" onClick={(e) => e.stopPropagation()}>
            <div className="order-success-icon" aria-hidden>
              <i className="fas fa-check fa-2x text-success" />
            </div>
            <h2 id="order-success-title" className="h4 fw-bold mb-2">
              Заказ оформлен!
            </h2>
            <p className="mb-2">{orderPlaced.message}</p>
            {orderPlaced.id > 0 && (
              <p className="text-muted small mb-2">
                Номер заказа: <strong>#{orderPlaced.id}</strong>
              </p>
            )}
            <p className="text-muted small mb-0">
              Сохраните номер заказа для переписки. Мы ответим по указанным контактам и согласуем оплату.
            </p>
            <div className="d-flex flex-wrap gap-2 justify-content-center mt-4">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setOrderPlaced(null);
                  resetForm();
                  navigate("/");
                }}
              >
                На главную
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setOrderPlaced(null);
                  resetForm();
                }}
              >
                Оформить ещё один заказ
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
