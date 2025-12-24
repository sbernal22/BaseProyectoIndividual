# 🛒 Quantum Wheel - Tienda Online de Tecnología

## 📝 Descripción
Quantum Wheel es una tienda online de productos tecnológicos que permite a los usuarios navegar por un catálogo de productos, registrarse, iniciar sesión, agregar productos al carrito y realizar compras. Incluye un sistema de administración para gestionar mensajes de contacto.

## 🌐 URL del Proyecto
[https://baseproyectoindividual.onrender.com/](https://baseproyectoindividual.onrender.com/)

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5** - Estructura de las páginas web
- **CSS3** - Diseño y estilos responsive
- **JavaScript** - Interactividad y comunicación con el backend

### Backend
- **Python 3** - Lenguaje del servidor
- **wsgiref** - Servidor web integrado
- **MySQL** - Base de datos relacional

### Lenguajes
- HTML
- CSS
- JavaScript
- Python
- SQL

## 📂 Estructura del Proyecto

```
quantum-wheel/
├── frontend/
│   ├── index.html              # Página principal con productos
│   ├── registro.html           # Formulario de registro
│   ├── inicioSesion.html       # Formulario de login
│   ├── carrito.html            # Carrito de compras
│   ├── contacto.html           # Formulario de contacto
│   ├── mensajes.html           # Panel admin de mensajes
│   ├── css/
│   │   └── styles.css          # Estilos globales
│   ├── images/
│   │   └── logo.png
│   └── scripts.js              # Lógica del frontend
│
└── backend/
    ├── server.py               # API REST con Python
    ├── requirements.txt        # Dependencias Python
    └── Database.sql            # Estructura de la base de datos
```

## ✨ Funcionalidades

### Para Usuarios
- ✅ **Catálogo de productos** organizados por categorías (Laptops, Smartphones, Tablets, Smartwatches)
- ✅ **Registro de usuarios** con validación de datos
- ✅ **Inicio de sesión** con autenticación
- ✅ **Carrito de compras** con localStorage
- ✅ **Compra de productos** con actualización de stock
- ✅ **Formulario de contacto** para enviar mensajes

### Para Administradores
- ✅ **Panel de mensajes** protegido con contraseña
- ✅ **Visualización de mensajes** de usuarios
- ✅ **Gestión de inventario** automática

## 🗄️ Base de Datos

### Tablas
- **usuarios** - Información de usuarios registrados
- **productos** - Catálogo de productos con stock
- **pedidos** - Historial de compras
- **mensajes** - Mensajes del formulario de contacto

### Diagrama de Relaciones
```
usuarios (1) ──→ (N) pedidos
productos (1) ──→ (N) pedidos
```

## 🔧 Instalación Local

### Requisitos Previos
- Python 3.8+
- MySQL 5.7+
- Navegador web moderno

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/TU-USUARIO/quantum-wheel.git
cd quantum-wheel
```

2. **Configurar la base de datos**
```bash
mysql -u root -p
source backend/Database.sql
```

3. **Instalar dependencias Python**
```bash
cd backend
pip install -r requirements.txt
```

4. **Configurar variables de entorno** (opcional)
```bash
export DB_HOST=localhost
export DB_USER=root
export DB_PASSWORD=tu_password
export DB_NAME=quantum_wheel
```

5. **Iniciar el servidor**
```bash
python server.py
```
El servidor estará en: `http://localhost:8000`

6. **Abrir el frontend**
Abre `frontend/index.html` en tu navegador

## Deployment

### Frontend y Backend
1. Sube tu repositorio a Github
2. Crea un Web Service en Render.com
3. Configura las variables de entorno
4. Deploy automático

### Base de Datos (Clever Cloud)
1. Crea una base de datos MySQL
2. Importa `Database.sql`
3. Conecta con el backend usando las credenciales

## Credenciales de Prueba

### Usuario Admin (Mensajes)
- **Contraseña:** admin123

### Usuario de Prueba
Puedes registrarte directamente en la aplicación

## Responsive Design
El sitio es completamente responsive y se adapta a:
- Móviles (320px+)
- Tablets (768px+)
- Desktop (1200px+)

## Características de Diseño
- Interfaz moderna y limpia
- Navegación intuitiva
- Efectos hover en productos
- Animaciones suaves
- Paleta de colores profesional

## Seguridad
- Contraseñas hasheadas con MD5
- Validación de inputs en frontend y backend
- CORS configurado correctamente
- Panel admin protegido con contraseña

## API Endpoints

### Usuarios
- `POST /registro` - Registrar nuevo usuario
- `POST /login` - Iniciar sesión

### Productos
- `GET /productos` - Listar productos disponibles

### Pedidos
- `POST /realizar-compra` - Crear nuevo pedido
- `POST /mis-pedidos` - Obtener pedidos de un usuario

### Contacto
- `POST /contacto` - Enviar mensaje
- `GET /ver-mensajes` - Listar mensajes (admin)

## Autor
**[Sebastian Colen Bernal Neyra]**
- Email: sbernal@unsa.edu.pe
- Universidad: Universidad Nacional de San Agustín de Arequipa


---

⭐ **Quantum Wheel** - Tu tienda de confianza en tecnología
