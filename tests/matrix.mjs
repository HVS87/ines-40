// Corre a suite de QA (?qa) em vários browsers, tamanhos de ecrã e dispositivos, sem cabeça
// (sem janelas), e junta os resultados numa tabela.
//
//   node tests/matrix.mjs            corre tudo
//   node tests/matrix.mjs iphone     só as configurações cujo nome contém «iphone»
//   node tests/matrix.mjs --only=toque   passa ?only=... à suite (mais rápido)
//   node tests/matrix.mjs --base=https://hvs87.github.io/ines-40/   testa o jogo publicado
//
// Usa os browsers instalados neste computador: Edge ou Chrome (motor Chromium) e Firefox (motor
// Gecko). No Chromium, os telemóveis e tablets são emulados pelo protocolo de depuração: tamanho
// exato do ecrã, densidade de píxeis, ecrã tátil e identificação (user agent) de Android, iPhone e
// iPad; no fim de cada um corre ainda um teste com «dedos» verdadeiros (toques, arrastar, pinça),
// enviados pelo browser como se viessem do ecrã. Não há Safari verdadeiro no Windows: o motor do
// iPhone (WebKit) só se testa num iPhone ou num Mac.
// Precisa do servidor local (node tools/serve.mjs); se não estiver a correr, arranca-o.
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8092, PARALLEL = 3, TIMEOUT = 300000;
const args = process.argv.slice(2), BASE = (args.find((a) => a.startsWith('--base=')) || '--base=http://localhost:8090/').slice(7), only = (args.find((a) => a.startsWith('--only=')) || '').slice(7), filter = args.find((a) => !a.startsWith('--')) || '';

const first = (list) => list.find((p) => p && fs.existsSync(p));
const PF = process.env.ProgramFiles || '', PF86 = process.env['ProgramFiles(x86)'] || '', LAD = process.env.LOCALAPPDATA || '';
const CHROMIUM = first([
  `${PF86}/Microsoft/Edge/Application/msedge.exe`, `${PF}/Microsoft/Edge/Application/msedge.exe`,
  `${PF}/Google/Chrome/Application/chrome.exe`, `${PF86}/Google/Chrome/Application/chrome.exe`, `${LAD}/Google/Chrome/Application/chrome.exe`,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium',
]);
const FIREFOX = first([`${PF}/Mozilla Firefox/firefox.exe`, `${PF86}/Mozilla Firefox/firefox.exe`, '/Applications/Firefox.app/Contents/MacOS/firefox', '/usr/bin/firefox']);

const UA = {
  android: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
  samsung: 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/122.0.0.0 Mobile Safari/537.36',
  androidTablet: 'Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  androidFirefox: 'Mozilla/5.0 (Android 14; Mobile; rv:132.0) Gecko/132.0 Firefox/132.0',
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  iphoneChrome: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0.6723.90 Mobile/15E148 Safari/604.1',
  ipad: 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
};

// nome, motor, largura, altura, densidade de píxeis, user agent, tátil
const RUNS = [
  // Android
  ['android-chrome-alto', 'chromium', 360, 800, 3, UA.android, true],
  ['android-chrome-deitado', 'chromium', 800, 360, 3, UA.android, true],
  ['android-grande-alto', 'chromium', 412, 915, 2.625, UA.android, true],
  ['android-samsung-alto', 'chromium', 384, 832, 2.8125, UA.samsung, true],
  ['android-dobravel-alto', 'chromium', 344, 882, 3, UA.android, true],
  ['android-tablet-alto', 'chromium', 800, 1280, 2, UA.androidTablet, true],
  ['android-tablet-deitado', 'chromium', 1280, 800, 2, UA.androidTablet, true],
  // iPhone e iPad (tamanho, densidade e identificação; o motor continua a ser o Chromium)
  ['iphone-safari-alto', 'chromium', 390, 844, 3, UA.iphone, true],
  ['iphone-safari-deitado', 'chromium', 844, 390, 3, UA.iphone, true],
  ['iphone-se-alto', 'chromium', 375, 667, 2, UA.iphone, true],
  ['iphone-se-deitado', 'chromium', 667, 375, 2, UA.iphone, true],
  ['iphone-max-chrome-alto', 'chromium', 430, 932, 3, UA.iphoneChrome, true],
  ['ipad-alto', 'chromium', 768, 1024, 2, UA.ipad, true],
  ['ipad-deitado', 'chromium', 1024, 768, 2, UA.ipad, true],
  // computador
  ['pc-portatil', 'chromium', 1366, 768, 1, '', false],
  ['pc-grande', 'chromium', 1920, 1080, 1, '', false],
  ['pc-janela-estreita', 'chromium', 900, 900, 1.25, '', false],
  // Firefox (motor Gecko)
  ['firefox-pc', 'firefox', 1366, 768, 1, '', false],
  ['firefox-android-alto', 'firefox', 360, 800, 3, UA.androidFirefox, true],
  ['firefox-android-deitado', 'firefox', 800, 360, 3, UA.androidFirefox, true],
].map(([tag, engine, w, h, dpr, ua, touch]) => ({ tag, engine, w, h, dpr, ua, touch })).filter((r) => r.tag.includes(filter));

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ines-qa-'));
const waiting = new Map();
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') { res.writeHead(204); res.end(); return; }
  let body = '';
  req.on('data', (c) => { if (body.length < 2e6) body += c; });
  req.on('end', () => {
    res.writeHead(200); res.end('ok');
    try { const r = JSON.parse(body); const done = waiting.get(r.tag); if (done) done(r); } catch (err) { /* ignora */ }
  });
}).listen(PORT, '127.0.0.1');

