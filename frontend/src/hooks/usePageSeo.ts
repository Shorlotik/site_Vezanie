import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SITE_NAME, SEO_DEFAULT_DESC } from "../site";

function setMetaDescription(content: string) {
  let el = document.querySelector('meta[name="description"]');
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", "description");
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function usePageSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    let title = SITE_NAME;
    let desc = SEO_DEFAULT_DESC;

    if (pathname === "/") {
      title = `${SITE_NAME} — вязание на заказ, Минск и РБ`;
      desc =
        "Закажите вязаные корзинки, сумки, тапочки и другое. Ручная работа, бесплатная доставка по Минску, отправка по РБ.";
    } else if (pathname === "/order") {
      title = `Оформить заказ — ${SITE_NAME}`;
      desc = "Форма заказа: выберите изделие, цвета и размеры. Мы свяжемся для уточнения сроков и оплаты.";
    } else if (pathname === "/delivery") {
      title = `Доставка — ${SITE_NAME}`;
      desc = "Доставка по Минску бесплатно, по Беларуси — Белпочта и Европочта. Сроки и способы оплаты.";
    } else if (pathname === "/contact") {
      title = `Контакты — ${SITE_NAME}`;
      desc = "Свяжитесь с нами: Instagram, Telegram, ВКонтакте или форма на сайте.";
    } else if (pathname === "/faq") {
      title = `Вопросы и ответы — ${SITE_NAME}`;
      desc = "Сроки, цены, материалы, уход за изделиями и частые вопросы о заказе.";
    } else if (pathname === "/privacy") {
      title = `Политика конфиденциальности — ${SITE_NAME}`;
      desc = "Как мы обрабатываем персональные данные при оформлении заказа и обращениях на сайте.";
    } else if (pathname === "/terms") {
      title = `Условия заказа — ${SITE_NAME}`;
      desc = "Условия оформления заказа, оплаты, доставки и возврата.";
    } else if (pathname.startsWith("/admin")) {
      title = `Админ — ${SITE_NAME}`;
      desc = "";
    }

    document.title = title;
    setMetaDescription(desc || SEO_DEFAULT_DESC);
  }, [pathname]);
}
