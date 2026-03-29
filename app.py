from flask import Flask, request, jsonify, session, send_from_directory, abort
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from functools import wraps
import os
import re
from dotenv import load_dotenv
from sqlalchemy import inspect, text
from werkzeug.security import check_password_hash, generate_password_hash

load_dotenv()
# Render.com: Secret Files лежат в /etc/secrets/<имя файла>, не в корне приложения
_render_env = "/etc/secrets/.env"
if os.path.isfile(_render_env):
    load_dotenv(_render_env, override=True)


def _password_is_hashed(value: str) -> bool:
    if not value:
        return False
    return value.startswith(("pbkdf2:", "scrypt:", "argon2"))

SITE_BRAND = "Вяжем вместе"
MINSK_TZ = ZoneInfo("Europe/Minsk")

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIST = os.path.join(ROOT_DIR, "frontend", "dist")
STATIC_DIR = os.path.join(ROOT_DIR, "static")


def _as_utc(dt: datetime) -> datetime:
    """Naive datetime в БД считаем UTC (как datetime.utcnow)."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def format_minsk(dt: datetime | None) -> str:
    if dt is None:
        return "—"
    return _as_utc(dt).astimezone(MINSK_TZ).strftime("%d.%m.%Y %H:%M")


def order_date_utc_iso(dt: datetime | None) -> str | None:
    """UTC с суффиксом Z для фронта (Europe/Minsk при отображении)."""
    if dt is None:
        return None
    u = _as_utc(dt).replace(microsecond=0)
    return u.strftime("%Y-%m-%dT%H:%M:%SZ")

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "your-secret-key-here")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///orders.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USERNAME"] = "vezanienashedelo@gmail.com"
app.config["MAIL_PASSWORD"] = os.getenv("EMAIL_PASSWORD")

db = SQLAlchemy(app)
mail = Mail(app)


class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(100), nullable=False)
    customer_email = db.Column(db.String(120), nullable=False)
    customer_phone = db.Column(db.String(20), nullable=False)
    product_type = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    colors = db.Column(db.String(200), nullable=False)
    sizes = db.Column(db.String(100), nullable=False)
    delivery_address = db.Column(db.Text, nullable=False)
    order_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default="Новый")
    preferred_payment = db.Column(db.String(120), nullable=False, default="")


class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.Text, nullable=False)


def admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not session.get("admin_logged_in"):
            return jsonify(error="Требуется вход"), 401
        return f(*args, **kwargs)

    return wrapper


def order_to_dict(o: Order):
    return {
        "id": o.id,
        "customer_name": o.customer_name,
        "customer_email": o.customer_email,
        "customer_phone": o.customer_phone,
        "product_type": o.product_type,
        "description": o.description,
        "colors": o.colors,
        "sizes": o.sizes,
        "delivery_address": o.delivery_address,
        "order_date": order_date_utc_iso(o.order_date),
        "status": o.status,
        "preferred_payment": getattr(o, "preferred_payment", None) or "",
    }


@app.post("/api/orders")
def api_create_order():
    data = request.get_json(silent=True) or {}
    required = [
        "customer_name",
        "customer_email",
        "customer_phone",
        "product_type",
        "description",
        "colors",
        "sizes",
        "delivery_address",
    ]
    missing = [k for k in required if not str(data.get(k, "")).strip()]
    if missing:
        return jsonify(error="Заполните все обязательные поля", fields=missing), 400

    pay = (data.get("preferred_payment") or "").strip()
    if len(pay) > 120:
        pay = pay[:120]

    new_order = Order(
        customer_name=data["customer_name"].strip(),
        customer_email=data["customer_email"].strip(),
        customer_phone=data["customer_phone"].strip(),
        product_type=data["product_type"].strip(),
        description=data["description"].strip(),
        colors=(data.get("colors") or "").strip(),
        sizes=(data.get("sizes") or "").strip(),
        delivery_address=data["delivery_address"].strip(),
        preferred_payment=pay,
    )
    db.session.add(new_order)
    db.session.commit()
    send_order_email(new_order)
    return jsonify(
        ok=True,
        message="Ваш заказ успешно отправлен! Мы свяжемся с вами в ближайшее время.",
        order_id=new_order.id,
    )


CONTACT_METHODS = frozenset({"telegram", "vkontakte", "instagram", "email"})


def _contact_detail_label(method: str) -> str:
    return {
        "email": "E-mail для ответа",
        "telegram": "Username (Telegram)",
        "vkontakte": "Имя и фамилия (ВК)",
        "instagram": "Username (Instagram)",
    }.get(method, "Контакт")


# Значения из формы (value) → текст для письма и темы
CONTACT_SUBJECT_LABELS = {
    "заказ": "Хочу заказать изделие",
    "вопрос": "У меня есть вопрос",
    "обсуждение": "Хочу обсудить дизайн",
    "другое": "Другое",
}


def _contact_subject_display(subject_raw: str) -> str:
    s = (subject_raw or "").strip()
    return CONTACT_SUBJECT_LABELS.get(s, s or "—")


def _validate_contact_detail(method: str, detail: str) -> str | None:
    v = (detail or "").strip()
    if not v:
        return "Укажите данные для выбранного способа связи"
    if method == "email":
        if re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", v):
            return None
        return "Укажите корректный адрес e-mail"
    if method == "telegram":
        u = re.sub(r"^@+", "", v)
        u = re.sub(r"^https?://(t\.me|telegram\.me)/", "", u, flags=re.I).strip().rstrip("/")
        if re.match(r"^[a-zA-Z][a-zA-Z0-9_]{4,31}$", u):
            return None
        return "Укажите username Telegram (латиница, цифры, подчёркивание, от 5 символов)"
    if method == "instagram":
        u = re.sub(r"^@+", "", v)
        u = re.sub(r"^https?://(www\.)?instagram\.com/", "", u, flags=re.I).strip().rstrip("/")
        if re.match(r"^[a-zA-Z0-9._]{1,30}$", u):
            return None
        return "Укажите username Instagram (латиница, цифры, точка, подчёркивание)"
    if method == "vkontakte":
        if re.match(r"^\S+(?:\s+\S+)+$", v) and len(v) >= 4:
            return None
        return "Укажите имя и фамилию через пробел (как в профиле ВК)"
    return "Неизвестный способ связи"


@app.post("/api/contact")
def api_contact():
    data = request.get_json(silent=True) or {}
    contact_method = (data.get("contact_method") or "").strip()
    contact_name = (data.get("contact_name") or "").strip()
    contact_subject = (data.get("contact_subject") or "").strip()
    contact_message = (data.get("contact_message") or "").strip()
    if not contact_method or not contact_name or not contact_subject or not contact_message:
        return jsonify(error="Заполните обязательные поля формы"), 400

    if contact_method not in CONTACT_METHODS:
        return jsonify(error="Недопустимый способ связи"), 400

    contact_phone = (data.get("contact_phone") or "").strip()
    contact_username = (data.get("contact_username") or "").strip()

    detail_err = _validate_contact_detail(contact_method, contact_username)
    if detail_err:
        return jsonify(error=detail_err), 400

    save_contact_message(
        contact_method,
        contact_name,
        contact_phone,
        contact_username,
        contact_subject,
        contact_message,
    )
    send_contact_email(
        contact_method,
        contact_name,
        contact_phone,
        contact_username,
        contact_subject,
        contact_message,
    )
    return jsonify(
        ok=True,
        message="Ваше сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.",
    )


@app.post("/api/admin/login")
def api_admin_login():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()
    admin = Admin.query.filter_by(username=username).first()
    if not admin or not password:
        return jsonify(ok=False, error="Неверные учетные данные"), 401
    ok = False
    if _password_is_hashed(admin.password):
        ok = check_password_hash(admin.password, password)
    else:
        ok = admin.password == password
    if ok:
        if not _password_is_hashed(admin.password):
            admin.password = generate_password_hash(password)
            db.session.commit()
        session["admin_logged_in"] = True
        return jsonify(ok=True)
    return jsonify(ok=False, error="Неверные учетные данные"), 401


@app.post("/api/admin/logout")
def api_admin_logout():
    session.pop("admin_logged_in", None)
    return jsonify(ok=True)


@app.get("/api/admin/me")
def api_admin_me():
    return jsonify(logged_in=bool(session.get("admin_logged_in")))


@app.get("/api/admin/orders")
@admin_required
def api_admin_orders():
    orders = Order.query.order_by(Order.order_date.desc()).all()
    return jsonify(orders=[order_to_dict(o) for o in orders])


@app.get("/api/admin/orders/<int:order_id>")
@admin_required
def api_admin_order_detail(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify(error="Заказ не найден"), 404
    return jsonify(order=order_to_dict(order))


@app.patch("/api/admin/orders/<int:order_id>/status")
@admin_required
def api_admin_order_status(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify(error="Заказ не найден"), 404
    data = request.get_json(silent=True) or {}
    status = (data.get("status") or "").strip()
    allowed = {"Новый", "В обработке", "Завершен", "Отменен"}
    if status not in allowed:
        return jsonify(error="Недопустимый статус"), 400
    order.status = status
    db.session.commit()
    return jsonify(ok=True, order=order_to_dict(order))


def send_order_email(order):
    try:
        pay_line = (getattr(order, "preferred_payment", None) or "").strip()
        pay_block = f"Предпочтительная оплата: {pay_line}\n" if pay_line else "Предпочтительная оплата: не указана — согласовать с клиентом\n"

        msg = Message(
            f"[{SITE_BRAND}] Новый заказ #{order.id}",
            sender="vezanienashedelo@gmail.com",
            recipients=["vezanienashedelo@gmail.com"],
        )
        msg.body = f"""{SITE_BRAND}
