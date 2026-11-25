# Licencias

> Si algo no anda (la página no abre, se cargó algo mal, alguien olvidó la contraseña…), mirá **[Qué hacer si…](docs/que-hacer-si.md)**.

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

Entra a Google **sin ninguna llave guardada**: en cada corrida GitHub le muestra a Google un pase que dura unos minutos y que Google sólo acepta si viene de este repositorio y de `main` (se llama *Workload Identity Federation*). Así no hay ningún archivo con una llave que se pueda perder o filtrar. Si en GitHub todavía está el secreto viejo `FIREBASE_SERVICE_ACCOUNT`, el workflow usa ese y avisa; al borrarlo pasa solo al modo sin llave.

**Cuenta de servicio** (ya está hecha; esto es por si hay que rearmarla): en https://console.cloud.google.com/iam-admin/serviceaccounts?project=licencias-esrn → **+ Crear cuenta de servicio**, nombre `github-publicar`, con los roles **Administrador de Firebase Hosting**, **Administrador de reglas de Firebase** y **Consumidor de Service Usage**.

**Pasar al modo sin llave** (una sola vez, con una cuenta dueña del proyecto):

1. Entrá a https://console.cloud.google.com/?project=licencias-esrn y abrí **Cloud Shell** (el ícono `>_` arriba a la derecha).
2. Pegá esto y apretá Enter. Si pide autorizar, tocá **Autorizar**:

   ```bash
   gcloud config set project licencias-esrn
   gcloud services enable iamcredentials.googleapis.com sts.googleapis.com
   gcloud iam workload-identity-pools create github --location=global --display-name="GitHub"
   gcloud iam workload-identity-pools providers create-oidc licencias \
     --location=global --workload-identity-pool=github --display-name="Licencias" \
     --issuer-uri="https://token.actions.githubusercontent.com" \
     --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref" \
     --attribute-condition="assertion.repository=='santifarah1/Licencias' && assertion.ref=='refs/heads/main'"
   gcloud iam service-accounts add-iam-policy-binding github-publicar@licencias-esrn.iam.gserviceaccount.com \
     --role=roles/iam.workloadIdentityUser \
     --member="principalSet://iam.googleapis.com/projects/843734308881/locations/global/workloadIdentityPools/github/attribute.repository/santifarah1/Licencias"
   ```

3. En GitHub: **Settings → Secrets and variables → Actions** → al lado de `FIREBASE_SERVICE_ACCOUNT`, el tachito → **Remove secret**.
4. En GitHub → **Actions → Publicar en Firebase → Run workflow**. Tiene que terminar en verde, sin el aviso amarillo de la llave vieja.
5. Si anduvo, borrá la llave vieja en Google: en la lista de cuentas de servicio, tocá `github-publicar` → pestaña **Claves** → el tachito de la clave que aparece. Desde ahí no queda ninguna llave en ningún lado.

Si el paso 4 falla, se puede volver atrás creando una clave nueva para `github-publicar` (pestaña **Claves → Agregar clave → JSON**) y cargándola otra vez como secreto `FIREBASE_SERVICE_ACCOUNT`. Antes conviene leer el error: si dice `Permission 'iam.serviceAccounts.getAccessToken' denied`, falta el último comando del paso 2. Tarda hasta 5 minutos en hacer efecto, así que puede alcanzar con esperar y volver a correrlo.

Si el workflow falla:
- Con un error de permisos: agregale a la cuenta el rol **Administrador de Firebase** y volvé a correrlo.
- Si dice que Hosting no está configurado: en la consola de Firebase → **Hosting → Comenzar**, salteá los pasos y volvé a correrlo.

### Pruebas

GitHub corre todas las pruebas solo en cada PR (workflow `.github/workflows/pruebas.yml`): si algo da mal, el PR aparece con una cruz roja antes de mergear.

- Todo junto: `npm install` y después `npm test` (necesita Java para el emulador). Prende el emulador de Firebase, corre las pruebas y lo apaga.
  - `pruebas/calculos.test.mjs`: cálculos y pantallas sin servidor (20° b, feriados por régimen, ciclo lectivo, datos viejos, importar y sumar copias, anchos en compu y celular).
  - `pruebas/nube.test.mjs`: la app con usuarios contra el emulador (registro con código, consulta sin permiso de cargar, datos compartidos al instante, sin internet, modo emergencia y sumar la copia).
  - `pruebas/reglas.test.mjs`: reglas de seguridad de Firestore.
- Sólo los cálculos, sin emulador: `npm run test:calculos`. Sólo las reglas: `npm run test:reglas`.
- Si no tenés el navegador de las pruebas: `npx playwright install chromium`.
- App con el emulador:
  1. Levantar los emuladores con `npx firebase emulators:start --only auth,firestore --project demo-licencias`.
  2. Abrir `index.html?emulador` desde `localhost` o como archivo local.
  3. Crear el código en el emulador (paso 4 de arriba), apuntando a `127.0.0.1:8080`.
