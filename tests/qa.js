// Suite de QA automática do jogo. Abre o jogo com ?qa no endereço (por exemplo
// http://localhost:8090/?qa) e os testes correm sozinhos, com o resultado num painel e em
// window.__qa ({ results, bad, errors, done }).
//
//   ?qa&only=<nome>   corre só um grupo (dados, jogo, fluxo, textos, fontes, offline, monkey)
//   ?qa&seed=7        semente do teste de toques ao acaso (monkey)
//   ?qa&touch         joga em modo tátil (por omissão, teclado)
//
// O que se testa:
//   1. Dados: os 26 níveis carregam, têm textos e atos, e os corações batem certo.
//   2. O jogo completo: cada nível jogado do princípio ao fim pelos robôs dos atos, com pausa a
//      meio, sem erros, e a seguir os parabéns finais.
//   3. Textos: tudo o que os níveis mostram (histórias, instruções e falas), sem marcadores por
//      substituir, sem palavras de PT-BR, e a caber no ecrã.
//   4. Menus, gravação do progresso, ficheiros para jogar sem rede e toques ao acaso.
// Atenção: os testes apagam o progresso guardado neste browser.
import { LEVELS, levelLabel } from '../js/levels/index.js';
import { SAVE_KEY } from '../js/config.js';
import { seen } from '../js/sprites.js';

const STEP = 1 / 60;
const results = [];
let game, I;
const shown = new Set();        // todas as instruções e falas mostradas durante os testes
const shownBy = new Map();      // texto → nível onde apareceu
let hintIssues = [];

function check(name, ok, info = '') {
  results.push({ name, ok: !!ok, info: ok ? '' : String(info) });
  log((ok ? '✔ ' : '✘ ') + name + (ok || !info ? '' : ' — ' + info));
}

let panel;
function log(line) {
  if (!panel) {
    panel = document.createElement('pre');
    panel.style.cssText = 'position:fixed;left:0;bottom:0;right:0;max-height:35vh;overflow:auto;margin:0;padding:6px 8px;font:11px/1.35 monospace;background:rgba(0,0,0,.85);color:#cfc;z-index:99;white-space:pre-wrap;pointer-events:auto';
    document.body.append(panel);
  }
  panel.textContent += line + '\n';
  panel.scrollTop = panel.scrollHeight;
}

const tick = () => new Promise((r) => setTimeout(r, 0));
const $ = (s) => document.querySelector(s);
const ctx2d = () => document.getElementById('game').getContext('2d');

function clearInput() {
  I.left = I.right = I.up = I.down = I.action = false;
  I.actionPressed = false;
  I.pointerX = I.pointerY = -1;
}

// Avança n passos de jogo; antes de cada um, o robô (ou a função dada) decide o que «carregar».
function frames(n, bot = true) {
  for (let k = 0; k < n; k++) {
    const s = game.scene;
    clearInput();
    if (bot === true) { if (s.bot) s.bot(); } else if (bot) bot(s, k);
    s.update(STEP);
    if (k % 20 === 0) s.draw(ctx2d(), game.view);
  }
  clearInput();
}

