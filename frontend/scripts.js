const API_URL = 'https://quantum-wheel-api.onrender.com';
const PASSWORD_CORRECTA = 'admin123';


let usuarioActual = null;
function cargarUsuario() {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
        usuarioActual = JSON.parse(usuario);
        actualizarMenu();
    }
}
function guardarUsuario(usuario) {
    usuarioActual = usuario;
    localStorage.setItem('usuario', JSON.stringify(usuario));
    actualizarMenu();
}
function cerrarSesion() {
    usuarioActual = null;
    localStorage.removeItem('usuario');
    localStorage.removeItem('carrito');
    actualizarMenu();
    window.location.href = 'index.html';
}
function actualizarMenu() {
    const nav = document.getElementById('laterales');
    if (!nav) return;
    if (usuarioActual) {
        nav.innerHTML = `
            <li class="itemsLaterales"><a href="index.html">Ir a inicio</a></li>
            <li class="itemsLaterales" style="cursor: default;"><span>Hola, ${usuarioActual.nombres}</span></li>
            <li class="itemsLaterales"><a href="carrito.html">Mi carrito</a></li>
            <li class="itemsLaterales"><a href="#" onclick="cerrarSesion()">Cerrar sesión</a></li>
        `;
    } else {
        nav.innerHTML = `
            <li class="itemsLaterales"><a href="index.html">Ir a inicio</a></li>
            <li class="itemsLaterales"><a href="registro.html">Registrarse</a></li>
            <li class="itemsLaterales"><a href="inicioSesion.html">Iniciar sesión</a></li>
            <li class="itemsLaterales"><a href="carrito.html">Mi carrito</a></li>
        `;
    }
    agregarContadorCarrito();
}
async function hacerPeticion(ruta, datos = null) {
    try {
        const opciones = {
            method: datos ? 'POST' : 'GET',
            headers: { 'Content-Type': 'application/json' }
        };

        if (datos) {
            opciones.body = JSON.stringify(datos);
        }

        const respuesta = await fetch(API_URL + ruta, opciones);
        return await respuesta.json();
    } catch (error) {
        console.error('Error:', error);
        return { success: false, message: 'Error de conexión con el servidor' };
    }
}
function obtenerCarrito() {
    const carrito = localStorage.getItem('carrito');
    return carrito ? JSON.parse(carrito) : [];
}
function guardarCarrito(carrito) {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
}
function agregarAlCarrito(nombre, precio) {
    let carrito = obtenerCarrito();

    const existe = carrito.find(item => item.nombre === nombre);
    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({ nombre, precio, cantidad: 1 });
    }
    guardarCarrito(carrito);
}
function eliminarDelCarrito(nombre) {
    let carrito = obtenerCarrito();
    carrito = carrito.filter(item => item.nombre !== nombre);
    guardarCarrito(carrito);
}
function vaciarCarrito() {
    localStorage.removeItem('carrito');
    actualizarContadorCarrito();
}
function calcularTotal() {
    const carrito = obtenerCarrito();
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
}
function validarFormularioRegistro() {
    const formulario = document.querySelector('form');
    if (!formulario || !window.location.pathname.includes('registro.html')) return;

    formulario.addEventListener('submit', async function(e) {
        e.preventDefault();

        const datos = {
            nombres: document.getElementById('nombres').value.trim(),
            apellidos: document.getElementById('apellidos').value.trim(),
            correo: document.getElementById('correo').value.trim(),
            contraseña: document.getElementById('contrasenia').value,
        };
        if (!datos.nombres || !datos.apellidos) {
            alert('Completa tu nombre y apellidos');
            return;
        }
        if (datos.contraseña.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        if (datos.contraseña !== document.getElementById('confirmar').value) {
            alert('Las contraseñas no coinciden');
            return;
        }
        const respuesta = await hacerPeticion('/registro', datos);
        if (respuesta.success) {
            alert('¡Registro exitoso!');
            window.location.href = 'inicioSesion.html';
        } else {
            alert('Error: ' + respuesta.message);
        }
    });
}
function validarFormularioInicioSesion() {
    const formulario = document.querySelector('form');
    if (!formulario || !window.location.pathname.includes('inicioSesion.html')) return;

    formulario.addEventListener('submit', async function(e) {
        e.preventDefault();
        const datos = {
            correo: document.getElementById('correo').value.trim(),
            contraseña: document.getElementById('contraseña').value
        };

        if (!datos.correo || !datos.contraseña) {
            alert('Completa todos los campos');
            return;
        }
        const respuesta = await hacerPeticion('/login', datos);
        if (respuesta.success) {
            guardarUsuario(respuesta.user);
            alert('¡Bienvenido!');
            window.location.href = 'index.html';
        } else {
            alert('Error: ' + respuesta.message);
        }
    });
}
//Carrito
function inicializarBotonesCompra() {
    const botones = document.querySelectorAll('article button[type="button"]');
    botones.forEach((boton) => {
        boton.addEventListener('click', function() {
            if (!usuarioActual) {
                alert('Debes iniciar sesión para comprar');
                window.location.href = 'inicioSesion.html';
                return;
            }
            const articulo = this.closest('article');
            const nombreProducto = articulo.querySelector('h3').textContent.trim();
            const precioTexto = articulo.querySelector('table tr:first-child th:last-child').textContent;
            const precio = parseFloat(precioTexto.replace('S/. ', ''));
            const stock = articulo.querySelector('table tr:nth-child(2) th:last-child').textContent;

            if (stock.toLowerCase().includes('agotado')) {
                alert('Producto agotado');
                return;
            }
            agregarAlCarrito(nombreProducto, precio);
            alert('Producto agregado al carrito');
        });
    });
}
function cargarCarrito() {
    const carrito = obtenerCarrito();
    const contenedor = document.querySelector('main section');
    if (!contenedor) return;
    if (!usuarioActual) {
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h3>Debes iniciar sesión para ver tu carrito</h3>
                <a href="inicioSesion.html"><button>Iniciar sesión</button></a>
            </div>
        `;
        return;
    }
    if (carrito.length === 0) {
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h3>Tu carrito está vacío</h3>
                <a href="index.html"><button>Ir a comprar</button></a>
            </div>
        `;
        return;
    }
    let html = '';
    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        html += `
            <article class="producto">
                <div>
                    <h3>${item.nombre}</h3>
                    <p>S/. ${item.precio.toFixed(2)} x ${item.cantidad} = S/. ${subtotal.toFixed(2)}</p>
                </div>
                <button onclick="eliminarProducto('${item.nombre}')">Eliminar</button>
            </article>
        `;
    });
    const total = calcularTotal();
    html += `<p class="total">Total: S/. ${total.toFixed(2)}</p>`;
    html += `<button onclick="realizarCompra()">Pagar</button>`;
    contenedor.innerHTML = html;
}
function eliminarProducto(nombre) {
    eliminarDelCarrito(nombre);
    alert('Producto eliminado');
    cargarCarrito();
}