Новый заказ #{order.id}

Клиент: {order.customer_name}
Email: {order.customer_email}
Телефон: {order.customer_phone}

Товар: {order.product_type}
Описание: {order.description}
Цвета: {order.colors}
Размеры: {order.sizes}

{pay_block}Адрес доставки: {order.delivery_address}

Дата заказа (Минск): {format_minsk(order.order_date)}
— {SITE_BRAND}
        """
        mail.send(msg)
        print(f"Email успешно отправлен для заказа #{order.id}")
    except Exception as e:
        print(f"Ошибка отправки email: {e}")
        save_order_to_file(order)


def save_order_to_file(order):
    try:
        with open("orders_backup.txt", "a", encoding="utf-8") as f:
            f.write(
                f"""
=== НОВЫЙ ЗАКАЗ #{order.id} ===
Дата (Минск): {format_minsk(order.order_date)}

КЛИЕНТ:
Имя: {order.customer_name}
Email: {order.customer_email}
Телефон: {order.customer_phone}

ТОВАР:
Тип: {order.product_type}
Описание: {order.description}
Цвета: {order.colors}
Размеры: {order.sizes}
Оплата: {getattr(order, "preferred_payment", None) or "—"}

ДОСТАВКА:
Адрес: {order.delivery_address}

{'=' * 50}
"""
            )
        print(f"Заказ #{order.id} сохранен в файл orders_backup.txt")
    except Exception as e:
        print(f"Ошибка сохранения в файл: {e}")


def save_contact_message(
    contact_method,
    contact_name,
    contact_phone,
    contact_username,
    contact_subject,
    contact_message,
):
    try:
        with open("contacts_backup.txt", "a", encoding="utf-8") as f:
            f.write(
                f"""
