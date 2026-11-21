# Copia diaria automática (Google Apps Script)

Todas las noches, cerca de las 3, guarda una copia de todos los datos en el Drive de la cuenta dueña del proyecto de Firebase. Queda en la carpeta **Copias Licencias ESRN**, con un archivo por día (`copia-automatica-AAAA-MM-DD.json`). El nombre distinto es para no confundirlas con las que se bajan a mano con "Exportar copia" (`licencias-AAAA-MM-DD.json`). Se guardan las últimas 60, y las más viejas van a la papelera.

Cada copia tiene el mismo formato que "Exportar copia" de la app. Para volver a una copia: en la app, como administrador, **Ajustes → Datos y respaldo → Importar copia** y elegir el archivo.

No cuesta nada: usa la cuota gratis de Apps Script, y para una escuela cada copia gasta unas pocas centenas de lecturas.

## Instalación (una sola vez, unos 10 minutos)

Todo se hace con la **cuenta de Google dueña del proyecto** (la que creó `licencias-esrn` en Firebase).

1. Entrá a **script.google.com** → **Nuevo proyecto**. Arriba a la izquierda, cambiale el nombre de "Proyecto sin título" a `Copia diaria Licencias`.
2. Tocá el engranaje (**Configuración del proyecto**) y tildá **"Mostrar el archivo de manifiesto «appsscript.json» en el editor"**.
3. Volvé al editor (el ícono `< >`):
   - En **Código.gs**, borrá todo y pegá el contenido de [`Codigo.gs`](Codigo.gs).
   - En **appsscript.json**, borrá todo y pegá el contenido de [`appsscript.json`](appsscript.json).
   - Guardá con el ícono del disquete.
4. Arriba, en la lista de funciones, elegí **`instalar`** y tocá **Ejecutar**.
5. Google pide permiso:
   - Tocá **Revisar permisos** y elegí la cuenta.
   - Si dice **"Google no verificó esta app"**, tocá **Configuración avanzada → Ir a Copia diaria Licencias (no seguro)**. Es normal: la app es tuya y no está publicada.
   - Tocá **Permitir**.
6. En el **Registro de ejecución** de abajo tiene que aparecer algo como `Copia copia-automatica-2026-11-21.json: 8 agentes, 22 licencias.`
7. Entrá al **Drive** de esa cuenta: tiene que estar la carpeta **Copias Licencias ESRN** con la primera copia.

Listo. Desde ahora corre sola todas las noches. Para ver que siga andando, en script.google.com → el proyecto → **Ejecuciones** (el ícono de la lista) están todas las corridas.

## Si da error

- **`Firestore respondió 403 … has not been used in project … or it is disabled`**: hay que conectar el script al proyecto de Firebase.
  1. En la consola de Firebase: engranaje → **Configuración del proyecto** → **General**. Copiá el **Número del proyecto** (para `licencias-esrn` es `843734308881`).
  2. En el script: engranaje → **Proyecto de Google Cloud** → **Cambiar proyecto**. Pegá ese número y confirmá.
  3. Si pide configurar la **pantalla de consentimiento de OAuth**, seguí el enlace y completá solo lo obligatorio: nombre de la app `Copia diaria Licencias`, el mail de la cuenta en los dos campos de mail, tipo **Externo** y, en "Usuarios de prueba", el mail de la cuenta. Después volvé a ejecutar `instalar`.
- **`Firestore respondió 403 … PERMISSION_DENIED`**: el script se está ejecutando con otra cuenta. Revisá arriba a la derecha que sea la dueña del proyecto.
- **Cualquier otro error**: copiá el mensaje del Registro de ejecución y pasáselo a Santi.

## Si ya lo tenías instalado

Volvé a pegar `Codigo.gs` en el editor y guardá. No hace falta ejecutar `instalar` de nuevo: desde la próxima noche las copias salen con el nombre nuevo. Las viejas (`licencias-…` de esa carpeta) se siguen contando para guardar solo las últimas 60.

## Si cambia algo

- **Otro proyecto de Firebase** (por ejemplo, otra escuela): cambiá `PROYECTO` al principio de `Codigo.gs`.
- **Otra hora**: cambiá `atHour(3)` en `instalar` y volvé a ejecutar `instalar`.
