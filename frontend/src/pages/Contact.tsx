import { useEffect, useMemo, useState, type InputHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import { apiPost } from "../api";
import { SITE_NAME, SOCIAL } from "../site";

type MethodId = "email" | "telegram" | "vkontakte" | "instagram";

const METHODS: { id: MethodId; label: string; icon: string }[] = [
  { id: "email", label: "E-mail", icon: "fas fa-envelope" },
  { id: "telegram", label: "Telegram", icon: "fab fa-telegram" },
  { id: "vkontakte", label: "ВКонтакте", icon: "fab fa-vk" },
  { id: "instagram", label: "Instagram", icon: "fab fa-instagram" },
];

function validateContactDetail(method: MethodId | "", value: string): string | null {
  if (!method) return "Выберите способ связи";
  const v = value.trim();
  if (!v) return "Заполните поле для выбранного способа связи";
  if (method === "email") {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return null;
    return "Укажите корректный e-mail";
  }
  if (method === "telegram") {
    let u = v.replace(/^@+/, "");
    u = u.replace(/^https?:\/\/(t\.me|telegram\.me)\//i, "").replace(/\/$/, "");
    if (/^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(u)) return null;
    return "Укажите username Telegram (латиница, цифры, подчёркивание, от 5 символов)";
  }
  if (method === "instagram") {
    let u = v.replace(/^@+/, "");
    u = u.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/$/, "");
    if (/^[a-zA-Z0-9._]{1,30}$/.test(u)) return null;
    return "Укажите username Instagram (латиница, цифры, точка, подчёркивание)";
  }
  if (method === "vkontakte") {
    if (/^\S+(?:\s+\S+)+$/.test(v) && v.length >= 4) return null;
    return "Укажите имя и фамилию через пробел (как в профиле ВК)";
  }
  return null;
}

type DetailFieldProps = {
  label: string;
  placeholder: string;
  type: "email" | "text";
  autoComplete: InputHTMLAttributes<HTMLInputElement>["autoComplete"];
  inputMode: NonNullable<InputHTMLAttributes<HTMLInputElement>["inputMode"]>;
};

function detailFieldProps(method: MethodId | ""): DetailFieldProps {
  switch (method) {
    case "email":
      return {
        label: "E-mail для ответа *",
        placeholder: "например, name@mail.ru",
        type: "email",
        autoComplete: "email",
        inputMode: "email",
      };
    case "telegram":
      return {
        label: "Username в Telegram *",
        placeholder: "@username или только латиницей",
        type: "text",
        autoComplete: "username",
        inputMode: "text",
      };
    case "vkontakte":
      return {
        label: "Имя и фамилия в ВК *",
        placeholder: "Как в профиле ВКонтакте, через пробел",
        type: "text",
        autoComplete: "name",
        inputMode: "text",
      };
    case "instagram":
      return {
        label: "Username в Instagram *",
        placeholder: "@nickname или nickname",
        type: "text",
        autoComplete: "username",
        inputMode: "text",
      };
    default:
      return {
        label: "Контакт для ответа",
        placeholder: "Сначала выберите способ связи выше",
        type: "text",
        autoComplete: "off",
        inputMode: "text",
      };
  }
}

export function Contact() {
  const [method, setMethod] = useState<MethodId | "">("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactUsername, setContactUsername] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [flash, setFlash] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const detailProps = useMemo(() => detailFieldProps(method), [method]);

  useEffect(() => {
    setContactUsername("");
  }, [method]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!method) {
      setFlash({ type: "err", text: "Пожалуйста, выберите способ связи" });
      return;
    }
    const detailErr = validateContactDetail(method, contactUsername);
    if (detailErr) {
      setFlash({ type: "err", text: detailErr });
      return;
    }
    setLoading(true);
    setFlash(null);
    try {
      const res = await apiPost<{ message?: string }>("/api/contact", {
        contact_method: method,
        contact_name: contactName,
        contact_phone: contactPhone,
        contact_username: contactUsername.trim(),
        contact_subject: subject,
        contact_message: message,
      });
      setFlash({ type: "ok", text: res.message || "Сообщение отправлено." });
      setMessage("");
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
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold">Свяжитесь с нами</h1>
          <p className="lead text-muted">Выберите удобный способ связи или заполните форму</p>
        </div>

        {flash && (
          <div
            className={`alert ${flash.type === "ok" ? "alert-success" : "alert-danger"} alert-dismissible fade show`}
          >
            {flash.text}
            <button type="button" className="btn-close" aria-label="Закрыть" onClick={() => setFlash(null)} />
          </div>
        )}

        <div className="row">
          <div className="col-lg-6">
            <div className="contact-card">
              <div className="text-center mb-4">
                <i className="fas fa-user-circle fa-4x text-primary mb-3" />
                <h3>Лизавета Имховик</h3>
                <p className="text-muted">Рукодельница «{SITE_NAME}»</p>
              </div>
              <div className="mb-4">
                <h5>
                  <i className="fas fa-heart me-2 text-primary" />
                  О мастере
                </h5>
                <p>
                  Создаю красивые вязаные изделия с любовью и вниманием к каждой детали. Каждое изделие
                  уникально.
                </p>
              </div>
              <div className="mb-4">
                <h5>
                  <i className="fas fa-infinity me-2 text-primary" aria-hidden />
                  На связи 24/7
                </h5>
                <p className="mb-0">
                  Заказы и сообщения принимаю <strong>круглосуточно</strong>, без выходных — пишите, когда
                  удобно. Отвечу, как только смогу.
                </p>
              </div>
              <div className="mb-4">
                <h5>
                  <i className="fas fa-map-marker-alt me-2 text-primary" />
                  Доставка
                </h5>
                <p>
                  <strong>Минск:</strong> бесплатная доставка по городу
                </p>
                <p>
                  <strong>РБ:</strong> по почте (Белпочта или Европочта)
                </p>
              </div>
            </div>

            <div className="contact-card">
              <h4 className="text-center mb-4">
                <i className="fas fa-share-alt me-2 text-primary" />
                Мы в социальных сетях
              </h4>
              <div className="text-center">
                <a href={SOCIAL.instagram} target="_blank" rel="noreferrer" className="social-link instagram">
                  <i className="fab fa-instagram me-2" />
                  Instagram
                </a>
                <a href={SOCIAL.telegram} target="_blank" rel="noreferrer" className="social-link telegram">
                  <i className="fab fa-telegram me-2" />
                  Telegram канал
                </a>
                <a href={SOCIAL.vk} target="_blank" rel="noreferrer" className="social-link vkontakte">
                  <i className="fab fa-vk me-2" />
                  ВКонтакте
                </a>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="contact-form-block">
              <h3 className="text-center mb-4">
                <i className="fas fa-envelope me-2 text-primary" />
                Форма связи
              </h3>
              <form onSubmit={onSubmit} noValidate>
                <div className="mb-4">
                  <label className="form-label">Предпочитаемый способ связи *</label>
                  <div className="row">
                    {METHODS.map((m) => (
                      <div key={m.id} className="col-6 col-lg-3 mb-2">
                        <div
                          role="button"
                          tabIndex={0}
                          className={`contact-method ${method === m.id ? "selected" : ""}`}
                          onClick={() => setMethod(m.id)}
                          onKeyDown={(ev) => {
                            if (ev.key === "Enter" || ev.key === " ") {
                              ev.preventDefault();
                              setMethod(m.id);
                            }
                          }}
                        >
                          <i className={`${m.icon} text-primary`} />
                          <div>{m.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="contact_name">
                      Ваше имя *
                    </label>
                    <input
                      id="contact_name"
                      className="form-control"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="contact_phone">
                      Номер телефона
                    </label>
                    <input
                      id="contact_phone"
                      type="tel"
                      className="form-control"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="contact_username">
                    {detailProps.label}
                  </label>
                  <input
                    id="contact_username"
                    type={detailProps.type}
                    className="form-control"
                    placeholder={detailProps.placeholder}
                    value={contactUsername}
                    onChange={(e) => setContactUsername(e.target.value)}
                    autoComplete={detailProps.autoComplete}
                    inputMode={detailProps.inputMode}
                    disabled={!method}
                    required={Boolean(method)}
                  />
                  {!method ? (
                    <div className="form-text">Выберите способ связи — поле станет активным.</div>
                  ) : null}
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="contact_subject">
                    Тема сообщения *
                  </label>
                  <select
                    id="contact_subject"
                    className="form-select"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  >
                    <option value="">Выберите тему</option>
                    <option value="заказ">Хочу заказать изделие</option>
                    <option value="вопрос">У меня есть вопрос</option>
                    <option value="обсуждение">Хочу обсудить дизайн</option>
                    <option value="другое">Другое</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label" htmlFor="contact_message">
                    Ваше сообщение *
                  </label>
                  <textarea
                    id="contact_message"
                    className="form-control"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    placeholder="Опишите, что вас интересует..."
                  />
                </div>

                <p className="small text-muted text-center mb-3">
                  Нажимая «Отправить», вы соглашаетесь с{" "}
                  <Link to="/privacy">политикой конфиденциальности</Link>.
                </p>
                <div className="text-center">
                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                    <i className="fas fa-paper-plane me-2" />
                    {loading ? "Отправка…" : "Отправить сообщение"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="row mt-5">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center">
                <h4 className="mb-3">
                  <i className="fas fa-info-circle me-2 text-primary" />
                  Как мы работаем
                </h4>
                <div className="row">
                  {[
                    { icon: "fa-envelope", title: "1. Свяжитесь с нами", text: "Удобный способ связи" },
                    { icon: "fa-palette", title: "2. Обсудим дизайн", text: "Цвета, размеры и стиль" },
                    { icon: "fa-hands-helping", title: "3. Создаем изделие", text: "Вяжем с вниманием к деталям" },
                    { icon: "fa-gift", title: "4. Доставляем", text: "Бесплатно по Минску, по почте по РБ" },
                  ].map((x) => (
                    <div key={x.title} className="col-md-3">
                      <i className={`fas ${x.icon} fa-2x text-primary mb-2`} />
                      <h6>{x.title}</h6>
                      <p className="text-muted">{x.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