async function realizarCompra() {
    if (!usuarioActual) {
        alert('Debes iniciar sesión');
        return;
    }

    const carrito = obtenerCarrito();
    if (carrito.length === 0) {
        alert('El carrito está vacío');
        return;
    }

    const total = calcularTotal();
    if (!confirm(`¿Confirmar compra por S/. ${total.toFixed(2)}?`)) return;

    const respuesta = await hacerPeticion('/realizar-compra', {
        usuario_id: usuarioActual.id,
        carrito: carrito
    });

    if (respuesta.success) {
        alert('¡Compra realizada con éxito!');
        vaciarCarrito();
        window.location.href = 'index.html';
    } else {
        alert('Error: ' + respuesta.message);
    }
}

function agregarContadorCarrito() {
    const linkCarrito = document.querySelector('a[href="carrito.html"]');
    if (!linkCarrito) return;

    const itemCarrito = linkCarrito.parentElement;

    if (!itemCarrito.querySelector('.contador-carrito')) {
        const contador = document.createElement('span');
        contador.className = 'contador-carrito';
        contador.style.cssText = `
            background-color: red;
            color: white;
            border-radius: 50%;
            padding: 2px 8px;
            font-size: 12px;
            margin-left: 5px;
            font-weight: bold;
        `;
        itemCarrito.appendChild(contador);
    }
    actualizarContadorCarrito();
}
function actualizarContadorCarrito() {
    const contador = document.querySelector('.contador-carrito');
    if (!contador) return;

    const carrito = obtenerCarrito();
    const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    contador.textContent = total;
    contador.style.display = total > 0 ? 'inline-block' : 'none';
}
document.addEventListener('DOMContentLoaded', function() {
    cargarUsuario();
    if (window.location.pathname.includes('carrito.html')) {
        cargarCarrito();
    }
    if (window.location.pathname.includes('index.html') ||
        window.location.pathname === '/' ||
        window.location.pathname.endsWith('/')) {
        inicializarBotonesCompra();
    }
    if (window.location.pathname.includes('registro.html')) {
        validarFormularioRegistro();
    }
    if (window.location.pathname.includes('inicioSesion.html')) {
        validarFormularioInicioSesion();
    }
    if (window.location.pathname.includes('contacto.html')) {
        validarFormularioContacto();
    }
});
// FORMULARIO DE CONTACTO
function validarFormularioContacto() {
    const formulario = document.getElementById('formContacto');
    if (!formulario) return;
    formulario.addEventListener('submit', async function(e) {
        e.preventDefault();
        const datos = {
            nombre: document.getElementById('nombre').value,
            email: document.getElementById('email').value,
            mensaje: document.getElementById('mensaje').value
        };
        const respuesta = await hacerPeticion('/contacto', datos);
        if (respuesta.success) {
            alert('¡Mensaje enviado!');
            formulario.reset();
        } else {
            alert('Error: ' + respuesta.message);
        }
    });
}
//Mensajes contacto
window.onload = function() {
    if (localStorage.getItem('adminLogueado') === 'true') {
        mostrarMensajes();
    }
};

