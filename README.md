# Licencias

App de control de licencias del personal de la ESRN Rural Virtual. Es un solo archivo, `index.html`, sin compilación.

## Usuarios en la nube (Firebase)

Mientras `FIREBASE_CONFIG` (en `index.html`) sea `null`, la app funciona como siempre: sin usuarios, con los datos en el navegador y en el archivo de Drive.

### Tipos de usuario

| Tipo | Quién | Qué puede hacer |
|---|---|---|
| Administra | Santi | Todo, más ver los usuarios, cambiarles el tipo, darlos de baja y manejar el código de la escuela (Ajustes → Usuarios) |
| Carga | El personal que carga | Cargar y editar agentes, licencias y notas |
| Consulta | Directivos | Sólo mirar |

Cada persona crea su cuenta (mail y contraseña, o Google), elige si carga o sólo consulta, y pone el **código de la escuela**. Sin el código correcto no se puede registrar. Quien administra lo genera en Ajustes → Usuarios, y si se filtra, genera uno nuevo: las cuentas existentes siguen andando.

La seguridad la aplican las reglas del servidor (`firestore.rules`), no la página.

### Puesta en marcha (una sola vez)

1. **Proyecto:** crear el proyecto en Firebase con Authentication (correo/contraseña y Google) y Firestore en `southamerica-east1`, en modo producción y en el plan Spark (sin tarjeta).
2. **Configuración:** pegar el `firebaseConfig` del proyecto en `FIREBASE_CONFIG`, dentro de `index.html`.
3. **Reglas:** en la consola de Firebase → Firestore → **Reglas**, pegar el contenido de `firestore.rules` y tocar **Publicar**. Repetirlo cada vez que cambie ese archivo.
4. **Primer código:** en Firestore → **Datos**, crear la colección `config`, el documento `acceso` y un campo `codigo` (tipo string) con un código en mayúsculas, por ejemplo `ESRN-AB12-CD34`.
5. **Primer administrador:** registrarse en la app con ese código. Después, en Firestore → `usuarios` → tu documento, cambiar el campo `rol` a `admin`. Desde ahí, todo se maneja desde la app.
6. **Dominios:** en Authentication → Configuración → **Dominios autorizados**, agregar el dominio donde está publicada la app.

### Pruebas

- Reglas de seguridad: `npm install` y después `npm run test:reglas`. Corre las pruebas de `pruebas/reglas.test.mjs` contra el emulador de Firebase.
- App con el emulador:
  1. Levantar los emuladores con `npx firebase emulators:start --only auth,firestore --project demo-licencias`.
  2. Abrir `index.html?emulador` desde `localhost` o como archivo local.
  3. Crear el código en el emulador (paso 4 de arriba), apuntando a `127.0.0.1:8080`.
