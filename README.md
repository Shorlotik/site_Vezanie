# Сайт заказов вязаных изделий

Витрина и формы заказа на React (Vite), бэкенд — Flask (JSON API, сессии для админки), почта через Gmail SMTP.

## Возможности

- Главная, доставка, контакты, FAQ, политика и условия
- Форма заказа и отправка на email
- Админка: список заказов, карточка заказа, смена статуса
- Адаптивная вёрстка

## Товары (категории в форме)

Корзинки, сумки, тапочки, брелки, индивидуальный заказ.

## Переменные окружения

Файл `.env` в корне (в репозиторий не коммитится):

| Переменная | Назначение |
|------------|------------|
| `SECRET_KEY` | Секрет Flask (обязательно в проде) |
| `EMAIL_PASSWORD` | Пароль приложения Gmail для аккаунта, с которого идёт отправка (см. `MAIL_USERNAME` в `app.py`) |
| `DATABASE_URL` | URI БД; по умолчанию `sqlite:///orders.db` в корне проекта |
| `ADMIN_USERNAME` | Логин админа (по умолчанию `admin`) |
| `ADMIN_PASSWORD` | Пароль админа при первом создании записи; если не задан — однократно создаётся `admin` / `admin123` |

Для Gmail: двухфакторная аутентификация и «Пароли приложений» в настройках аккаунта Google.

## Разработка

Нужны два процесса: API на Flask и фронт на Vite.

```bash
pip install -r requirements.txt
cd frontend && npm ci
```

Терминал 1 — бэкенд (порт 5000):

```bash
python app.py
```

Терминал 2 — фронт (порт 5173, запросы `/api` проксируются на Flask):

```bash
cd frontend && npm run dev
```

Сайт в режиме разработки: http://localhost:5173  

Админка: http://localhost:5173/admin/login  

Прод-сборка фронта перед запуском только Flask:

```bash
cd frontend && npm run build
python app.py
```

Flask отдаёт собранный SPA из `frontend/dist` и статику из `static/`.

## Docker

```bash
docker compose up -d --build
```

По умолчанию HTTP на хосте: **http://localhost:5001** (в контейнере порт 5000). База SQLite в volume `vezanie-data` (`/data/orders.db`). Переменные из `.env` подхватываются, если файл есть.

## Продакшн (без Docker)

```bash
cd frontend && npm ci && npm run build
gunicorn -w 1 --threads 4 -b 0.0.0.0:5000 app:app
```

При необходимости задайте `PORT` или используйте свой биндинг.

## Структура проекта

```
site_Vezanie/
├── app.py                 # Flask: API, раздача frontend/dist и static
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── docker-entrypoint.sh
├── frontend/              # React + Vite (src/, dist/ после build)
├── static/                # Статика (изображения и т.д.)
└── orders.db              # SQLite при локальном DATABASE_URL по умолчанию
```

## Безопасность

- Смените дефолтный пароль админа или задайте `ADMIN_PASSWORD` до первого деплоя.
- В проде используйте сильный `SECRET_KEY` и HTTPS.

## Лицензия

Проект для личного использования.