function verificarPassword(event) {
    event.preventDefault();
    const password = document.getElementById('password').value;

    if (password === PASSWORD_CORRECTA) {
        localStorage.setItem('adminLogueado', 'true');
        mostrarMensajes();
    } else {
        alert('Contraseña incorrecta');
        document.getElementById('password').value = '';
    }
}

function mostrarMensajes() {
    document.getElementById('loginAdmin').style.display = 'none';
    document.getElementById('mensajesContainer').style.display = 'block';
    cargarMensajes();
}

function cerrarSesionAdmin() {
    localStorage.removeItem('adminLogueado');
    document.getElementById('loginAdmin').style.display = 'block';
    document.getElementById('mensajesContainer').style.display = 'none';
    document.getElementById('password').value = '';
}

async function cargarMensajes() {
    try {
        const response = await fetch(API_URL + '/ver-mensajes');
        const data = await response.json();
        if (data.success && data.mensajes.length > 0) {
            document.getElementById('listaMensajes').innerHTML =
                data.mensajes.map(m => `
                     <div class="mensaje-card">
                          <strong>${m.nombre}</strong> (${m.email})
                          <p>${m.mensaje}</p>
                          <small style="color: #6b7280;">${new Date(m.fecha).toLocaleString('es-PE')}</small>
                     </div>
                `).join('');
        } else {
            document.getElementById('listaMensajes').innerHTML =
                '<p style="text-align: center; color: #6b7280;">No hay mensajes</p>';
        }
    } catch (error) {
        document.getElementById('listaMensajes').innerHTML =
            '<p style="color: red;">Error al cargar mensajes</p>';
    }
}