=== НОВОЕ СООБЩЕНИЕ ===
Дата (Минск): {format_minsk(datetime.now(timezone.utc))}

КЛИЕНТ:
Имя: {contact_name}
Телефон: {contact_phone or 'Не указан'}
Способ связи: {contact_method}
{_contact_detail_label(contact_method)}: {contact_username or 'Не указан'}

СООБЩЕНИЕ:
Тема: {_contact_subject_display(contact_subject)}
Текст: {contact_message}

{'=' * 50}
"""
            )
        print(f"Сообщение от {contact_name} сохранено в файл contacts_backup.txt")
    except Exception as e:
        print(f"Ошибка сохранения сообщения в файл: {e}")


def send_contact_email(
    contact_method,
    contact_name,
    contact_phone,
    contact_username,
    contact_subject,
    contact_message,
):
    try:
        subj_line = _contact_subject_display(contact_subject)
        msg = Message(
            f"[Вяжем вместе] {subj_line} — {contact_name}",
            sender="vezanienashedelo@gmail.com",
            recipients=["vezanienashedelo@gmail.com"],
        )
        msg.body = f"""
Новое сообщение от клиента

КЛИЕНТ:
Имя: {contact_name}
Телефон: {contact_phone or 'Не указан'}
Способ связи: {contact_method}
{_contact_detail_label(contact_method)}: {contact_username or 'Не указан'}

