// Saca las capturas de la guía de uso con la app en la nube (emulador de Firebase).
// Uso (desde la raíz del repo): npm run guia
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const APP = 'file://' + path.join(RAIZ, 'index.html') + '?emulador';
const SDK = path.join(RAIZ, 'node_modules', 'firebase');
const OUT = path.join(RAIZ, 'herramientas', 'guia', 'img');
const AUTH = 'http://127.0.0.1:9099';
const FS = 'http://127.0.0.1:8080/v1/projects/demo-licencias/databases/(default)/documents';
const OWNER = { Authorization: 'Bearer owner', 'Content-Type': 'application/json' };
const W = 1366;
mkdirSync(OUT, { recursive: true });

async function ponerDoc(ruta, campos) {
  const fields = Object.fromEntries(Object.entries(campos).map(([k, v]) => [k, typeof v === 'boolean' ? { booleanValue: v } : { stringValue: v }]));
  await fetch(`${FS}/${ruta}`, { method: 'PATCH', headers: OWNER, body: JSON.stringify({ fields }) });
}
async function cuenta(email, nombre, rol) {
  const r = await (await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: 'secreta1', returnSecureToken: true }) })).json();
  await ponerDoc(`usuarios/${r.localId}`, { nombre, email, rol, activo: true, codigo: 'X' });
}

await fetch('http://127.0.0.1:8080/emulator/v1/projects/demo-licencias/databases/(default)/documents', { method: 'DELETE' });
await fetch(`${AUTH}/emulator/v1/projects/demo-licencias/accounts`, { method: 'DELETE' });
await ponerDoc('config/acceso', { codigo: 'ESRN-7K4P-2QX9' });
await cuenta('santi@escuela.com', 'Santiago (administra)', 'admin');
await cuenta('marta@escuela.com', 'Marta', 'carga');
await cuenta('directora@escuela.com', 'Directora', 'consulta');

const b = await chromium.launch({ args: ['--lang=es-AR'], env: { ...process.env, LANG: 'es_AR.UTF-8', LC_ALL: 'es_AR.UTF-8' } });
const errores = [];
let caido = false;
async function nuevoContexto() {
  const ctx = await b.newContext({ viewport: { width: W, height: 820 }, deviceScaleFactor: 2, locale: 'es-AR', timezoneId: 'America/Argentina/Buenos_Aires' });
  await ctx.route('https://www.gstatic.com/firebasejs/**', r => r.fulfill({ status: 200, contentType: 'application/javascript',
    body: readFileSync(path.join(SDK, path.basename(new URL(r.request().url()).pathname))) }));
  await ctx.route(/127\.0\.0\.1:(8080|9099)/, r => caido ? r.abort() : r.continue());
  return ctx;
}
async function pagina(ctx) {
  const p = await ctx.newPage();
  p.on('pageerror', e => errores.push(e.message)); p.on('dialog', d => d.accept());
  await p.goto(APP); await p.waitForSelector('.ingreso'); await p.waitForTimeout(400);
  return p;
}
async function entrar(p, email) {
  await p.fill('input[name=email]', email); await p.fill('input[name=clave]', 'secreta1');
  await p.click('form[data-form="ingreso-entrar"] button');
  await p.waitForFunction(() => NubeDatos.listo && !NubeDatos.pendientes, null, { timeout: 20000 });
  await p.waitForTimeout(600);
}
const espera = p => p.waitForTimeout(450);
// En el emulador la pantalla de ingreso dice "Modo prueba": para la guía se muestra como en la app real
const comoReal = p => p.evaluate(() => document.querySelectorAll('.ingreso-marca .muted').forEach(e => { e.textContent = INSTITUCION; }));
const foto = async (p, n, opts = {}) => { await espera(p); await p.screenshot({ path: `${OUT}/${n}.png`, ...opts }); console.log('ok', n); };
const recorte = async (p, n, sel, pad = 0) => {
  await espera(p); const bb = await p.locator(sel).first().boundingBox();
  await p.screenshot({ path: `${OUT}/${n}.png`, clip: { x: Math.max(0, bb.x - pad), y: Math.max(0, bb.y - pad), width: Math.min(W, bb.width + pad * 2), height: bb.height + pad * 2 } });
  console.log('ok', n);
};
const ir = (p, fn, arg) => p.evaluate(fn, arg).then(() => espera(p));
const cerrarModal = async p => { await p.keyboard.press('Escape'); await espera(p); if (await p.$('.modal')) { await p.click('.modal [data-x="cerrar"], .modal [data-x="no"]').catch(() => {}); await espera(p); } };

