import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../api";
import { FloatingContact } from "./FloatingContact";
import { usePageSeo } from "../hooks/usePageSeo";
import { SITE_NAME, SOCIAL } from "../site";

const logoSrc = "/static/images/logo-vezhem-vmeste.svg";

export function Layout({ children }: { children?: React.ReactNode }) {
  const [admin, setAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  usePageSeo();

  useEffect(() => {
    let cancelled = false;
    apiGet<{ logged_in: boolean }>("/api/admin/me")
      .then((d) => {
        if (!cancelled) setAdmin(d.logged_in);
      })
      .catch(() => {
        if (!cancelled) setAdmin(false);
      });
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  async function handleLogout(e: React.MouseEvent) {
    e.preventDefault();
    try {
      await apiPost("/api/admin/logout", {});
    } catch {
      /* ignore */
    }
    setAdmin(false);
    navigate("/");
  }

  const content = children;

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light navbar-vezanie">
        <div className="container">
          <Link className="navbar-brand text-decoration-none" to="/">
            <img src={logoSrc} alt={SITE_NAME} height={40} className="me-2" />
            {SITE_NAME}
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Меню"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <NavLink end className="nav-link" to="/">
                  Главная
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/order">
                  Заказать
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/delivery">
                  Доставка
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/contact">
                  Контакты
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/faq">
                  Вопросы
                </NavLink>
              </li>
              <li className="nav-item d-flex align-items-center gap-2 ms-lg-2 mt-2 mt-lg-0 navbar-social-wrap">
                <a
                  href={SOCIAL.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="navbar-social-btn navbar-social-btn--ig"
                  title="Instagram"
                  aria-label="Instagram"
                >
                  <i className="fab fa-instagram" aria-hidden />
                </a>
                <a
                  href={SOCIAL.telegram}
                  target="_blank"
                  rel="noreferrer"
                  className="navbar-social-btn navbar-social-btn--tg"
                  title="Telegram"
                  aria-label="Telegram"
                >
                  <i className="fab fa-telegram-plane" aria-hidden />
                </a>
                <a
                  href={SOCIAL.vk}
                  target="_blank"
                  rel="noreferrer"
                  className="navbar-social-btn navbar-social-btn--vk"
                  title="ВКонтакте"
                  aria-label="ВКонтакте"
                >
                  <i className="fab fa-vk" aria-hidden />
                </a>
              </li>
              {admin && (
                <>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/admin/dashboard">
                      Админ панель
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <a href="/" className="nav-link" onClick={handleLogout}>
                      Выйти
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <main className="main-content">{content}</main>

      <footer className="footer mt-4">
        <div className="container">
          <div className="row gy-3">
            <div className="col-md-6">
              <div className="d-flex align-items-center mb-2 flex-wrap footer-brand-line gap-2">
                <img src={logoSrc} alt="" className="footer-logo" />
                <h5 className="mb-0 footer-site-title">{SITE_NAME}</h5>
              </div>
              <p className="footer-tagline mb-2">
                Создаем уникальные вязаные изделия с любовью и вниманием к деталям
              </p>
              <p className="mb-0 footer-tagline">
                <i className="fas fa-shipping-fast me-2" />
                Бесплатная доставка по Минску
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <h5 className="footer-block-title">Контакты рукодельницы</h5>
              <p className="footer-contact-line mb-2">
                <i className="fab fa-instagram me-2" />
                <a href={SOCIAL.instagram} target="_blank" rel="noreferrer" className="text-white text-decoration-none">
                  @lisavetaimhovik
                </a>
              </p>
              <p className="footer-contact-line mb-2">
                <i className="fab fa-telegram me-2" />
                <a href={SOCIAL.telegram} target="_blank" rel="noreferrer" className="text-white text-decoration-none">
                  Telegram канал
                </a>
              </p>
              <p className="footer-contact-line mb-0">
                <i className="fab fa-vk me-2" />
                <a href={SOCIAL.vk} target="_blank" rel="noreferrer" className="text-white text-decoration-none">
                  ВКонтакте
                </a>
              </p>
            </div>
          </div>
          <hr className="footer-divider" />
          <div className="text-center footer-copy small">
            <p className="mb-2 footer-legal-links">
              <Link to="/privacy" className="text-white text-decoration-underline">
                Политика конфиденциальности
              </Link>
              <span className="footer-legal-sep" aria-hidden>
                ·
              </span>
              <Link to="/terms" className="text-white text-decoration-underline">
                Условия заказа
              </Link>
              <span className="footer-legal-sep" aria-hidden>
                ·
              </span>
              <Link to="/faq" className="text-white text-decoration-underline">
                Вопросы и ответы
              </Link>
            </p>
            <p className="mb-0">&copy; {new Date().getFullYear()} {SITE_NAME}. Все права защищены.</p>
          </div>
        </div>
      </footer>

      <FloatingContact />
    </>
  );
}