async function serverUp() {
  try { return (await fetch(BASE + 'sw.js')).ok; } catch (err) { return false; }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Cliente mínimo do protocolo de depuração do Chromium (CDP), sobre WebSocket.
class CDP {
  static async open(url) {
    const ws = new WebSocket(url);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('sem ligação ao browser')); });
    return new CDP(ws);
  }
  constructor(ws) {
    this.ws = ws; this.n = 0; this.wait = new Map();
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data), w = m.id && this.wait.get(m.id);
      if (!w) return;
      this.wait.delete(m.id);
      if (m.error) w.rej(new Error(m.error.message)); else w.res(m.result);
    };
  }
  send(method, params = {}) {
    const id = ++this.n;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((res, rej) => this.wait.set(id, { res, rej }));
  }
  async eval(expression) {
    const r = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception ? r.exceptionDetails.exception.description : r.exceptionDetails.text);
    return r.result.value;
  }
}

function qaUrl(run) {
  return `${BASE}?qa&tag=${run.tag}${run.touch ? '&touch' : ''}${only ? '&only=' + only : ''}`;
}

// O teste dos «dedos»: toques verdadeiros (do browser, não simulados pela página) num jogo acabado
// de abrir. Devolve a lista de falhas.
async function dedos(cdp, run) {
  const bad = [], fail = (nome, info = '') => bad.push(`dedo real: ${nome}${info ? ' — ' + info : ''}`);
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], id) => ({ x, y, id, radiusX: 8, radiusY: 8, force: 1 })) });
  const tap = async (x, y) => { await touch('touchStart', [[x, y]]); await sleep(60); await touch('touchEnd', []); await sleep(280); };
  const centro = (sel) => cdp.eval(`(() => { const el = [...document.querySelectorAll(${JSON.stringify(sel)})].find((e) => e.getBoundingClientRect().width > 0); if (!el) return null; const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })()`);
  const toca = async (sel) => { const c = await centro(sel); if (!c) { fail('não encontrei ' + sel); return; } await tap(c[0], c[1]); };
  const estado = () => cdp.eval(`(() => { const g = window.__game, I = g.input; return { ecra: g.ui.current, joga: document.body.classList.contains('playing'), pausa: !!(g.scene && g.scene.paused), acao: I.action, tatil: I.touch, x: I.pointerX, y: I.pointerY, zoom: window.visualViewport ? visualViewport.scale : 1, sy: scrollY, sx: scrollX, movel: document.body.classList.contains('mobile') }; })()`);

  await cdp.send('Page.navigate', { url: BASE });
  // espera pela página nova (não a dos testes), pelo jogo no menu e pela letra dos menus (quando
  // esta chega, os botões mudam de sítio)
  const pronto = '!location.search.includes("qa") && !!(window.__game && window.__game.ui && window.__game.ui.current === "menu") && (!document.fonts || document.fonts.status === "loaded")';
  for (let i = 0; i < 100 && !(await cdp.eval(pronto).catch(() => false)); i++) await sleep(200);
  await sleep(300);
  let e = await estado();
  if (e.ecra !== 'menu') { fail('o jogo não abriu no menu', JSON.stringify(e)); return bad; }
  if (!e.movel) fail('o dispositivo não foi reconhecido como telemóvel/tablet');
  // menu → história → jogo
  await toca('#btn-play');
  e = await estado();
  if (e.ecra !== 'story') fail('tocar em «Jogar» não abriu a história do nível', e.ecra);
  await toca('[data-screen="story"] [data-action="start"]');
  e = await estado();
  if (!e.joga) fail('tocar em «Começar» não começou o nível', JSON.stringify(e));
  for (let i = 0; i < 20 && !(await cdp.eval('window.__game.scene.state === "play"')); i++) { await tap(run.w * 0.5, run.h * 0.6); }
  // manter o dedo, arrastar e largar na área de jogo
  await touch('touchStart', [[run.w * 0.3, run.h * 0.7]]); await sleep(120);
  e = await estado();
  if (!e.acao || !e.tatil || Math.abs(e.x - 0.3) > 0.04 || Math.abs(e.y - 0.7) > 0.04) fail('manter o dedo no ecrã não é a ação do jogo (ou a posição está errada)', JSON.stringify(e));
  for (let k = 1; k <= 5; k++) { await touch('touchMove', [[run.w * (0.3 + 0.08 * k), run.h * (0.7 - 0.04 * k)]]); await sleep(30); }
  e = await estado();
  if (!e.acao || Math.abs(e.x - 0.7) > 0.04 || Math.abs(e.y - 0.5) > 0.04) fail('arrastar o dedo não segue a posição', JSON.stringify(e));
  await touch('touchEnd', []); await sleep(120);
  e = await estado();
  if (e.acao || e.x !== -1) fail('largar o dedo não larga a ação', JSON.stringify(e));
  // dois dedos e pinça: o jogo não faz zoom nem desliza
  await touch('touchStart', [[run.w * 0.4, run.h * 0.5], [run.w * 0.6, run.h * 0.5]]); await sleep(60);
  for (let k = 1; k <= 6; k++) { await touch('touchMove', [[run.w * (0.4 - 0.04 * k), run.h * 0.5], [run.w * (0.6 + 0.04 * k), run.h * 0.5]]); await sleep(25); }
  await touch('touchEnd', []); await sleep(200);
  await tap(run.w * 0.5, run.h * 0.55); await sleep(40); await tap(run.w * 0.5, run.h * 0.55);
  for (let k = 0; k <= 6; k++) { await touch(k ? 'touchMove' : 'touchStart', [[run.w * 0.5, run.h * (0.8 - 0.1 * k)]]); await sleep(25); }
  await touch('touchEnd', []); await sleep(200);
  e = await estado();
  if (Math.abs(e.zoom - 1) > 0.01 || e.sy || e.sx) fail('pinça, toque duplo ou arrastar mexeram na página', JSON.stringify({ zoom: e.zoom, sy: e.sy, sx: e.sx }));
  if (e.acao) fail('ficou um toque preso depois dos gestos');
  // pausa → continuar → pausa → menu
  await toca('[data-action="pause"]');
  e = await estado();
  if (e.ecra !== 'pause' || !e.pausa) fail('tocar no botão de pausa não pausou', JSON.stringify(e));
  await toca('[data-screen="pause"] [data-action="resume"]');
  e = await estado();
  if (e.ecra !== null || e.pausa) fail('tocar em «Continuar» não retomou o jogo', JSON.stringify(e));
  await toca('[data-action="pause"]');
  await toca('[data-screen="pause"] [data-action="menu"]');
  e = await estado();
  if (e.ecra !== 'menu') fail('«Sair para o menu» não voltou ao menu', e.ecra);
  // a lista de níveis desliza com o dedo, e o botão «Voltar» responde
  await toca('[data-screen="menu"] [data-action="levels"]');
  e = await estado();
  if (e.ecra !== 'levels') fail('tocar em «Níveis» não abriu a lista', e.ecra);
  const c = await centro('[data-screen="levels"] .scroll');
  if (c) {
    for (let k = 0; k <= 8; k++) { await touch(k ? 'touchMove' : 'touchStart', [[c[0], c[1] + 60 - k * 18]]); await sleep(25); }
    await touch('touchEnd', []); await sleep(500);
    const top = await cdp.eval('document.querySelector(\'[data-screen="levels"] .scroll\').scrollTop');
    if (!(top > 20)) fail('a lista de níveis não desliza com o dedo', 'scrollTop ' + top);
    e = await estado();
    if (e.ecra !== 'levels') fail('deslizar a lista abriu um nível por engano', e.ecra);
  } else fail('não encontrei a lista de níveis');
  await toca('[data-screen="levels"] [data-action="back"]');
  e = await estado();
  if (e.ecra !== 'menu') fail('«Voltar» não voltou ao menu', e.ecra);
  // os botões de som respondem e ficam guardados
  const antes = await cdp.eval('window.__game.audio.musicMuted');
  await toca('#btn-music');
  const depois = await cdp.eval('window.__game.audio.musicMuted');
  if (antes === depois) fail('tocar em «Música» não ligou/desligou a música');
  await toca('#btn-music');
  const erros = await cdp.eval('(window.__errors || []).length');
  if (erros) fail('erros durante os toques', String(erros));
  return bad;
}