СООБЩЕНИЕ:
Тема: {subj_line}
Текст: {contact_message}

Дата (Минск): {format_minsk(datetime.now(timezone.utc))}
        """
        mail.send(msg)
        print(f"Email с сообщением от {contact_name} успешно отправлен")
    except Exception as e:
        print(f"Ошибка отправки email с сообщением: {e}")


@app.route("/static/<path:subpath>")
def static_files(subpath):
    """Картинки, видео и логотип из каталога static/ (не из frontend/dist)."""
    return send_from_directory(STATIC_DIR, subpath)


@app.get("/favicon.ico")
def favicon_ico():
    """Браузеры часто запрашивают /favicon.ico до HTML; без файла SPA отдавала index.html."""
    svg_path = os.path.join(FRONTEND_DIST, "favicon.svg")
    if os.path.isfile(svg_path):
        return send_from_directory(FRONTEND_DIST, "favicon.svg", mimetype="image/svg+xml")
    abort(404)


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def spa(path):
    if path.startswith("api"):
        abort(404)
    index_path = os.path.join(FRONTEND_DIST, "index.html")
    if path:
        file_path = os.path.join(FRONTEND_DIST, path)
        if os.path.isfile(file_path):
            return send_from_directory(FRONTEND_DIST, path)
    if os.path.isfile(index_path):
        return send_from_directory(FRONTEND_DIST, "index.html")
    return (
        jsonify(
            error="Сборка фронтенда не найдена. Выполните: cd frontend && npm install && npm run build"
        ),
        503,
    )


def migrate_sqlite_order_columns():
    """Добавляет столбцы к существующей таблице заказов (SQLite)."""
    engine = db.engine
    if engine.dialect.name != "sqlite":
        return
    insp = inspect(engine)
    tname = Order.__tablename__
    if tname not in insp.get_table_names():
        return
    existing = {c["name"] for c in insp.get_columns(tname)}
    if "preferred_payment" in existing:
        return
    q = f'"{tname}"'
    with engine.begin() as conn:
        conn.execute(
            text(f"ALTER TABLE {q} ADD COLUMN preferred_payment VARCHAR(120) NOT NULL DEFAULT ''")
        )


def migrate_admin_password_hashes():
    """Однократно хэширует старые пароли админов, сохранённые в открытом виде."""
    with app.app_context():
        changed = False
        for a in Admin.query.all():
            if a.password and not _password_is_hashed(a.password):
                a.password = generate_password_hash(a.password)
                changed = True
        if changed:
            db.session.commit()


def ensure_db():
    with app.app_context():
        db.create_all()
        migrate_sqlite_order_columns()
        migrate_admin_password_hashes()

        admin_username = (os.getenv("ADMIN_USERNAME") or "admin").strip() or "admin"
        admin_password_env = os.getenv("ADMIN_PASSWORD")

        if admin_password_env:
            h = generate_password_hash(admin_password_env)
            a = Admin.query.filter_by(username=admin_username).first()
            if a:
                a.password = h
            else:
                db.session.add(Admin(username=admin_username, password=h))
            db.session.commit()
        elif not Admin.query.filter_by(username=admin_username).first():
            db.session.add(
                Admin(username=admin_username, password=generate_password_hash("admin123"))
            )
            db.session.commit()


if __name__ == "__main__":
    ensure_db()
    app.run(debug=True, port=5000)
