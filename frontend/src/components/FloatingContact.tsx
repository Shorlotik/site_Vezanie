import { useEffect, useId, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SOCIAL } from "../site";

/** Плавающая кнопка: по клику раскрываются способы связи с подписями */
export function FloatingContact() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="floating-contact">
      {open ? (
        <button
          type="button"
          className="floating-contact-backdrop"
          aria-label="Закрыть меню связи"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div
        id={menuId}
        className={`floating-contact-menu${open ? " floating-contact-menu--open" : ""}`}
        role="group"
        aria-label="Способы связи"
        aria-hidden={!open}
      >
        <a
          href={SOCIAL.telegram}
          target="_blank"
          rel="noreferrer"
          className="floating-contact-row floating-contact-row--tg"
          onClick={() => setOpen(false)}
        >
          <span className="floating-contact-row-icon" aria-hidden>
            <i className="fab fa-telegram-plane" />
          </span>
          <span>Telegram</span>
        </a>
        <a
          href={SOCIAL.instagram}
          target="_blank"
          rel="noreferrer"
          className="floating-contact-row floating-contact-row--ig"
          onClick={() => setOpen(false)}
        >
          <span className="floating-contact-row-icon" aria-hidden>
            <i className="fab fa-instagram" />
          </span>
          <span>Instagram</span>
        </a>
        <a
          href={SOCIAL.vk}
          target="_blank"
          rel="noreferrer"
          className="floating-contact-row floating-contact-row--vk"
          onClick={() => setOpen(false)}
        >
          <span className="floating-contact-row-icon" aria-hidden>
            <i className="fab fa-vk" />
          </span>
          <span>ВКонтакте</span>
        </a>
        <Link
          to="/contact"
          className="floating-contact-row floating-contact-row--site"
          onClick={() => setOpen(false)}
        >
          <span className="floating-contact-row-icon" aria-hidden>
            <i className="fas fa-envelope" />
          </span>
          <span>Форма на сайте</span>
        </Link>
      </div>

      <button
        type="button"
        className="floating-contact-toggle"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? "Закрыть способы связи" : "Открыть способы связи"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <i className="fas fa-times" aria-hidden /> : <i className="fas fa-comment-dots" aria-hidden />}
        {!open ? <span className="floating-contact-toggle-hint">Связь</span> : null}
      </button>
    </div>
  );
}