async function chromium(run, dir) {
  const child = spawn(CHROMIUM, ['--headless=new', `--user-data-dir=${dir}`, '--remote-debugging-port=0', '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--mute-audio',
    '--hide-scrollbars', '--window-size=1200,900', 'about:blank'], { stdio: 'ignore' });
  let cdp = null;
  try {
    const portFile = path.join(dir, 'DevToolsActivePort');
    for (let i = 0; i < 100 && !fs.existsSync(portFile); i++) await sleep(100);
    const port = fs.readFileSync(portFile, 'utf8').split('\n')[0].trim();
    let page = null;
    for (let i = 0; i < 50 && !page; i++) { page = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page'); if (!page) await sleep(100); }
    cdp = await CDP.open(page.webSocketDebuggerUrl);
    await cdp.send('Page.enable'); await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: run.w, height: run.h, deviceScaleFactor: run.dpr, mobile: run.touch, screenWidth: run.w, screenHeight: run.h });
    if (run.touch) await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    if (run.ua) await cdp.send('Emulation.setUserAgentOverride', { userAgent: run.ua, platform: /iPhone/.test(run.ua) ? 'iPhone' : /iPad/.test(run.ua) ? 'iPad' : 'Linux armv81' });
    await cdp.send('Page.navigate', { url: qaUrl(run) });
    let report = null;
    for (const t0 = Date.now(); Date.now() - t0 < TIMEOUT && !report;) {
      await sleep(1000);
      report = await cdp.eval(`(() => { const q = window.__qa; if (!q || !q.done) return null; const g = window.__game; return { ua: navigator.userAgent, size: innerWidth + 'x' + innerHeight, dpr: devicePixelRatio, view: g.view.w + 'x' + g.view.h, coarse: matchMedia('(pointer: coarse)').matches, total: q.results.length, bad: q.bad, errors: q.errors, medidas: q.results.filter((r) => /^desenho:/.test(r.name)).map((r) => r.name), rodar: q.results.filter((r) => /a meio de cada nível/.test(r.name)).map((r) => r.name), pesados: q.pesados }; })()`).catch(() => null);
    }
    if (report && run.touch) {
      const extra = await dedos(cdp, run).catch((err) => ['dedo real: o teste não chegou ao fim — ' + err.message]);
      report.total += 1;
      report.dedos = extra.length ? 'falhou' : 'ok';
      report.bad = report.bad.concat(extra);
    }
    return report;
  } finally {
    if (cdp) { await Promise.race([cdp.send('Browser.close').catch(() => {}), sleep(1500)]); try { cdp.ws.close(); } catch (err) { /* já fechou */ } }
    kill(child);
  }
}

