import { useRef } from "react";
import { Link } from "react-router-dom";

const GALLERY_FILES = [
  "IMAGE 2025-08-17 18:34:07.jpg",
  "IMAGE 2025-08-17 18:34:11.jpg",
  "IMAGE 2025-08-17 18:34:15.jpg",
  "IMAGE 2025-08-17 18:34:18.jpg",
  "IMAGE 2025-08-17 18:34:26.jpg",
  "IMAGE 2025-08-17 18:34:32.jpg",
  "IMAGE 2025-08-17 18:34:34.jpg",
  "IMAGE 2025-08-17 18:34:38.jpg",
  "IMAGE 2025-08-17 18:34:40.jpg",
  "IMAGE 2025-08-17 18:34:43.jpg",
];
const GALLERY = GALLERY_FILES.map((f) => `/static/images/${encodeURIComponent(f)}`);

const HERO_IMG = `/static/images/${encodeURIComponent("IMAGE 2025-08-17 18:34:07.jpg")}`;

function VideoCard({
  src,
  title,
  text,
}: {
  src: string;
  title: string;
  text: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  return (
    <div className="col-md-4">
      <div
        className="card video-card"
        onMouseEnter={() => {
          ref.current?.play().catch(() => {});
        }}
        onMouseLeave={() => {
          const v = ref.current;
          if (v) {
            v.pause();
            v.currentTime = 0;
          }
        }}
      >
        <video ref={ref} className="card-img-top auto-play-video" muted loop playsInline>
          <source src={src} type="video/mp4" />
        </video>
        <div className="card-body">
          <h5 className="card-title">{title}</h5>
          <p className="card-text">{text}</p>
        </div>
      </div>
    </div>
  );
}

export function Home() {
  return (
    <>
      <section className="hero-section position-relative">
        <div className="hero-logo">
          <img src="/static/images/logo-vezhem-vmeste.svg" alt="" aria-hidden />
        </div>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">Уникальные вязаные изделия ручной работы</h1>
              <p className="lead mb-4">
                Создаем красивые и качественные вязаные изделия с любовью и вниманием к каждой детали.
                Каждое изделие уникально и создано специально для вас.
              </p>
              <div className="d-flex flex-column flex-sm-row flex-wrap gap-2 gap-sm-3">
                <Link to="/order" className="btn btn-primary btn-lg">
                  <i className="fas fa-shopping-cart me-2" />
                  Заказать сейчас
                </Link>
                <Link to="/contact" className="btn btn-outline-primary btn-lg">
                  <i className="fas fa-envelope me-2" />
                  Связаться с нами
                </Link>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="text-center">
                <img
                  src={HERO_IMG}
                  alt="Вязаные изделия"
                  className="img-fluid rounded-3 shadow-lg"
                  style={{ maxHeight: 400 }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center display-6 fw-bold mb-4">Как сделать заказ</h2>
          <div className="row g-4 justify-content-center">
            {[
              { n: 1, t: "Заявка", d: "Оформите заказ на сайте или напишите в Telegram / ВК." },
              { n: 2, t: "Согласование", d: "Обсудим детали, срок изготовления и стоимость." },
              { n: 3, t: "Работа", d: "Свяжем изделие с любовью к деталям." },
              { n: 4, t: "Получение", d: "Встреча в Минске или отправка по Беларуси." },
            ].map((s) => (
              <div key={s.n} className="col-12 col-sm-6 col-lg-3 text-center">
                <div className="step-badge mx-auto">{s.n}</div>
                <h3 className="h6 fw-bold">{s.t}</h3>
                <p className="small text-muted mb-0">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-4 d-flex flex-column flex-sm-row flex-wrap justify-content-center gap-2">
            <Link to="/order" className="btn btn-primary">
              Оформить заказ
            </Link>
            <Link to="/contact" className="btn btn-outline-primary">
              Задать вопрос
            </Link>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">Наши товары</h2>
            <p className="lead text-muted">Ориентиры по цене — точная сумма после согласования</p>
          </div>
          <div className="row g-4">
            {[
              {
                icon: "fa-shopping-basket",
                title: "Корзинки",
                text: "Уютные вязаные корзинки для хранения вещей.",
                from: "от 35 BYN",
              },
              {
                icon: "fa-shopping-bag",
                title: "Сумки",
                text: "Сумки разных размеров и дизайнов.",
                from: "от 55 BYN",
              },
              {
                icon: "fa-shoe-prints",
                title: "Тапочки",
                text: "Мягкие тапочки для дома.",
                from: "от 30 BYN",
              },
              {
                icon: "fa-key",
                title: "Брелки",
                text: "Компактные вязаные брелки.",
                from: "от 12 BYN",
              },
              {
                icon: "fa-lightbulb",
                title: "Ваши идеи",
                text: "Индивидуальный дизайн по вашему описанию.",
                from: "по запросу",
              },
              {
                icon: "fa-heart",
                title: "Индивидуальный подход",
                text: "Цвет, размер и узор — под ваши пожелания.",
                from: "включено",
              },
            ].map((p) => (
              <div key={p.title} className="col-md-6 col-lg-4">
                <div className="card h-100 text-center">
                  <div className="card-body d-flex flex-column">
                    <i className={`fas ${p.icon} fa-3x text-primary mb-3`} />
                    <h5 className="card-title">{p.title}</h5>
                    <p className="card-text text-muted small flex-grow-1">{p.text}</p>
                    <p className="fw-semibold text-primary mb-0 mt-2">{p.from}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row mt-5">
            <div className="col-lg-10 mx-auto">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h3 className="h5 fw-bold mb-3">
                    <i className="fas fa-clock me-2 text-primary" />
                    Сроки и что входит в ориентир цены
                  </h3>
                  <ul className="mb-0 text-muted">
                    <li className="mb-2">
                      Срок изготовления зависит от сложности и загрузки — напишем ориентир после заявки
                      (часто от нескольких дней до 2–3 недель).
                    </li>
                    <li className="mb-2">
                      В сумму «от … BYN» обычно входят работа и пряжа стандартного качества; премиальная
                      пряжа, фурнитура и сложные узоры обсуждаются отдельно.
                    </li>
                    <li>Точная цена и срок фиксируются в переписке до начала работы.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">Галерея наших работ</h2>
            <p className="lead text-muted">Посмотрите на примеры наших изделий</p>
          </div>
          <div className="row g-4">
            {GALLERY.map((src) => (
              <div key={src} className="col-md-6 col-lg-4">
                <div className="gallery-item">
                  <img src={src} alt="Вязаные изделия" className="img-fluid w-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">Видео наших работ</h2>
            <p className="lead text-muted">Посмотрите процесс создания наших изделий</p>
          </div>
          <div className="row g-4">
            <VideoCard
              src="/static/videos/IMG_4699.MP4"
              title="Процесс вязания"
              text="Посмотрите, как создаются наши уникальные изделия."
            />
            <VideoCard
              src="/static/videos/IMG_4703.MP4"
              title="Готовые изделия"
              text="Демонстрация готовых вязаных изделий."
            />
            <VideoCard
              src="/static/videos/IMG_4708.MP4"
              title="Детали работы"
              text="Внимание к деталям — наша особенность."
            />
          </div>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">Почему выбирают нас</h2>
          </div>
          <div className="row g-4">
            {[
              { icon: "fa-hand-holding-heart", title: "Ручная работа", text: "Каждое изделие создается вручную с любовью." },
              { icon: "fa-palette", title: "Индивидуальный дизайн", text: "По вашим пожеланиям по цвету и размеру." },
              { icon: "fa-shipping-fast", title: "Быстрая доставка", text: "Бесплатная доставка по Минску. По почте по всей РБ." },
              { icon: "fa-star", title: "Качественные материалы", text: "Только лучшие нити и материалы." },
            ].map((x) => (
              <div key={x.title} className="col-md-3 text-center">
                <i className={`fas ${x.icon} fa-3x text-primary mb-3`} />
                <h5>{x.title}</h5>
                <p>{x.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">Отзывы</h2>
            <p className="lead text-muted">Нам доверяют заказчицы из Минска и других городов</p>
          </div>
          <div className="row g-4">
            {[
              {
                initials: "А.К.",
                bg: "#c2185b",
                city: "Минск",
                text: "Заказывала корзинку — аккуратно, ровно, цвет как договаривались. Спасибо!",
              },
              {
                initials: "М.П.",
                bg: "#6a1b9a",
                city: "Борисов",
                text: "Сумку вязали под мои размеры. Отвечали быстро, отправили почтой без проблем.",
              },
              {
                initials: "Е.С.",
                bg: "#00695c",
                city: "Минск",
                text: "Тапочки тёплые, ношу каждый день. Уже думаю о следующем заказе.",
              },
            ].map((r) => (
              <div key={r.initials} className="col-md-4">
                <div className="card review-card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-start gap-3 mb-3">
                      <div className="review-avatar" style={{ background: r.bg }}>
                        {r.initials}
                      </div>
                      <div>
                        <div className="fw-semibold">{r.city}</div>
                        <div className="small text-muted">Заказчица</div>
                      </div>
                    </div>
                    <p className="mb-0 small">«{r.text}»</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container text-center">
          <h2 className="h4 fw-bold mb-3">Остались вопросы?</h2>
          <p className="text-muted mb-3">
            Материалы, уход за изделиями, своя пряжа, доставка — в разделе с ответами.
          </p>
          <Link to="/faq" className="btn btn-primary">
            Частые вопросы
          </Link>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h2 className="display-5 fw-bold mb-4">Готовы заказать уникальное изделие?</h2>
              <p className="lead mb-4">
                Свяжитесь с нами и мы создадим для вас идеальное вязаное изделие!
              </p>
              <Link to="/order" className="btn btn-primary btn-lg">
                <i className="fas fa-shopping-cart me-2" />
                Оформить заказ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
