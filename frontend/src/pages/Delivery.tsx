import { Link } from "react-router-dom";
import { PaymentMethodsInfo } from "../components/PaymentMethodsInfo";

export function Delivery() {
  return (
    <section className="py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold">Доставка</h1>
          <p className="lead text-muted">Удобные способы получения ваших заказов</p>
        </div>

        <div className="row">
          <div className="col-lg-6">
            <div className="delivery-card mb-4">
              <div className="delivery-icon-wrap mx-auto mb-3">
                <i className="fas fa-city" />
              </div>
              <h3 className="text-center mb-4">Доставка по Минску</h3>
              <div className="price-info-delivery mb-3">
                <h4 className="text-primary mb-2">БЕСПЛАТНО</h4>
                <p className="mb-0">Доставка по всему городу</p>
              </div>
              <div className="delivery-step">
                <h5>
                  <i className="fas fa-clock me-2" />
                  Время доставки
                </h5>
                <p>1-2 дня после готовности заказа</p>
              </div>
              <div className="delivery-step">
                <h5>
                  <i className="fas fa-map-marker-alt me-2" />
                  Зоны доставки
                </h5>
                <p>
                  Все районы Минска: Центральный, Советский, Первомайский, Партизанский, Заводской,
                  Ленинский, Октябрьский, Московский, Фрунзенский
                </p>
              </div>
              <div className="delivery-step">
                <h5>
                  <i className="fas fa-phone me-2" />
                  Согласование
                </h5>
                <p>Свяжемся с вами для уточнения удобного времени доставки</p>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="delivery-card mb-4">
              <div className="delivery-icon-wrap mx-auto mb-3">
                <i className="fas fa-mail-bulk" />
              </div>
              <h3 className="text-center mb-4">Доставка по РБ</h3>
              <div className="price-info-delivery mb-3">
                <h4 className="text-primary mb-2">ПО ПОЧТЕ</h4>
                <p className="mb-0">Белпочта или Европочта</p>
              </div>
              <div className="delivery-step">
                <h5>
                  <i className="fas fa-shipping-fast me-2" />
                  Способы доставки
                </h5>
                <ul className="mb-0">
                  <li>
                    <strong>Белпочта:</strong> до почтового отделения
                  </li>
                  <li>
                    <strong>Европочта:</strong> до пункта выдачи
                  </li>
                </ul>
              </div>
              <div className="delivery-step">
                <h5>
                  <i className="fas fa-clock me-2" />
                  Сроки доставки
                </h5>
                <p>3-7 дней в зависимости от региона</p>
              </div>
              <div className="delivery-step">
                <h5>
                  <i className="fas fa-money-bill-wave me-2" />
                  Стоимость
                </h5>
                <p>Рассчитывается индивидуально в зависимости от веса и региона</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12 col-lg-10 mx-auto">
            <PaymentMethodsInfo />
          </div>
        </div>

        <div className="row mt-5">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h3 className="text-center mb-4">
                  <i className="fas fa-route me-2 text-primary" />
                  Как происходит доставка
                </h3>
                <div className="row">
                  {[
                    { icon: "fa-phone", title: "1. Согласование", text: "Связываемся для уточнения деталей" },
                    { icon: "fa-calendar", title: "2. Выбор времени", text: "Определяем удобное время доставки" },
                    { icon: "fa-truck", title: "3. Доставка", text: "Привозим заказ или отправляем почтой" },
                    { icon: "fa-check-circle", title: "4. Получение", text: "Проверяем качество и получаем оплату" },
                  ].map((s) => (
                    <div key={s.title} className="col-md-3 text-center mb-4">
                      <div className="delivery-icon-wrap delivery-icon-sm mx-auto mb-2">
                        <i className={`fas ${s.icon}`} />
                      </div>
                      <h6>{s.title}</h6>
                      <p className="text-muted">{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12">
            <div className="alert alert-warning">
              <h5>
                <i className="fas fa-exclamation-triangle me-2" />
                Важная информация
              </h5>
              <ul className="mb-0">
                <li>При заказе укажите точный адрес доставки</li>
                <li>Для доставки по РБ потребуется паспортные данные получателя</li>
                <li>
                  Оплата: наличные при встрече, перевод на карту или через ЕРИП — конкретный способ согласуем с
                  вами
                </li>
                <li>По договорённости возможна предоплата (в т.ч. для отправки по РБ)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12 text-center">
            <Link to="/order" className="btn btn-primary btn-lg me-3">
              <i className="fas fa-shopping-cart me-2" />
              Оформить заказ
            </Link>
            <Link to="/contact" className="btn btn-outline-primary btn-lg">
              <i className="fas fa-envelope me-2" />
              Уточнить детали
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