async function firefox(run, dir) {
  const prefs = {
    'browser.shell.checkDefaultBrowser': false, 'browser.aboutwelcome.enabled': false, 'datareporting.policy.dataSubmissionEnabled': false,
    'toolkit.telemetry.reportingpolicy.firstRun': false, 'browser.startup.homepage_override.mstone': 'ignore', 'startup.homepage_welcome_url': '',
    'startup.homepage_welcome_url.additional': '', 'app.update.auto': false, 'media.volume_scale': '0.0', 'layout.css.devPixelsPerPx': String(run.dpr),
    ...(run.ua ? { 'general.useragent.override': run.ua } : {}), ...(run.touch ? { 'dom.w3c_touch_events.enabled': 1 } : {}),
  };
  fs.writeFileSync(path.join(dir, 'user.js'), Object.entries(prefs).map(([k, v]) => `user_pref(${JSON.stringify(k)}, ${JSON.stringify(v)});`).join('\n'));
  // o Firefox tira à janela a altura da sua barra de cima (85 px): compensa-se aqui
  const W = run.w, H = run.h + 85;
  const url = `${qaUrl(run)}&report=${encodeURIComponent(`http://localhost:${PORT}/`)}${run.touch ? '&device=mobile' : ''}`;
  const child = spawn(FIREFOX, ['--headless', '--no-remote', '--wait-for-browser', '--profile', dir, '--width', String(W), '--height', String(H), url],
    { stdio: 'ignore', env: { ...process.env, MOZ_HEADLESS_WIDTH: String(W), MOZ_HEADLESS_HEIGHT: String(H) } });
  const report = await new Promise((resolve) => {
    waiting.set(run.tag, resolve);
    setTimeout(() => resolve(null), TIMEOUT);
    child.on('error', () => resolve(null));
    child.on('exit', () => setTimeout(() => resolve(null), 1500));     // fechou-se sem responder
  });
  waiting.delete(run.tag);
  kill(child);
  return report;
}

