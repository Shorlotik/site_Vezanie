/** Блок со способами оплаты — используется на странице заказа и доставки */
export function PaymentMethodsInfo({ className = "" }: { className?: string }) {
  return (
    <div className={`payment-methods-block ${className}`.trim()}>
      <h3 className="h5 mb-3">
        <i className="fas fa-wallet me-2 text-primary" />
        Способы оплаты
      </h3>
      <ul className="mb-0 ps-3">
        <li className="mb-2">
          <strong>Наличные</strong> — при передаче заказа курьером в Минске или при получении посылки (по
          договорённости).
        </li>
        <li className="mb-2">
          <strong>Перевод на банковскую карту</strong> — номер карты или ссылка для оплаты отправим после
          согласования заказа и суммы.
        </li>
        <li className="mb-2">
          <strong>ЕРИП («Расчёт»)</strong> — по желанию вышлем реквизиты для оплаты через интернет-банкинг или
          кассу.
        </li>
      </ul>
      <p className="small text-muted mb-0 mt-3">
        Конкретный способ и момент оплаты (предоплата / при получении) согласуем с вами в сообщениях или по
        телефону.
      </p>
    </div>
  );
}
