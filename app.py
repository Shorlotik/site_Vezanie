from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///orders.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Настройки почты
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'vezanienashedelo@gmail.com'
app.config['MAIL_PASSWORD'] = os.getenv('EMAIL_PASSWORD')

db = SQLAlchemy(app)
mail = Mail(app)

# Модель заказа
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
    status = db.Column(db.String(20), default='Новый')

# Модель администратора
class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/delivery')
def delivery():
    return render_template('delivery.html')

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        # Получаем данные из формы
        contact_method = request.form['contact_method']
        contact_name = request.form['contact_name']
        contact_phone = request.form.get('contact_phone', '')
        contact_username = request.form.get('contact_username', '')
        contact_subject = request.form['contact_subject']
        contact_message = request.form['contact_message']
        
        # Сохраняем сообщение в файл
        save_contact_message(contact_method, contact_name, contact_phone, 
                           contact_username, contact_subject, contact_message)
        
        # Отправляем email с сообщением
        send_contact_email(contact_method, contact_name, contact_phone, 
                         contact_username, contact_subject, contact_message)
        
        flash('Ваше сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.', 'success')
        return redirect(url_for('contact'))
    
    return render_template('contact.html')

@app.route('/order', methods=['GET', 'POST'])
def order():
    if request.method == 'POST':
        # Получаем данные из формы
        customer_name = request.form['customer_name']
        customer_email = request.form['customer_email']
        customer_phone = request.form['customer_phone']
        product_type = request.form['product_type']
        description = request.form['description']
        colors = request.form['colors']
        sizes = request.form['sizes']
        delivery_address = request.form['delivery_address']
        
        # Создаем новый заказ
        new_order = Order(
            customer_name=customer_name,
            customer_email=customer_email,
            customer_phone=customer_phone,
            product_type=product_type,
            description=description,
            colors=colors,
            sizes=sizes,
            delivery_address=delivery_address
        )
        
        db.session.add(new_order)
        db.session.commit()
        
        # Отправляем email с заказом
        send_order_email(new_order)
        
        flash('Ваш заказ успешно отправлен! Мы свяжемся с вами в ближайшее время.', 'success')
        return redirect(url_for('index'))
    
    return render_template('order.html')

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        admin = Admin.query.filter_by(username=username).first()
        if admin and admin.password == password:  # В реальном проекте используйте хеширование
            session['admin_logged_in'] = True
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Неверные учетные данные', 'error')
    
    return render_template('admin_login.html')

@app.route('/admin/dashboard')
def admin_dashboard():
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin_login'))
    
    orders = Order.query.order_by(Order.order_date.desc()).all()
    return render_template('admin_dashboard.html', orders=orders)

@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    return redirect(url_for('admin_login'))

@app.route('/admin/order/<int:order_id>')
def admin_order_detail(order_id):
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin_login'))
    
    order = Order.query.get_or_404(order_id)
    return render_template('admin_order_detail.html', order=order)

@app.route('/admin/order/<int:order_id>/status', methods=['POST'])
def update_order_status(order_id):
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin_login'))
    
    order = Order.query.get_or_404(order_id)
    order.status = request.form['status']
    db.session.commit()
    flash('Статус заказа обновлен', 'success')
    return redirect(url_for('admin_order_detail', order_id=order_id))

def send_order_email(order):
    try:
        msg = Message(
            f'Новый заказ #{order.id}',
            sender='vezanienashedelo@gmail.com',
            recipients=['vezanienashedelo@gmail.com']
        )
        
        msg.body = f"""
Новый заказ #{order.id}

Клиент: {order.customer_name}
Email: {order.customer_email}
Телефон: {order.customer_phone}

Товар: {order.product_type}
Описание: {order.description}
Цвета: {order.colors}
Размеры: {order.sizes}

Адрес доставки: {order.delivery_address}

Дата заказа: {order.order_date.strftime('%d.%m.%Y %H:%M')}
        """
        
        mail.send(msg)
        print(f"Email успешно отправлен для заказа #{order.id}")
    except Exception as e:
        print(f"Ошибка отправки email: {e}")
        # Сохраняем заказ в файл как резервный вариант
        save_order_to_file(order)

def save_order_to_file(order):
    """Сохраняет заказ в текстовый файл как резервный вариант"""
    try:
        with open('orders_backup.txt', 'a', encoding='utf-8') as f:
            f.write(f"""
=== НОВЫЙ ЗАКАЗ #{order.id} ===
Дата: {order.order_date.strftime('%d.%m.%Y %H:%M')}

КЛИЕНТ:
Имя: {order.customer_name}
Email: {order.customer_email}
Телефон: {order.customer_phone}

ТОВАР:
Тип: {order.product_type}
Описание: {order.description}
Цвета: {order.colors}
Размеры: {order.sizes}

ДОСТАВКА:
Адрес: {order.delivery_address}

{'='*50}
""")
        print(f"Заказ #{order.id} сохранен в файл orders_backup.txt")
    except Exception as e:
        print(f"Ошибка сохранения в файл: {e}")

def save_contact_message(contact_method, contact_name, contact_phone, contact_username, contact_subject, contact_message):
    """Сохраняет сообщение контакта в файл"""
    try:
        with open('contacts_backup.txt', 'a', encoding='utf-8') as f:
            f.write(f"""
=== НОВОЕ СООБЩЕНИЕ ===
Дата: {datetime.now().strftime('%d.%m.%Y %H:%M')}

КЛИЕНТ:
Имя: {contact_name}
Телефон: {contact_phone or 'Не указан'}
Способ связи: {contact_method}
Username: {contact_username or 'Не указан'}

СООБЩЕНИЕ:
Тема: {contact_subject}
Текст: {contact_message}

{'='*50}
""")
        print(f"Сообщение от {contact_name} сохранено в файл contacts_backup.txt")
    except Exception as e:
        print(f"Ошибка сохранения сообщения в файл: {e}")

def send_contact_email(contact_method, contact_name, contact_phone, contact_username, contact_subject, contact_message):
    """Отправляет email с сообщением контакта"""
    try:
        msg = Message(
            f'Новое сообщение: {contact_subject}',
            sender='vezanienashedelo@gmail.com',
            recipients=['vezanienashedelo@gmail.com']
        )
        
        msg.body = f"""
Новое сообщение от клиента

КЛИЕНТ:
Имя: {contact_name}
Телефон: {contact_phone or 'Не указан'}
Способ связи: {contact_method}
Username: {contact_username or 'Не указан'}

СООБЩЕНИЕ:
Тема: {contact_subject}
Текст: {contact_message}

Дата: {datetime.now().strftime('%d.%m.%Y %H:%M')}
        """
        
        mail.send(msg)
        print(f"Email с сообщением от {contact_name} успешно отправлен")
    except Exception as e:
        print(f"Ошибка отправки email с сообщением: {e}")

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        # Создаем администратора если его нет
        if not Admin.query.filter_by(username='admin').first():
            admin = Admin(username='admin', password='admin123')
            db.session.add(admin)
            db.session.commit()
    
    app.run(debug=True)