// ---------- 1) Ingreso y registro ----------
const ctxNueva = await nuevoContexto();
let p = await pagina(ctxNueva);
await comoReal(p);
await recorte(p, '01-ingresar', '.ingreso', 24);
await p.click('[data-act="ingreso-tab"][data-v="registro"]');
await p.fill('input[name=nombre]', 'Vicedirector'); await p.fill('input[name=email]', 'vice@escuela.com');
await p.fill('input[name=clave]', 'secreta1'); await p.check('input[name=rol][value=consulta]'); await p.fill('input[name=codigo]', 'ESRN-7K4P-2QX9');
await comoReal(p);
await recorte(p, '02-registro', '.ingreso', 24);
await ctxNueva.close();

// ---------- 2) Admin: datos de ejemplo, ciclo lectivo, usuarios, respaldo ----------
const ctxAdmin = await nuevoContexto();
const A = await pagina(ctxAdmin);
await entrar(A, 'santi@escuela.com');
await A.evaluate(() => { cargarEjemplo(); mutar(e => { e.config.ciclos = { 2026: { inicio: '2026-03-02', fin: '2026-12-18' } }; }); });
await A.waitForFunction(() => !NubeDatos.pendientes, null, { timeout: 20000 }); await A.waitForTimeout(800);
await ir(A, () => { ui.ajustesTab = 'usuarios'; location.hash = '#ajustes'; render(); });
await A.waitForSelector('#main table.t tbody tr'); await A.waitForTimeout(600);
await foto(A, '16-usuarios', { clip: { x: 0, y: 0, width: W, height: 620 } });
await ir(A, () => { ui.ajustesTab = 'datos'; location.hash = '#ajustes'; render(); });
await foto(A, '17-respaldo', { clip: { x: 0, y: 0, width: W, height: 720 } });

// ---------- 3) Carga: el uso de todos los días ----------
const ctxCarga = await nuevoContexto();
p = await pagina(ctxCarga);
await entrar(p, 'marta@escuela.com');
await ir(p, () => { ui.fecha = hoyISO(); location.hash = '#inicio'; render(); });
await recorte(p, '03-barra', 'header.top');
await p.click('#btn-usuario'); await recorte(p, '04-menu-usuario', '.modal'); await cerrarModal(p);
await foto(p, '05-inicio', { fullPage: true });

await ir(p, () => { location.hash = '#agentes'; render(); });
await foto(p, '11-agentes', { clip: { x: 0, y: 0, width: W, height: 640 } });
await p.click('[data-act="nuevo-agente"]'); await espera(p);
await p.fill('.modal input[name=apellido], .modal [data-f="apellido"]', 'Pérez').catch(() => {});
await p.setViewportSize({ width: W, height: 1600 }); await espera(p);
await recorte(p, '06-nuevo-agente', '.modal');
await p.setViewportSize({ width: W, height: 820 });
await cerrarModal(p);

await ir(p, () => { location.hash = '#inicio'; render(); });
await p.click('#btn-nueva'); await espera(p);
await p.locator('.modal [data-f="agente"]').click(); await espera(p);
await p.locator('.combo-pop .op', { hasText: 'BENÍTEZ' }).hover(); await espera(p);
{ const m = await p.locator('.modal').boundingBox(); const c = await p.locator('.combo-pop').boundingBox();
  await p.screenshot({ path: `${OUT}/07-elegir-agente.png`, clip: { x: m.x, y: m.y, width: m.width, height: Math.min(m.height, c.y + c.height + 16 - m.y) } }); console.log('ok 07'); }
