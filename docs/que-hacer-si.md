# Qué hacer si…

Guía para cuando algo no anda. Está pensada para leerla con calma en el momento del problema, sin tener que acordarse de nada.

**Datos a mano**

- App: **https://licencias-esrn.web.app**
- Link viejo (plan B, guarda sólo en la compu): **https://santifarah1.github.io/Licencias/**
- Proyecto de Firebase: `licencias-esrn` (número `843734308881`), en **console.firebase.google.com**
- Copias nocturnas: Drive de cada cuenta dueña → carpeta **Copias Licencias ESRN**
- Repositorio: **github.com/santifarah1/Licencias**

---

## La página no abre o dice "Sitio no encontrado"

Lo más probable es que Google haya suspendido el proyecto o la cuenta dueña, como pasó en noviembre de 2026. Los datos no se pierden: quedan en el servidor y vuelven cuando se levanta la suspensión.

**Para seguir trabajando mientras tanto** (en la compu donde se carga siempre):

1. Abrí la app. Si llega a aparecer la pantalla de ingreso, abajo va a estar **"¿No anda el servidor? Usar la copia de esta compu"**. Tocalo.
2. Si la página ni siquiera abre, usá el **link viejo** y cargá ahí. Guarda sólo en esa compu, pero no se pierde.
3. En los dos casos, al terminar el día tocá **Exportar copia** y guardá el archivo en un pendrive o mandátelo por mail. Así no depende de una sola compu.

**Cuando vuelve a andar:**

1. En la compu donde se cargó en emergencia (o en el link viejo): **Exportar copia**.
2. El administrador entra a la app normal → **Ajustes → Datos y respaldo → Sumar una copia…** y elige ese archivo.
3. Se agregan las licencias nuevas y los cambios, sin borrar nada de lo que había en el servidor. Si se suma dos veces la misma copia, no se duplica.

**Para recuperar la cuenta:** entrá a gmail.com con la cuenta dueña. Si dice que está inhabilitada, seguí el botón para apelar y explicá que es una cuenta para una app escolar. Mientras tanto, la **segunda cuenta dueña** puede entrar a la consola de Firebase y ver si el proyecto aparece suspendido y por qué.

## No hay internet

No hace falta hacer nada. La app sigue andando con lo último que cargó y guarda lo nuevo en la compu. Arriba dice **"Sin conexión"**. Cuando vuelve internet, se sube solo. No cierres sesión mientras no haya internet, porque lo que no se subió todavía se perdería.

## Alguien borró o cargó algo mal

- **Una licencia o un agente puntual**: se corrige a mano en la app, como siempre.
- **Se rompió mucho** (por ejemplo, se importó una copia equivocada):
  1. Buscá en el Drive, en **Copias Licencias ESRN**, la copia de la noche anterior al problema (`copia-automatica-AAAA-MM-DD.json`) y bajala.
  2. Como administrador: **Ajustes → Datos y respaldo → Importar copia…** y elegí ese archivo.
  3. **Ojo:** "Importar copia" **reemplaza todo** por lo que tiene el archivo, así que se pierde lo que se cargó después de esa noche. Si sólo querés recuperar cosas que faltan, sin tocar lo demás, usá **Sumar una copia…**.

## Me olvidé la contraseña

En la pantalla de ingreso, escribí el mail y tocá **Olvidé mi contraseña**. Llega un mail para elegir una nueva (mirá en spam). Si entrás con Google, no hay contraseña: se usa la de Gmail.

## Se rompió o se cambió la compu

Los datos están en el servidor, no en la compu. En la compu nueva se abre la app y se entra con el mismo usuario. Si la compu vieja sigue andando y la va a usar otra persona, entrá en ella y usá **Salir y borrar esta compu**, desde el botón del usuario, arriba a la derecha.

## Entra alguien nuevo o alguien se va

- **Alguien nuevo**: pasale el link y el **código de la escuela** (lo ve el administrador en **Ajustes → Usuarios**). Al crear su cuenta elige si va a cargar o sólo a consultar. El administrador puede cambiarlo después.
- **Alguien se va**: el administrador, en **Ajustes → Usuarios**, toca **Dar de baja**. Desde ese momento el servidor no le deja ver ni cargar nada, aunque tenga la sesión abierta, y la próxima vez que entre le dice que está dado de baja.
- **El código se pasó a quien no tenía que tenerlo**: **Ajustes → Usuarios → Generar uno nuevo**. El viejo deja de servir para crear cuentas. Los que ya tienen cuenta siguen entrando.

## Las copias nocturnas dejaron de llegar

1. Entrá a **script.google.com** con la cuenta dueña → proyecto **Copia diaria Licencias** → **Ejecuciones** (el ícono de la lista).
2. Si hay corridas con error, abrí la última y fijate el mensaje. Los errores comunes y su arreglo están en [`herramientas/copia-diaria/LEEME.md`](../herramientas/copia-diaria/LEEME.md).
3. Si no hay ninguna corrida, ejecutá de nuevo la función `instalar`.

## La copia nocturna en la segunda cuenta dueña

Conviene tener la copia diaria instalada en **las dos cuentas dueñas**. Así, si una se suspende, la otra sigue teniendo copias en su propio Drive.

1. Entrá a **script.google.com** con la **segunda cuenta dueña**. Revisá arriba a la derecha que sea esa.
2. Seguí los mismos pasos de instalación de [`herramientas/copia-diaria/LEEME.md`](../herramientas/copia-diaria/LEEME.md), desde el paso 1.
3. Seguramente aparezca el error **"has not been used in project … or it is disabled"**. Es normal: se arregla conectando el script al proyecto `843734308881`, como explica la sección "Si da error" de ese archivo.
4. Al otro día fijate que en el Drive de esa cuenta haya aparecido la carpeta **Copias Licencias ESRN** con la copia.

Las dos copias corren solas y no se pisan, porque cada una guarda en su propio Drive.

## GitHub muestra una cruz roja

- **En un PR, en "Pruebas"**: alguna prueba automática falló, o sea que ese cambio rompe algo. No lo mergees hasta que esté en verde.
- **En main, en "Publicar en Firebase"**: no se pudo publicar la versión nueva. La app sigue andando con la versión anterior. Abrí la corrida en la pestaña **Actions** y mirá el error. Si dice "suspended" o "permission denied", es el caso de "La página no abre" de arriba.

## Hay que mudar la app a otra cuenta o a otra escuela

Se puede rearmar desde cero con una copia: un proyecto de Firebase nuevo, siguiendo la "Puesta en marcha" del [README](../README.md), y después se importa el último archivo de **Exportar copia** o de la copia nocturna. Las cuentas de usuario no se mudan: cada uno se vuelve a registrar con el código nuevo.
