# Licencias

App de control de licencias del personal de la ESRN Rural Virtual. Es un solo archivo, `index.html`, sin compilación.

## Usuarios en la nube (Firebase)

En **https://licencias-esrn.web.app** (el link propio de Firebase) siempre se entra con usuario. En el link de GitHub Pages, por ahora la nube se activa solo entrando con `?nube` al final del link (por ejemplo `https://santifarah1.github.io/Licencias/?nube`). Sin eso, la app funciona como siempre: sin usuarios, con los datos en el navegador y en el archivo de Drive. Cuando todos pasen a usar usuarios, se pone `NUBE_POR_DEFECTO = true` en `index.html`.

### Los datos en el servidor

Con la nube activa, los datos se guardan en Firestore y no en el navegador ni en el archivo de Drive:

- **Dónde se guardan:** cada agente, licencia, nota, artículo y día del calendario es un documento en `datos/{colección}/registros/{id}`. La configuración (ciclos lectivos, versión de los datos) va en `datos/config/registros/general`.
- **Cómo se sube:** al guardar, se suben solo los registros que cambiaron. Si dos personas cargan a la vez cosas distintas, no se pisan.
- **Cambios de las demás:** llegan solos y la pantalla se actualiza, sin recargar.
- **Sin internet:** se sigue cargando, y se sube todo solo cuando vuelve la conexión. El indicador de arriba muestra "Sin conexión: se sube al volver".
- **Base vacía:** la primera persona que entra con permiso de carga siembra los artículos y los feriados.
- **Pasar datos desde una compu:** el administrador usa **Ajustes → Datos y respaldo → Importar copia** con el `.json` exportado. Reemplaza todo lo del servidor.
- **Al salir:** se borra la copia local de los datos de esa compu, pensando en compus compartidas.
- **Copia diaria:** con Google Apps Script, en el Drive de la cuenta del proyecto. La instalación está en [`herramientas/copia-diaria/LEEME.md`](herramientas/copia-diaria/LEEME.md).

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
2. **Configuración:** el `firebaseConfig` del proyecto va en `FIREBASE_CONFIG`, dentro de `index.html` (ya cargado para `licencias-esrn`).
3. **Reglas:** en la consola de Firebase → Firestore → **Reglas**, pegar el contenido de `firestore.rules` y tocar **Publicar**. Repetirlo cada vez que cambie ese archivo.
4. **Primer código:** en Firestore → **Datos**, crear la colección `config`, el documento `acceso` y un campo `codigo` (tipo string) con un código en mayúsculas, por ejemplo `ESRN-AB12-CD34`.
5. **Primer administrador:** registrarse en la app con ese código. Después, en Firestore → `usuarios` → tu documento, cambiar el campo `rol` a `admin`. Desde ahí, todo se maneja desde la app.
6. **Dominios:** en Authentication → Configuración → **Dominios autorizados**, agregar el dominio donde está publicada la app.

### Publicación en Firebase (licencias-esrn.web.app)

Cada vez que se mergea algo a `main`, el workflow `.github/workflows/publicar-firebase.yml` publica la app en **https://licencias-esrn.web.app** y, de paso, publica las reglas de `firestore.rules`, así no hay que pegarlas a mano. Publica únicamente `index.html` (lo copia a una carpeta `publico/` aparte), así que nunca se suben las pruebas, las herramientas ni la configuración. GitHub Pages sigue funcionando igual.

Necesita una llave guardada como secreto en GitHub. Mientras no esté cargada, el workflow no hace nada. Cómo cargarla (una sola vez, con la cuenta dueña del proyecto):

1. Entrá a https://console.cloud.google.com/iam-admin/serviceaccounts?project=licencias-esrn → **+ Crear cuenta de servicio**.
2. Nombre: `github-publicar` → **Crear y continuar**.
3. Agregá estos tres roles (escribí el nombre en el buscador) → **Continuar** → **Listo**:
   - **Administrador de Firebase Hosting**
   - **Administrador de reglas de Firebase**
   - **Consumidor de Service Usage**
4. En la lista, tocá la cuenta `github-publicar` → pestaña **Claves** → **Agregar clave → Crear clave nueva → JSON → Crear**. Se descarga un archivo `.json`.
5. En GitHub, en el repositorio: **Settings → Secrets and variables → Actions → New repository secret**.
   - **Name:** `FIREBASE_SERVICE_ACCOUNT`
   - **Secret:** abrí el `.json` con el Bloc de notas, copiá **todo** y pegalo acá.
   - **Add secret**.
6. **Borrá el archivo `.json` descargado:** es una llave. Si se pierde, se crea otra desde el mismo lugar.
7. En GitHub → **Actions → Publicar en Firebase → Run workflow**. Cuando termine en verde, abrí https://licencias-esrn.web.app.

Si el workflow falla:
- Con un error de permisos: agregale a la cuenta el rol **Administrador de Firebase** y volvé a correrlo.
- Si dice que Hosting no está configurado: en la consola de Firebase → **Hosting → Comenzar**, salteá los pasos y volvé a correrlo.

### Pruebas

- Reglas de seguridad: `npm install` y después `npm run test:reglas`. Corre las pruebas de `pruebas/reglas.test.mjs` contra el emulador de Firebase.
- App con el emulador:
  1. Levantar los emuladores con `npx firebase emulators:start --only auth,firestore --project demo-licencias`.
  2. Abrir `index.html?emulador` desde `localhost` o como archivo local.
  3. Crear el código en el emulador (paso 4 de arriba), apuntando a `127.0.0.1:8080`.