// ---------- Textos ----------
const BR = /(^|[^a-záéíóúâêôãõçA-Z])(voc[êe]|tela|celular|[ôo]nibus|trem|banheiro|geladeira|café da manhã|galera|grama|gol|equipe|contato|registro|usuário|mouse|deletar|acessar|aterrissar|a gente vai|pra|tá bom|cadê|moça|garot[oa]s?|xícara|suco|sorvete|fato de que|est[áa] (fazendo|indo|vindo|dando|ficando|querendo)|estou [a-z]+ndo|est[ãa]o [a-z]+ndo)(?![a-záéíóúâêôãõç])/i;
const BAD_TOKENS = /undefined|NaN|\[object|\{\w*\}|\$\{|null\b/;

function collectStrings(obj, out, depth = 0) {
  if (typeof obj === 'string') out.push(obj);
  else if (Array.isArray(obj)) obj.forEach((x) => collectStrings(x, out, depth + 1));
  else if (obj && typeof obj === 'object' && depth < 6) for (const [k, v] of Object.entries(obj)) { if (k !== 'act' && k !== 'who' && k !== 'outfit' && typeof v !== 'function') collectStrings(v, out, depth + 1); }
  return out;
}

const isText = (s) => /\s/.test(s) && /[a-záéíóúâêôãõç]{3}/i.test(s);

function textProblems(s) {
  const out = [];
  if (BAD_TOKENS.test(s)) out.push('marcador por substituir');
  if (BR.test(s)) out.push('PT-BR: ' + BR.exec(s)[2]);
  if ((s.match(/«/g) || []).length !== (s.match(/»/g) || []).length) out.push('aspas «» desencontradas');
  if (/  /.test(s)) out.push('dois espaços');
  if (/[\u0000-\u0008�]|Ã©|Ã£|Ã§/.test(s)) out.push('carateres estragados');
  if (/"/.test(s)) out.push('aspas direitas (usar «»)');
  return out;
}

function testData() {
  check('há 26 níveis', LEVELS.length === 26, LEVELS.length);
  const broken = LEVELS.filter((L) => L.broken).map((L) => `${L.id}: ${L.broken}`);
  check('todos os níveis carregam', !broken.length, broken.join(' | '));
  check('identificadores únicos', new Set(LEVELS.map((L) => L.id)).size === LEVELS.length);
  const noText = LEVELS.filter((L) => !L.broken && !(L.title && L.story && L.help && L.outro)).map((L) => L.id);
  check('todos têm título, história, ajuda e frase final', !noText.length, noText.join(', '));
  const noActs = LEVELS.filter((L) => !Array.isArray(L.acts) || !L.acts.length || L.acts.some((a) => typeof a.act !== 'function')).map((L) => L.id);
  check('todos têm atos válidos', !noActs.length, noActs.join(', '));
  check('etiquetas dos níveis', levelLabel(0) === 'Nível 1' && levelLabel(25) === 'Nível 26');
  const long = LEVELS.filter((L) => (L.story || '').length > 340 || (L.help || '').length > 330).map((L) => L.id);
  check('histórias e ajudas cabem no ecrã (tamanho)', !long.length, long.join(', '));
  const issues = [];
  for (const L of LEVELS) for (const s of collectStrings(L, []).filter(isText)) for (const p of textProblems(s)) issues.push(`${L.id}: ${p} ⟶ ${s.slice(0, 60)}`);
  check('textos dos níveis: sem marcadores por substituir nem PT-BR', !issues.length, issues.slice(0, 8).join(' | '));
}

// ---------- O jogo completo ----------
async function playLevel(i) {
  const L = LEVELS[i], tag = `${i + 1} ${L.id}`;
  window.__errors = [];
  game.startLevel(i);
  if (!(game.ui.current === 'story' && $('#story-title').textContent === L.title)) { check(`${tag}: ecrã da história`, false, game.ui.current); return false; }
  game.ui.act('start');
  const s = game.scene;
  let n = 0, paused = false, lastAct = -1, actStart = 0, slow = [];
  const max = Math.round(900 / STEP);
  while (s.state !== 'done' && n < max) {
    frames(30);
    n += 30;
    if (s.i !== lastAct) { if (lastAct >= 0 && (n - actStart) * STEP > 150) slow.push(`ato ${lastAct}: ${Math.round((n - actStart) * STEP)} s`); lastAct = s.i; actStart = n; }
    if (!paused && s.state === 'play' && n > 240) {
      // pausa a meio: o jogo para, o menu de pausa aparece, e retoma-se sem perder nada
      paused = true;
      const before = s.got;
      s.togglePause();
      const okPause = s.paused && game.ui.current === 'pause';
      frames(30);
      s.togglePause();
      if (!okPause || s.paused || game.ui.current !== null || s.got !== before) { check(`${tag}: pausa e retoma`, false); return false; }
    }
    if (n % 1800 === 0) await tick();
  }
  const errs = [...(window.__errors || [])];
  const done = s.state === 'done', rec = game.save.data.done[L.id];
  check(`${tag}: joga-se até ao fim sem erros`, done && !errs.length, done ? errs.join(' | ') : `preso no ato ${s.i} (${s.act && s.act.constructor.name}) ao fim de ${Math.round(n * STEP)} s; ${errs.join(' | ')}`);
  if (!done) return false;
  check(`${tag}: corações do robô`, s.total >= 3 && s.got >= Math.ceil(s.total * 0.6) && s.got <= s.total, `${s.got}/${s.total}`);
  results[results.length - 1].info = `${s.got}/${s.total}`;
  check(`${tag}: nível concluído e gravado`, game.ui.current === 'complete' && rec && rec.hearts === s.got && rec.total === s.total && $('#complete-hearts').textContent === `${s.got}/${s.total}`);
  check(`${tag}: duração razoável (${Math.round(n * STEP)} s)`, n * STEP >= 12 && n * STEP <= 420 && !slow.length, slow.join(', ') || `${Math.round(n * STEP)} s`);
  return true;
}

async function testGame() {
  localStorage.removeItem(SAVE_KEY);
  game.save.load();
  for (let i = 0; i < LEVELS.length; i++) {
    if (LEVELS[i].broken) { check(`${i + 1} ${LEVELS[i].id}: carrega`, false, LEVELS[i].broken); continue; }
    if (!(await playLevel(i))) continue;
    game.ui.act('next');
    if (i < LEVELS.length - 1) check(`${i + 1}: «Seguinte» abre o nível ${i + 2}`, game.scene.index === i + 1 && game.ui.current === 'story');
    else {
      check('depois do último nível: os parabéns', game.scene.constructor.name === 'VictoryScene' && game.ui.current === 'victory' && /Inês/.test($('#v-title').textContent));
      frames(120, false);
      check('final: sem erros a desenhar', true);
    }
    await tick();
  }
  const total = LEVELS.reduce((n, L) => n + ((game.save.data.done[L.id] || {}).total || 0), 0);
  check('corações no jogo todo', total >= 200, total);
  results[results.length - 1].info = String(total);
}

// O Lourenço está na Austrália nos níveis 9 a 14: só pode aparecer nos telefonemas (ato Call).
// Joga-se cada um desses níveis sem os telefonemas e vê-se que personagens foram pedidas.
async function testAway() {
  const bad = [];
  for (let i = 8; i <= 13; i++) {
    const L = LEVELS[i];
    if (!L || L.broken) continue;
    const acts = L.acts;
    L.acts = acts.filter((a) => a.act.name !== 'Call');
    seen.clear();
    game.startLevel(i);
    game.ui.act('start');
    for (let n = 0; n < 60 * 600 && game.scene.state !== 'done'; n += 60) frames(60);
    if (seen.has('lourenco')) bad.push(L.id);
    L.acts = acts;
    await tick();
  }
  check('níveis 9 a 14: o Lourenço só aparece ao telefone', !bad.length, bad.join(', '));
  check('níveis 10 a 14 acabam com um telefonema da Austrália', [9, 10, 11, 12, 13].every((i) => LEVELS[i] && (LEVELS[i].acts || []).some((a) => a.act.name === 'Call')));
}

// ---------- Textos mostrados durante o jogo ----------
function testShown() {
  const issues = [];
  for (const s of shown) for (const p of textProblems(s)) issues.push(`${shownBy.get(s)}: ${p} ⟶ ${s.slice(0, 60)}`);
  check(`instruções e falas mostradas (${shown.size}): sem marcadores por substituir nem PT-BR`, !issues.length, issues.slice(0, 8).join(' | '));
  const long = [...shown].filter((s) => s.length > 190).map((s) => `${shownBy.get(s)} (${s.length}): ${s.slice(0, 40)}`);
  check('instruções e falas curtas (até 190 carateres)', !long.length, long.slice(0, 6).join(' | '));
  check('a caixa de instruções nunca sai do ecrã nem tapa mais de um terço do jogo', !hintIssues.length, hintIssues.slice(0, 5).join(' | '));
}

// ---------- Menus, gravação, modo tátil / teclado ----------
function testFlow() {
  game.goMenu();
  check('menu: botões principais', ['#btn-play', '#btn-music', '#btn-sound', '#btn-music-pause', '#btn-sound-pause', '#btn-install', '#btn-fullscreen', '#hint', '#hud-hearts'].every((s) => $(s)));
  const unknown = [...document.querySelectorAll('[data-action]')].map((b) => b.dataset.action).filter((a) => !['play', 'levels', 'howto', 'back', 'level', 'sound', 'music', 'fullscreen', 'install', 'start', 'pause', 'resume', 'restart', 'retry', 'next', 'menu'].includes(a));
  check('todos os botões têm uma ação conhecida', !unknown.length, unknown.join(', '));
  game.ui.act('levels');
  const btns = [...document.querySelectorAll('#level-list .level-btn')];
  check('lista de níveis: 26 botões com título', btns.length === 26 && btns[0].textContent.includes(LEVELS[0].title));
  // sem progresso e fora do modo de testes, só o primeiro nível está aberto
  const keep = game.debug, saved = JSON.stringify(game.save.data);
  game.debug = false;
  game.save.data.done = {};
  check('progresso: só o nível 1 aberto ao início', game.isUnlocked(0) && !game.isUnlocked(1) && game.nextLevel() === 0);
  game.save.complete(LEVELS[0].id, 2, 5);
  game.save.complete(LEVELS[0].id, 1, 5);
  check('progresso: guarda o melhor resultado e abre o nível seguinte', game.save.data.done[LEVELS[0].id].hearts === 2 && game.isUnlocked(1) && !game.isUnlocked(2) && game.nextLevel() === 1);
  game.save.load();
  check('progresso: fica gravado no dispositivo', game.save.isDone(LEVELS[0].id));
  game.save.data = JSON.parse(saved);
  game.save.write();
  game.debug = keep;
  // recomeçar a meio de um nível volta ao princípio
  game.startLevel(9);
  game.ui.act('start');
  frames(600);
  game.scene.togglePause();
  game.ui.act('restart');
  check('recomeçar: volta ao primeiro ato, com zero corações', game.scene.i === 0 && game.scene.got === 0 && !game.scene.paused && game.ui.current === null);
  // «Toca para...» passa a «Carrega em Espaço para...» quando se joga com teclado
  const touch = I.touch;
  I.setTouch(false);
  game.ui.setHint('Toca para continuar.');
  const kb = $('#hint').textContent;
  I.setTouch(true);
  game.ui.setHint('Toca para continuar.');
  const tc = $('#hint').textContent;
  I.setTouch(touch);
  check('instruções adaptadas ao teclado e ao toque', kb === 'Carrega em Espaço para continuar.' && tc === 'Toca para continuar.');
  document.body.classList.add('in-level');
  const top = $('#hint').getBoundingClientRect().top, low = Math.max(...[...document.querySelectorAll('.hud > *')].map((el) => el.getBoundingClientRect().bottom));
  document.body.classList.remove('in-level');
  check('instruções: abaixo dos corações e do botão de pausa', top >= low, `${top} / ${low}`);
  game.goMenu();
}

// ---------- Código-fonte e ficheiros para jogar sem rede ----------
async function testSources() {
  const files = performance.getEntriesByType('resource').map((r) => new URL(r.name)).filter((u) => u.origin === location.origin && /\.js$/.test(u.pathname) && !/\/tests\//.test(u.pathname)).map((u) => u.pathname.replace(/^.*?\/js\//, 'js/'));
  const uniq = [...new Set(files)].filter((f) => f.startsWith('js/'));
  const sw = await (await fetch('sw.js')).text();
  const missing = uniq.filter((f) => !sw.includes(`'${f}'`));
  check(`sem rede: os ${uniq.length} módulos do jogo estão na lista do sw.js`, uniq.length > 40 && !missing.length, missing.join(', '));
  const bad = [];
  for (const f of uniq) {
    const src = await (await fetch(f)).text();
    if (/[\u0000-\u0008�]/.test(src)) bad.push(f + ': carateres estragados');
    if (/console\.log|debugger/.test(src)) bad.push(f + ': console.log');
    if (/fillText|\.font\s*=/.test(src)) bad.push(f + ': texto fora das letras de píxeis');
  }
  check('código: sem restos de depuração nem carateres estragados', !bad.length, bad.slice(0, 8).join(' | '));
}

// ---------- Toques e teclas ao acaso ----------
async function testMonkey(seed) {
  let x = seed || 1;
  const rnd = () => { x = (x * 1103515245 + 12345) & 0x7fffffff; return x / 0x7fffffff; };
  const fails = [];
  for (let i = 0; i < LEVELS.length; i++) {
    if (LEVELS[i].broken) continue;
    window.__errors = [];
    game.startLevel(i);
    game.ui.act('start');
    let held = {}, px = -1, py = -1;
    for (let n = 0; n < 60 * 25 && game.scene.state !== 'done'; n += 30) {
      if (rnd() < 0.5) held = { left: rnd() < 0.3, right: rnd() < 0.3, up: rnd() < 0.2, down: rnd() < 0.2, action: rnd() < 0.4 };
      if (rnd() < 0.5) { px = rnd() < 0.2 ? -1 : rnd(); py = rnd(); }
      frames(30, (s, k) => {
        Object.assign(I, held);
        I.pointerX = held.action ? px : -1; I.pointerY = held.action ? py : -1;
        if (k % 7 === 0 && rnd() < 0.6) { I.actionPressed = true; I.action = true; if (px >= 0) { I.pointerX = px; I.pointerY = py; } }
      });
      if (rnd() < 0.04) { game.scene.togglePause(); frames(10, false); if (game.scene.paused) game.scene.togglePause(); }
    }
    if ((window.__errors || []).length) fails.push(`${LEVELS[i].id}: ${window.__errors[0]}`);
    if (i % 5 === 4) await tick();
  }
  check(`toques e teclas ao acaso em todos os níveis (semente ${seed})`, !fails.length, fails.slice(0, 6).join(' | '));
  game.goMenu();
}

export async function run(g) {
  game = g;
  I = g.input;
  const q = new URLSearchParams(location.search), only = q.get('only'), seed = Number(q.get('seed')) || 40;
  I.setTouch(q.has('touch'));
  const errors = [];
  window.addEventListener('error', (e) => errors.push(e.message));
  window.addEventListener('unhandledrejection', (e) => errors.push(String(e.reason)));
  // regista tudo o que a caixa de instruções mostra, e se cabe no ecrã
  const setHint = game.ui.setHint.bind(game.ui);
  game.ui.setHint = (text) => {
    setHint(text);
    const s = $('#hint').textContent, id = game.scene && game.scene.level ? game.scene.level.id : '?';
    if (!s) return;
    if (!shown.has(s)) { shown.add(s); shownBy.set(s, id); }
    if (document.body.classList.contains('in-level') && !document.body.classList.contains('caption')) {
      const r = $('#hint').getBoundingClientRect(), c = document.getElementById('game').getBoundingClientRect();
      if (r.width && (r.left < -0.5 || r.right > innerWidth + 0.5 || r.bottom > c.top + c.height * 0.36)) hintIssues.push(`${id}: ${s.slice(0, 40)} (${Math.round(r.bottom - c.top)} px de ${Math.round(c.height)})`);
    }
  };
  window.__qa = { results, bad: [], errors, done: false };
  log(`QA — ${innerWidth}x${innerHeight}, ${I.touch ? 'tátil' : 'teclado'}, vista ${game.view.w}x${game.view.h}`);
  try {
    if (!only || only === 'dados') testData();
    if (!only || only === 'jogo') await testGame();
    if (!only || only === 'jogo' || only === 'textos') testShown();
    if (!only || only === 'ausente') await testAway();
    if (!only || only === 'fluxo') testFlow();
    if (!only || only === 'fontes' || only === 'offline') await testSources();
    if (!only || only === 'monkey') await testMonkey(seed);
  } catch (err) {
    check('a suite correu até ao fim', false, err && err.stack ? err.stack.split('\n').slice(0, 3).join(' ') : err);
  }
  check('sem erros na consola', !errors.length, errors.slice(0, 4).join(' | '));
  game.ui.setHint = setHint;
  localStorage.removeItem(SAVE_KEY);
  game.save.load();
  game.goMenu();
  const bad = results.filter((r) => !r.ok);
  window.__qa.bad = bad.map((r) => r.name + (r.info ? ' — ' + r.info : ''));
  window.__qa.done = true;
  log(`\n${results.length - bad.length}/${results.length} verificações passaram.` + (bad.length ? '\nFALHAS:\n' + window.__qa.bad.join('\n') : ''));
}
