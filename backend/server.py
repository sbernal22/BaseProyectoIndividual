from wsgiref.simple_server import make_server
import mysql.connector
import json
import hashlib

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'quantum_wheel'
}
def conectar_db():
    return mysql.connector.connect(**DB_CONFIG)
def app(environ, start_response):
    metodo = environ['REQUEST_METHOD']
    ruta = environ['PATH_INFO']
    headers = [
        ('Content-Type', 'application/json'),
        ('Access-Control-Allow-Origin', '*'),
        ('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'),
        ('Access-Control-Allow-Headers', 'Content-Type')
    ]

    # Manejar OPTIONS (CORS preflight)
    if metodo == 'OPTIONS':
        start_response('200 OK', headers)
        return [b'']

    if metodo == 'POST':
        try:
            content_length = int(environ.get('CONTENT_LENGTH', 0))
            body = environ['wsgi.input'].read(content_length)
            datos = json.loads(body.decode('utf-8'))
        except:
            datos = {}
    else:
        datos = {}

    if ruta == '/registro' and metodo == 'POST':
        respuesta = registrar_usuario(datos)
    elif ruta == '/login' and metodo == 'POST':
        respuesta = login_usuario(datos)
    elif ruta == '/productos' and metodo == 'GET':
        respuesta = obtener_productos()
    elif ruta == '/realizar-compra' and metodo == 'POST':
        respuesta = realizar_compra(datos)
    elif ruta == '/mis-pedidos' and metodo == 'POST':
        respuesta = obtener_pedidos(datos)
    elif ruta == '/contacto' and metodo == 'POST':
        respuesta = guardar_mensaje(datos)
    elif ruta == '/ver-mensajes' and metodo == 'GET':
        respuesta = obtener_mensajes()
    else:
        respuesta = {'error': 'Ruta no encontrada'}

    start_response('200 OK', headers)
    return [json.dumps(respuesta).encode('utf-8')]


def registrar_usuario(datos):
    try:
        conn = conectar_db()
        cursor = conn.cursor()

        password_hash = hashlib.md5(datos['contraseña'].encode()).hexdigest()

        sql = """
                INSERT INTO usuarios (nombres, apellidos, correo, contraseña)
                VALUES (%s, %s, %s, %s) \
                """
        valores = (
            datos['nombres'],
            datos['apellidos'],
            datos['correo'],
            password_hash,
        )
        cursor.execute(sql, valores)
        conn.commit()
        user_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return {'success': True, 'message': 'Registro exitoso', 'user_id': user_id}
    except mysql.connector.IntegrityError:
        return {'success': False, 'message': 'El correo ya está registrado'}
    except Exception as e:
        return {'success': False, 'message': str(e)}
def login_usuario(datos):
    try:
        conn = conectar_db()
        cursor = conn.cursor(dictionary=True)
        password_hash = hashlib.md5(datos['contraseña'].encode()).hexdigest()
        sql = "SELECT * FROM usuarios WHERE correo = %s AND contraseña = %s"
        cursor.execute(sql, (datos['correo'], password_hash))
        usuario = cursor.fetchone()
        cursor.close()
        conn.close()
        if usuario:
            return {
                'success': True,
                'message': 'Login exitoso',
                'user': {
                    'id': usuario['id'],
                    'nombres': usuario['nombres'],
                    'correo': usuario['correo']
                }
            }
        else:
            return {'success': False, 'message': 'Credenciales incorrectas'}
    except Exception as e:
        return {'success': False, 'message': str(e)}
def obtener_productos():
    try:
        conn = conectar_db()
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM productos WHERE stock > 0"
        cursor.execute(query)
        productos = cursor.fetchall()
        cursor.close()
        conn.close()
        return {'success': True, 'productos': productos}
    except Exception as e:
        return {'success': False, 'message': str(e)}
def realizar_compra(datos):
    try:
        conn = conectar_db()
        cursor = conn.cursor()
        for item in datos['carrito']:
            total = item['cantidad'] * item['precio']
            sql = """
                    INSERT INTO pedidos (usuario_id, nombre_producto, cantidad, precio_unitario, total)
                    VALUES (%s, %s, %s, %s, %s) \
                    """
            cursor.execute(sql, (
                datos['usuario_id'],
                item['nombre'],
                item['cantidad'],
                item['precio'],
                total
            ))
            cursor.execute(
                "UPDATE productos SET stock = stock - %s WHERE nombre = %s",
                (item['cantidad'], item['nombre'])
            )
        conn.commit()
        cursor.close()
        conn.close()
        return {'success': True, 'message': 'Compra realizada exitosamente'}
    except Exception as e:
        return {'success': False, 'message': str(e)}
def obtener_pedidos(datos):
    try:
        conn = conectar_db()
        cursor = conn.cursor(dictionary=True)
        sql = """
                SELECT * \
                FROM pedidos
                WHERE usuario_id = %s
                ORDER BY fecha_pedido DESC \
                """
        cursor.execute(sql, (datos['usuario_id'],))
        pedidos = cursor.fetchall()
        cursor.close()
        conn.close()

        return {'success': True, 'pedidos': pedidos}
    except Exception as e:
        return {'success': False, 'message': str(e)}


def guardar_mensaje(datos):
    try:
        conn = conectar_db()
        cursor = conn.cursor()
        sql = "INSERT INTO mensajes (nombre, email, mensaje) VALUES (%s, %s, %s)"
        cursor.execute(sql, (datos['nombre'], datos['email'], datos['mensaje']))
        conn.commit()
        cursor.close()
        conn.close()
        return {'success': True, 'message': 'Mensaje guardado'}
    except Exception as e:
        return {'success': False, 'message': str(e)}

def obtener_mensajes():
    try:
        conn = conectar_db()
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM mensajes ORDER BY fecha DESC"
        cursor.execute(sql)
        mensajes = cursor.fetchall()
        for m in mensajes:
            if 'fecha' in m and m['fecha'] is not None:
                m['fecha'] = m['fecha'].strftime("%Y-%m-%d %H:%M:%S")
        cursor.close()
        conn.close()
        return {'success': True, 'mensajes': mensajes}
    except Exception as e:
        return {'success': False, 'message': str(e)}
if __name__ == '__main__':
    puerto = 8000
    print(f"Servidor iniciado en http://localhost:{puerto}")
    servidor = make_server('localhost', puerto, app)
    servidor.serve_forever()