# Guía de uso en PDF

El PDF final está en [`docs/Guia-Licencias-ESRN-Rural-Virtual.pdf`](../../docs/Guia-Licencias-ESRN-Rural-Virtual.pdf). Esta carpeta tiene lo necesario para rehacerlo cuando cambie la app:

- `guia.html`: el texto de la guía.
- `capturas.mjs`: abre la app contra el emulador de Firebase con datos de ejemplo y tres usuarios (administra, carga y consulta) y saca las capturas en `img/`.
- `pdf.mjs`: arma el PDF a partir de `guia.html` y las capturas.

Para rehacerla, desde la raíz del repo (necesita `npm install` con Playwright, que viene con las pruebas automáticas, y Java para el emulador):

```bash
npx firebase emulators:exec --only auth,firestore --project demo-licencias "node herramientas/guia/capturas.mjs"
node herramientas/guia/pdf.mjs
```
