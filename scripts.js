class CarritoCompras {
    constructor() {
        this.items = this.cargarCarrito();
        this.actualizarContadorCarrito();
    }
    cargarCarrito() {
        const carritoGuardado = localStorage.getItem('carrito');
        return carritoGuardado ? JSON.parse(carritoGuardado) : [];
    }
    guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(this.items));
        this.actualizarContadorCarrito();
    }
    agregarItem(nombre, precio) {
        const itemExistente = this.items.find(item => item.nombre === nombre);
        if (itemExistente) {
            itemExistente.cantidad++;
        } else {
            this.items.push({
                nombre: nombre,
                precio: precio,
                cantidad: 1
            });
        }
        this.guardarCarrito();
    }

    eliminarItem(nombre) {
        this.items = this.items.filter(item => item.nombre !== nombre);
        this.guardarCarrito();
        if (window.location.pathname.includes('carrito.html')) {
            this.renderizarCarrito();
        }
    }

    calcularTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.precio * item.cantidad);
        }, 0);
    }

    actualizarContadorCarrito() {
        const contador = document.querySelector('.contador-carrito');
        const totalItems = this.items.reduce((sum, item) => sum + item.cantidad, 0);
        
        if (contador) {
            contador.textContent = totalItems;
            contador.style.display = totalItems > 0 ? 'inline-block' : 'none';
        }
    }

    renderizarCarrito() {
        const contenedor = document.querySelector('main section');
        
        if (!contenedor) return;

        if (this.items.length === 0) {
            contenedor.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <h3>Tu carrito está vacío</h3>
                    <p>¡Agrega algunos productos para comenzar!</p>
                </div>
            `;
            return;
        }

        let html = '';
        this.items.forEach(item => {
            html += `
                <article class="producto">
                    <div>
                        <h3>${item.nombre}</h3>
                        <p>S/. ${item.precio} x ${item.cantidad} = S/. ${item.precio * item.cantidad}</p>
                    </div>
                    <button class="btn-eliminar" data-nombre="${item.nombre}">Eliminar</button>
                </article>
            `;
        });

        html += `<p class="total">Total: S/. ${this.calcularTotal()}</p>`;
        html += `<button id="btn-pagar">Pagar</button>`;
        contenedor.innerHTML = html;
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const nombre = e.target.dataset.nombre;
                this.eliminarItem(nombre);
            });
        });
        const btnPagar = document.getElementById('btn-pagar');
        if (btnPagar) {
            btnPagar.addEventListener('click', () => this.procesarPago());
        }
    }
    procesarPago() {
        const total = this.calcularTotal();
        const confirmacion = confirm(`¿Deseas proceder con el pago de S/. ${total}?`);
        if (confirmacion) {
            this.items = [];
            this.guardarCarrito();
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    }
}
const carrito = new CarritoCompras();
function inicializarBotonesCompra() {
    const botonesCompra = document.querySelectorAll('article button[type="button"]');
    
    botonesCompra.forEach((boton, index) => {
        boton.addEventListener('click', function() {
            const articulo = this.closest('article');
            const nombreProducto = articulo.querySelector('h3').textContent.replace('>>> ', '');
            const precioTexto = articulo.querySelector('table tr:first-child th:last-child').textContent;
            const precio = parseFloat(precioTexto.replace('S/. ', '').replace(',', ''));
            const stock = articulo.querySelector('table tr:nth-child(2) th:last-child').textContent;

            if (stock.toLowerCase().includes('agotado')) {
                alert('Lo sentimos, este producto está agotado');
                return;
            }

            carrito.agregarItem(nombreProducto, precio);
        });
    });
}

function validarFormularioRegistro() {
    const formulario = document.querySelector('form');
    
    if (!formulario || !window.location.pathname.includes('registro.html')) return;

    formulario.addEventListener('submit', function(e) {
        e.preventDefault();

        const nombres = document.getElementById('nombres').value.trim();
        const apellidos = document.getElementById('apellidos').value.trim();
        const correo = document.getElementById('correo').value.trim();
        const contraseña = document.getElementById('contraseña').value;
        const confirmar = document.getElementById('confirmar').value;
        const fecha = document.getElementById('fecha').value;
        const genero = document.querySelector('input[name="genero"]:checked');
        const terminos = document.querySelector('input[name="terminos"]:checked');

        if (!nombres || !apellidos) {
            alert('Por favor, completa tu nombre y apellidos');
            return;
        }

        if (!validarEmail(correo)) {
            alert('Por favor, ingresa un correo electrónico válido');
            return;
        }

        if (contraseña.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (contraseña !== confirmar) {
            alert('Las contraseñas no coinciden');
            return;
        }

        if (!fecha) {
            alert('Por favor, ingresa tu fecha de nacimiento');
            return;
        }

        if (!genero) {
            alert('Por favor, selecciona tu género');
            return;
        }

        if (!terminos) {
            alert('Debes aceptar los términos y condiciones');
            return;
        }

        alert('¡Registro exitoso! Bienvenido a Quantum Wheel');
        formulario.reset();
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    });
}

function validarFormularioInicioSesion() {
    const formulario = document.querySelector('form');
    
    if (!formulario || !window.location.pathname.includes('inicioSesion.html')) return;

    formulario.addEventListener('submit', function(e) {
        e.preventDefault();

        const correo = document.getElementById('correo').value.trim();
        const contraseña = document.getElementById('contraseña').value;

        if (!validarEmail(correo)) {
            alert('Por favor, ingresa un correo electrónico válido');
            return;
        }

        if (!contraseña) {
            alert('Por favor, ingresa tu contraseña');
            return;
        }

        alert('¡Inicio de sesión exitoso!');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    });
}

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function agregarContadorCarrito() {
    const itemCarrito = document.querySelector('a[href="carrito.html"]').parentElement;
    
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
}

document.addEventListener('DOMContentLoaded', function() {
    agregarContadorCarrito();
    if (window.location.pathname.includes('carrito.html')) {
        carrito.renderizarCarrito();
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
    
    
    console.log('Quantum Wheel JavaScript cargado correctamente');
});