await p.locator('.combo-pop .op', { hasText: 'ÁLVAREZ' }).click(); await espera(p);
await p.selectOption('.modal [data-f="articulo"]', '233-1'); await p.locator('.modal [data-f="articulo"]').dispatchEvent('change'); await espera(p);
await p.fill('.modal [data-f="desde"]', '2026-11-30'); await p.locator('.modal [data-f="desde"]').dispatchEvent('change'); await espera(p);
await p.fill('.modal [data-f="cant"]', '3'); await p.locator('.modal [data-f="cant"]').dispatchEvent('input'); await espera(p);
await p.setViewportSize({ width: W, height: 1400 }); await espera(p);
await recorte(p, '08-nueva-licencia', '.modal');
await p.setViewportSize({ width: W, height: 820 });
await cerrarModal(p);

await ir(p, () => { const ag = estado.agentes.find(a => a.apellido.includes('Álvarez')); ui.anio = 2026; ui.fichaTab = 'planilla'; location.hash = '#agente/' + ag.id; render(); });
await p.locator('table.planilla td.d.g-salud').nth(3).hover().catch(() => {}); await espera(p);
await foto(p, '09-ficha', { fullPage: true });
await p.click('[data-act="ficha-tab"][data-v="articulos"]'); await espera(p);
await recorte(p, '10-ficha-articulos', '#main [data-tab="articulos"]');

await ir(p, () => { location.hash = '#inicio'; render(); });
await p.locator('[data-act="nueva-nota"]').first().click(); await espera(p);
await p.locator('.modal textarea').fill('Reunión de personal 10 hs');
await recorte(p, '12-nota', '.modal'); await cerrarModal(p);

await ir(p, () => { ui.repTab = 'licencias'; ui.rep.desde = '2026-01-01'; ui.rep.hasta = '2026-12-31'; location.hash = '#reportes'; render(); });
await foto(p, '13-reportes', { clip: { x: 0, y: 0, width: W, height: 660 } });
await ir(p, () => { ui.repTab = 'nomina'; render(); });
await foto(p, '14-nomina', { clip: { x: 0, y: 0, width: W, height: 560 } });

await ir(p, () => { ui.ajustesTab = 'calendario'; ui.calAnio = 2026; location.hash = '#ajustes'; render(); });
await foto(p, '15-ajustes-calendario', { clip: { x: 0, y: 0, width: W, height: 760 } });
{ const fila = p.locator('#main table.t tbody tr', { hasText: 'Maestro' }); await fila.scrollIntoViewIfNeeded(); await espera(p);
  const bb = await fila.boundingBox(); const tabla = await fila.locator('xpath=ancestor::table[1]').boundingBox();
  await p.screenshot({ path: `${OUT}/15b-para-quien.png`, clip: { x: tabla.x, y: bb.y - 90, width: tabla.width, height: 180 } }); console.log('ok 15b'); }

// ---------- 4) Servidor caído: modo emergencia ----------
await p.waitForFunction(() => !!leerCopiaEnCompu(), null, { timeout: 40000 });
await p.click('#btn-usuario'); await p.click('.modal [data-x="salir"]');
await p.waitForTimeout(3000); await p.waitForLoadState();
caido = true;
await p.goto(APP); await p.waitForSelector('[data-act="emergencia-entrar"]', { timeout: 20000 });
await comoReal(p);
await recorte(p, '18-ingreso-emergencia', '.ingreso', 24);
await p.click('[data-act="emergencia-entrar"]'); await p.waitForSelector('#banners .banner.err'); await espera(p);
await foto(p, '19-emergencia', { clip: { x: 0, y: 0, width: W, height: 420 } });

console.log(errores.length ? errores : 'sin errores');
await b.close();
