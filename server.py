from wsgiref.simple_server import make_server
import mysql.connector
import json
import hashlib
import os
import mimetypes

DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'user': os.environ.get('DB_USER', 'root'),
    'port': int(os.environ.get('DB_PORT', 3306)),
    'password': os.environ.get('DB_PASSWORD', ''),
    'database': os.environ.get('DB_NAME', 'quantum_wheel')
}
def conectar_db():
    return mysql.connector.connect(**DB_CONFIG)
def servir_archivo_estatico(ruta):
    if ruta == '/' or ruta == '':
        ruta = '/index.html'
    archivo_path = os.path.join('frontend', ruta.lstrip('/'))
    if os.path.exists(archivo_path) and os.path.isfile(archivo_path):
        with open(archivo_path, 'rb') as f:
            contenido = f.read()
        tipo_mime, _ = mimetypes.guess_type(archivo_path)
        if tipo_mime is None:
            tipo_mime = 'application/octet-stream'
        return {
            'contenido': contenido,
            'mime': tipo_mime,
            'encontrado': True
        }
    return {'encontrado': False}
def app(environ, start_response):
    metodo = environ['REQUEST_METHOD']
    ruta = environ['PATH_INFO']
    rutas_api = ['/registro', '/login', '/productos', '/realizar-compra',
                 '/mis-pedidos', '/contacto', '/ver-mensajes', '/health']
    if ruta in rutas_api:
        return manejar_api(environ, start_response, metodo, ruta)
    resultado = servir_archivo_estatico(ruta)

    if resultado['encontrado']:
        headers = [
            ('Content-Type', resultado['mime']),
            ('Cache-Control', 'public, max-age=3600')
        ]
        start_response('200 OK', headers)
        return [resultado['contenido']]
    else:
        headers = [('Content-Type', 'text/html')]
        start_response('404 Not Found', headers)
        return [b'<h1>404 - Pagina no encontrada</h1>']

def manejar_api(environ, start_response, metodo, ruta):
    headers = [
        ('Content-Type', 'application/json'),
        ('Access-Control-Allow-Origin', '*'),
        ('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'),
        ('Access-Control-Allow-Headers', 'Content-Type')
    ]

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
    elif ruta == '/health':
        respuesta = {'status': 'ok', 'message': 'Quantum Wheel API'}
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
        return {'success': True, 'message': 'Registro exitoso', 'user_id': user_id}
    except mysql.connector.IntegrityError:
        return {'success': False, 'message': 'El correo ya está registrado'}
    except Exception as e:
        return {'success': False, 'message': str(e)}
    finally:
        if cursor:
            try:
                cursor.close()
            except:
                pass
        if conn:
            try:
                conn.close()
            except:
                pass
def login_usuario(datos):
    try:
        conn = conectar_db()
        cursor = conn.cursor(dictionary=True)
        password_hash = hashlib.md5(datos['contraseña'].encode()).hexdigest()
        sql = "SELECT * FROM usuarios WHERE correo = %s AND contraseña = %s"
        cursor.execute(sql, (datos['correo'], password_hash))
        usuario = cursor.fetchone()
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
    finally:
        if cursor:
            try:
                cursor.close()
            except:
                pass
        if conn:
            try:
                conn.close()
            except:
                pass
def obtener_productos():
    try:
        conn = conectar_db()
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM productos WHERE stock > 0"
        cursor.execute(query)
        productos = cursor.fetchall()
        return {'success': True, 'productos': productos}
    except Exception as e:
        return {'success': False, 'message': str(e)}
    finally:
        if cursor:
            try:
                cursor.close()
            except:
                pass
        if conn:
            try:
                conn.close()
            except:
                pass
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
        return {'success': True, 'message': 'Compra realizada exitosamente'}
    except Exception as e:
        return {'success': False, 'message': str(e)}
    finally:
        if cursor:
            try:
                cursor.close()
            except:
                pass
        if conn:
            try:
                conn.close()
            except:
                pass
def obtener_pedidos(datos):
    try:
        conn = conectar_db()
        cursor = conn.cursor(dictionary=True)
        sql = """
              SELECT *
              FROM pedidos
              WHERE usuario_id = %s
              ORDER BY fecha_pedido DESC \
              """
        cursor.execute(sql, (datos['usuario_id'],))
        pedidos = cursor.fetchall()
        return {'success': True, 'pedidos': pedidos}
    except Exception as e:
        return {'success': False, 'message': str(e)}
    finally:
        if cursor:
            try:
                cursor.close()
            except:
                pass
        if conn:
            try:
                conn.close()
            except:
                pass
def guardar_mensaje(datos):
    try:
        conn = conectar_db()
        cursor = conn.cursor()
        sql = "INSERT INTO mensajes (nombre, email, mensaje) VALUES (%s, %s, %s)"
        cursor.execute(sql, (datos['nombre'], datos['email'], datos['mensaje']))
        conn.commit()
        return {'success': True, 'message': 'Mensaje guardado'}
    except Exception as e:
        return {'success': False, 'message': str(e)}
    finally:
        if cursor:
            try:
                cursor.close()
            except:
                pass
        if conn:
            try:
                conn.close()
            except:
                pass
def obtener_mensajes():
    try:
        conn = conectar_db()
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM mensajes ORDER BY fecha DESC"
        cursor.execute(sql)
        mensajes = cursor.fetchall()
        for mensaje in mensajes:
            if 'fecha' in mensaje:
                mensaje['fecha'] = str(mensaje['fecha'])
        return {'success': True, 'mensajes': mensajes}
    except Exception as e:
        return {'success': False, 'message': str(e)}
    finally:
        if cursor:
            try:
                cursor.close()
            except:
                pass
        if conn:
            try:
                conn.close()
            except:
                pass
if __name__ == '__main__':
    puerto = int(os.environ.get('PORT', 8000))
    print(f"Servidor Quantum Wheel iniciado en puerto {puerto}")
    print(f"Frontend: http://0.0.0.0:{puerto}/")
    print(f"API: http://0.0.0.0:{puerto}/health")
    servidor = make_server('0.0.0.0', puerto, app)
    servidor.serve_forever()