function kill(child) {
  try {
    if (process.platform === 'win32') execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    else child.kill('SIGKILL');
  } catch (err) { /* já tinha acabado */ }
}

// Fecha o que tenha ficado aberto com a pasta temporária desta configuração.
function limpa(nome) {
  if (process.platform !== 'win32') return;
  try { execFileSync('powershell', ['-NoProfile', '-Command', `Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*${nome}*' -and $_.Name -ne 'powershell.exe' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`], { stdio: 'ignore' }); } catch (err) { /* nada a limpar */ }
}

async function one(run) {
  const exe = run.engine === 'chromium' ? CHROMIUM : FIREFOX;
  if (!exe) return { ...run, skipped: `sem ${run.engine} instalado` };
  // o Firefox entrega o resultado a este computador por HTTP, o que uma página HTTPS não deixa fazer
  if (run.engine === 'firefox' && !BASE.includes('localhost')) return { ...run, skipped: 'Firefox só se testa com o servidor local' };
  const t0 = Date.now();
  let report = null;
  // se o browser não responder (acontece ao arrancar vários ao mesmo tempo), tenta-se mais uma vez
  for (let vez = 0; vez < 2 && !report; vez++) {
    const dir = path.join(tmp, run.tag + (vez ? '-b' : ''));
    fs.mkdirSync(dir, { recursive: true });
    try { report = await (run.engine === 'chromium' ? chromium(run, dir) : firefox(run, dir)); } catch (err) { report = null; run.erro = err.message; }
    limpa(path.basename(tmp) + path.sep + run.tag);
  }
  return { ...run, report, secs: Math.round((Date.now() - t0) / 1000) };
}

let own = null;
if (BASE.includes('localhost') && !(await serverUp())) {
  own = spawn(process.execPath, [path.join(ROOT, 'tools/serve.mjs')], { stdio: 'ignore', cwd: ROOT });
  for (let i = 0; i < 30 && !(await serverUp()); i++) await new Promise((r) => setTimeout(r, 200));
}
console.log(`Chromium: ${CHROMIUM || '—'}\nFirefox:  ${FIREFOX || '—'}\n${RUNS.length} configurações${only ? `, só «${only}»` : ''}\n`);
const queue = [...RUNS], out = [];
await Promise.all(Array.from({ length: PARALLEL }, async () => {
  while (queue.length) {
    const r = await one(queue.shift());
    out.push(r);
    const rep = r.report;
    console.log(`${(rep && !rep.bad.length ? 'OK   ' : r.skipped ? 'SALTO' : 'FALHA')} ${r.tag.padEnd(26)} ${rep ? `${rep.size.padEnd(9)} dpr ${String(rep.dpr).padEnd(6)} jogo ${rep.view.padEnd(8)} ${rep.total - rep.bad.length}/${rep.total}${rep.dedos ? ' dedos ' + rep.dedos : ''}  ${r.secs} s${rep.medidas && rep.medidas[0] ? '  ' + rep.medidas[0].replace(/^desenho: /, '').replace(' por fotograma em média; o ato mais pesado', ', pior') : ''}` : r.skipped || 'sem resposta: ' + (r.erro || 'tempo esgotado')}`);
  }
}));
server.close();
if (own) kill(own);
// processos que tenham ficado para trás e pastas temporárias
limpa(path.basename(tmp));
await new Promise((r) => setTimeout(r, 800));
try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (err) { /* fica na pasta temporária do sistema */ }

const fails = out.filter((r) => !r.skipped && (!r.report || r.report.bad.length));
console.log(`\n${out.length - fails.length}/${out.length} configurações sem falhas.`);
const seen = new Map();
for (const r of fails) for (const b of r.report ? r.report.bad : ['sem resposta']) seen.set(b, [...(seen.get(b) || []), r.tag]);
for (const [b, tags] of seen) console.log(`\n✘ ${b}\n   em: ${tags.join(', ')}`);
fs.writeFileSync(path.join(ROOT, 'tests', 'matrix-result.json'), JSON.stringify(out.map((r) => ({ tag: r.tag, engine: r.engine, pedido: `${r.w}x${r.h}@${r.dpr}`, ...(r.report || {}), skipped: r.skipped, secs: r.secs })), null, 2));
process.exit(fails.length ? 1 : 0);
