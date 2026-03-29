import { Link } from "react-router-dom";
import { SITE_NAME } from "../site";

const ITEMS: { q: string; a: string }[] = [
  {
    q: "Сколько ждать изделие?",
    a: "Срок зависит от сложности и очереди: простые работы — быстрее, крупные или со сложным узором — дольше. После заявки напишем ориентир по дням.",
  },
  {
    q: "Как узнать точную цену?",
    a: "На сайте указаны ориентиры «от …». Итоговая сумма — после согласования размера, пряжи и сложности узора.",
  },
  {
    q: "Какие материалы используете?",
    a: "Работаем с качественной пряжей (хлопок, шерсть, акрил и др.) — конкретный состав подбираем под изделие и ваши пожелания.",
  },
  {
    q: "Можно принести свою пряжу?",
    a: "Да, возможен заказ из вашей пряжи, если она подходит по толщине и назначению. Обсудим при оформлении заказа.",
  },
  {
    q: "Как ухаживать за вязаными вещами?",
    a: "Обычно — деликатная стирка при 30 °C или ручная, сушка в горизонтальном положении. Для каждого изделия дадим краткие рекомендации по уходу.",
  },
  {
    q: "Доставка за пределы Минска?",
    a: "Да, отправляем по РБ почтой или Европочтой. Стоимость пересылки рассчитывается отдельно.",
  },
  {
    q: "Можно отменить заказ?",
    a: "До начала активной работы — да, без проблем. Если работа уже начата, условия отмены согласуем индивидуально.",
  },
];

export function Faq() {
  return (
    <section className="py-5">
      <div className="container" style={{ maxWidth: 720 }}>
        <h1 className="display-6 fw-bold mb-3">Вопросы и ответы</h1>
        <p className="text-muted mb-4">
          Кратко о заказах в {SITE_NAME}. Не нашли ответ —{" "}
          <Link to="/contact">напишите нам</Link>.
        </p>

        <div className="accordion" id="faqAccordion">
          {ITEMS.map((item, i) => (
            <div key={item.q} className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#faq-${i}`}
                  aria-expanded="false"
                  aria-controls={`faq-${i}`}
                >
                  {item.q}
                </button>
              </h2>
              <div id={`faq-${i}`} className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div className="accordion-body">{item.a}</div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4">
          <Link to="/order">Оформить заказ</Link>
          {" · "}
          <Link to="/">На главную</Link>
        </p>
      </div>
    </section>
  );
}
