// Suite de QA automática do jogo. Abre o jogo com ?qa no endereço (por exemplo
// http://localhost:8090/?qa) e os testes correm sozinhos, com o resultado num painel e em
// window.__qa ({ results, bad, errors, done }).
//
//   ?qa&only=<nome>   corre só um grupo (dados, jogo, textos, ausente, parado, momentos, rodar, fluxo,
//                     toque, teclado, app, semrede, fontes, musica, monkey)
//   ?qa&report=http://localhost:8092/&tag=nome   no fim, envia o resultado para esse endereço
//                     (só para este computador; é o que usa o tests/matrix.mjs)
//   ?qa&seed=7        semente do teste de toques ao acaso (monkey)
//   ?qa&touch         joga em modo tátil (por omissão, teclado)
//
// O que se testa:
//   1. Dados: os 27 níveis carregam, têm textos e atos, e os corações batem certo.
//   2. O jogo completo: cada nível jogado do princípio ao fim pelos robôs dos atos, com pausa a
//      meio, sem erros, e a seguir os parabéns finais.
//   3. Textos: tudo o que os níveis mostram (histórias, instruções e falas), sem marcadores por
//      substituir, sem palavras de PT-BR, e a caber no ecrã.
//   4. Menus, gravação do progresso, ficheiros para jogar sem rede e toques ao acaso.
//   5. Ecrã tátil (toques, dois dedos, arrastar, gestos do sistema, tamanho dos botões), teclado,
//      instalação como app (Android e iPhone) e dados cruzados (personagens, roupas e sons pedidos).
//   6. Sem tocar em nada: todos os níveis chegam ao fim sozinhos (é aqui que se veem os caminhos
//      de quem falha tudo), a desenhar muito mais fotogramas, e mede-se o custo de cada desenho.
//   7. Momentos: os cartões do Crôcô, a receita do Long Island, os telefonemas (ganhar e perder com
//      cada intruso) e quem aparece na festa e no ecrã final.
//   8. Rodar o ecrã (ou mudar o tamanho da janela) a meio de cada nível, a cópia guardada para
//      jogar sem rede e gravações de progresso estragadas.
// Atenção: os testes apagam o progresso guardado neste browser.
import { LEVELS, levelLabel } from '../js/levels/index.js';
import { SAVE_KEY } from '../js/config.js';
import { seen, missing } from '../js/sprites.js';
import { CONVIDADOS, TODOS, FAMILIA } from '../js/convidados.js';

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
const BR = /(^|[^a-záéíóúâêôãõçA-Z])(voc[êe]|tela|celular|[ôo]nibus|trem|banheiro|geladeira|café da manhã|galera|grama|gol|equipe|contato|registro|usuário|mouse|deletar|acessar|aterrissar|a gente vai|pra|tá bom|cadê|moça|garot[oa]s?|xícara|suco|sorvete|de fato|fato de que|bebê|econômic[oa]s?|gênero|esporte|caminhão|sanduíche|pedágio|est[áa] (fazendo|indo|vindo|dando|ficando|querendo)|estou [a-z]+ndo|est[ãa]o [a-z]+ndo)(?![a-záéíóúâêôãõç])/i;
// grafias anteriores ao Acordo Ortográfico de 1990 (em Portugal já não se usam)
const PRE_AO = /(^|[^a-záéíóúâêôãõç])(ac[çc][ãõ][oe]s?|actua\w*|acto[s]?|óptim\w*|direc[çt]\w*|electr\w*|objec[çt]\w*|adop[çt]\w*|excep[çt]\w*|baptis\w*|baptiz\w*|projec[çt]\w*|colec[çt]\w*|correc[çt]\w*|afect\w*|espectácul\w*|recep[çt]\w*|concep[çt]\w*|percep[çt]\w*|aspecto\w*|respectiv\w*|perspectiv\w*|Egipto|activ\w*|factur\w*|lectiv\w*|selec[çt]\w*)(?![a-záéíóúâêôãõç])/i;
// nada do jogo que serviu de base pode aparecer neste
const ANTIGO = /Lu[ií]sa|S[ée]rgio|luisa-e-sergio/i;
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
  if (PRE_AO.test(s)) out.push('grafia antiga: ' + PRE_AO.exec(s)[2]);
  if (ANTIGO.test(s)) out.push('nome do jogo antigo: ' + ANTIGO.exec(s)[0]);
  if (/\s[,.;:!?»]|«\s|\s»/.test(s.replace(/\.\.\./g, '…').replace(/ : /g, ':'))) out.push('espaço antes de pontuação');
  if ((s.match(/«/g) || []).length !== (s.match(/»/g) || []).length) out.push('aspas «» desencontradas');
  if (/  /.test(s)) out.push('dois espaços');
  if (/[\u0000-\u0008�]|Ã©|Ã£|Ã§/.test(s)) out.push('carateres estragados');
  if (/"/.test(s)) out.push('aspas direitas (usar «»)');
  return out;
}

function testData() {
  check('há 27 níveis', LEVELS.length === 27, LEVELS.length);
  const broken = LEVELS.filter((L) => L.broken).map((L) => `${L.id}: ${L.broken}`);
  check('todos os níveis carregam', !broken.length, broken.join(' | '));
  check('identificadores únicos', new Set(LEVELS.map((L) => L.id)).size === LEVELS.length);
  const noText = LEVELS.filter((L) => !L.broken && !(L.title && L.story && L.help && L.outro)).map((L) => L.id);
  check('todos têm título, história, ajuda e frase final', !noText.length, noText.join(', '));
  const noActs = LEVELS.filter((L) => !Array.isArray(L.acts) || !L.acts.length || L.acts.some((a) => typeof a.act !== 'function')).map((L) => L.id);
  check('todos têm atos válidos', !noActs.length, noActs.join(', '));
  // a música: faixas bem escritas, e todos os níveis e atos pedem faixas que existem
  const tracks = new Set(game.audio.tracks), badTracks = game.audio.checkTracks();
  check(`música: ${tracks.size} faixas bem escritas`, tracks.size >= 30 && !badTracks.length, badTracks.join(' | '));
  const used = new Set(['menu', 'party', 'australia']), noTrack = [];
  for (const L of LEVELS) for (const m of [L.music, ...(L.acts || []).map((a) => a.music)]) { if (!m) continue; used.add(m); if (!tracks.has(m)) noTrack.push(`${L.id}: ${m}`); }
  check('música: todos os níveis e atos pedem faixas que existem', !noTrack.length, noTrack.join(', '));
  const unused = [...tracks].filter((t) => !used.has(t));
  check('música: todas as faixas são usadas', !unused.length, unused.join(', '));
  check('etiquetas dos níveis', levelLabel(0) === 'Nível 1' && levelLabel(26) === 'Nível 27');
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

// O Lourenço está na Austrália nos níveis 8 a 14: só pode aparecer nos telefonemas (ato Call).
// Joga-se cada um desses níveis sem os telefonemas e vê-se que personagens foram pedidas.
async function testAway() {
  const bad = [];
  const de = LEVELS.findIndex((L) => L.id === 'croco'), ate = LEVELS.findIndex((L) => L.id === 'santos');
  for (let i = de; i <= ate; i++) {
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
  check('níveis 8 a 14: o Lourenço só aparece ao telefone', !bad.length, bad.join(', '));
  check('níveis 10 a 14 acabam com um telefonema da Austrália', ['bimby', 'pedras', 'xafarix', 'jantares', 'santos'].every((id) => ((LEVELS.find((L) => L.id === id) || {}).acts || []).some((a) => a.act.name === 'Call')));
}

// ---------- Sem tocar em nada ----------
// Cada nível jogado sem carregar em nada (nem o robô): todos os atos têm de acabar sozinhos, sem
// erros. Como aqui se falha tudo, é o teste dos caminhos de derrota (o telefonema que cai, a
// bebida que o barman acaba...). Desenha-se um fotograma em cada seis — vinte vezes mais do que
// nos outros testes —, para apanhar erros de desenho nos momentos de passagem, e mede-se o tempo
// que cada desenho leva (o ato mais pesado fica registado).
async function testIdle() {
  const presos = [], erros = [], lentos = [], custos = [];
  let pior = 0, piorNome = '', soma = 0, conta = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    const L = LEVELS[i];
    if (L.broken) continue;
    window.__errors = [];
    game.startLevel(i);
    game.ui.act('start');
    const s = game.scene, max = Math.round(1500 / STEP);
    let n = 0, ato = -1, t0 = 0, td = 0, nd = 0;
    const fecha = () => {
      if (ato < 0) return;
      const nome = `${L.id} ato ${ato} (${L.acts[ato] ? L.acts[ato].act.name : '?'})`;
      if ((n - t0) * STEP > 240) lentos.push(`${nome}: ${Math.round((n - t0) * STEP)} s`);
      if (nd > 20) { const m = td / nd; soma += td; conta += nd; custos.push([m, nome]); if (m > pior) { pior = m; piorNome = nome; } }
    };
    while (s.state !== 'done' && n < max) {
      if (s.i !== ato) { fecha(); ato = s.i; t0 = n; td = 0; nd = 0; }
      clearInput();
      s.update(STEP);
      if (n % 6 === 0) { const a = performance.now(); s.draw(ctx2d(), game.view); if (s.state === 'play') { td += performance.now() - a; nd++; } }
      n++;
      if (n % 3600 === 0) await tick();
    }
    fecha();
    if (s.state !== 'done') presos.push(`${L.id}: preso no ato ${s.i} (${s.act && s.act.constructor.name})`);
    if ((window.__errors || []).length) erros.push(`${L.id}: ${window.__errors[0]}`);
    await tick();
  }
  check('sem tocar em nada: todos os níveis chegam ao fim sozinhos', !presos.length, presos.join(' | '));
  check('sem tocar em nada: sem erros (caminhos de quem falha tudo)', !erros.length, erros.slice(0, 6).join(' | '));
  check('sem tocar em nada: nenhum ato demora mais de 4 minutos', !lentos.length, lentos.join(' | '));
  const media = conta ? soma / conta : 0;
  window.__qa.pesados = custos.sort((a, b) => b[0] - a[0]).slice(0, 10).map(([m, nome]) => `${m.toFixed(2)} ms ${nome}`);      // os dez atos mais pesados
  check(`desenho: ${media.toFixed(2)} ms por fotograma em média; o ato mais pesado (${piorNome}) leva ${pior.toFixed(2)} ms`, pior < 12, piorNome);
  game.goMenu();
}

// ---------- Rodar o ecrã a meio do jogo ----------
// Cada nível jogado pelo robô com o ecrã a mudar de posição de dois em dois segundos e meio (ao
// alto ↔ deitado no telemóvel e no tablet; janela larga ↔ quase quadrada no computador). Os atos
// têm de se arrumar outra vez sem erros e o nível tem de chegar ao fim.
async function testRotate() {
  const v = game.view, cv = document.getElementById('game'), real = { w: v.w, h: v.h, k: v.k, portrait: v.portrait };
  const movel = document.body.classList.contains('mobile');
  const outra = !movel ? { w: 300, h: 225, k: real.k, portrait: false } : real.portrait ? { w: 400, h: 180, k: real.k, portrait: false } : { w: 270, h: 600, k: real.k, portrait: true };
  const poe = (o) => { Object.assign(v, o); cv.width = o.w; cv.height = o.h; ctx2d().imageSmoothingEnabled = false; if (game.scene && game.scene.onResize) game.scene.onResize(); };
  const presos = [], erros = [], fracos = [];
  let tem = 0, ha = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    const L = LEVELS[i];
    if (L.broken) continue;
    window.__errors = [];
    poe(real);
    game.startLevel(i);
    game.ui.act('start');
    const s = game.scene, max = Math.round(900 / STEP);
    let n = 0, lado = 0;
    while (s.state !== 'done' && n < max) {
      frames(30);
      n += 30;
      if (n % 150 === 0) { lado ^= 1; poe(lado ? outra : real); s.draw(ctx2d(), v); }
      if (n % 1800 === 0) await tick();
    }
    if (s.state !== 'done') presos.push(`${L.id}: preso no ato ${s.i} (${s.act && s.act.constructor.name})`);
    else { tem += s.got; ha += s.total; if (s.got < s.total * 0.4) fracos.push(`${L.id} ${s.got}/${s.total}`); }
    if ((window.__errors || []).length) erros.push(`${L.id}: ${window.__errors[0]}`);
    await tick();
  }
  poe(real);
  window.dispatchEvent(new Event('resize'));
  const nome = movel ? 'rodar o ecrã' : 'mudar o tamanho da janela';
  check(`${nome} a meio de cada nível (${real.w}x${real.h} ↔ ${outra.w}x${outra.h}): todos chegam ao fim`, !presos.length, presos.join(' | '));
  check(`${nome} a meio de cada nível: sem erros`, !erros.length, erros.slice(0, 6).join(' | '));
  check(`${nome} a meio de cada nível: o robô ainda apanha a maior parte dos corações (${tem}/${ha})`, ha > 0 && tem >= ha * 0.6 && fracos.length <= 2, fracos.join(', '));
  game.goMenu();
}

// ---------- Sem rede: a cópia guardada pelo service worker ----------
async function testOffline() {
  if (!('serviceWorker' in navigator) || !window.caches || !/^https?:$/.test(location.protocol)) return;
  const sw = await (await fetch('sw.js', { cache: 'no-store' })).text();
  const nome = (/const CACHE = '([^']+)'/.exec(sw) || [])[1];
  const lista = [...(sw.split('const CORE = [')[1] || '').split('];')[0].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  let pronto = false;
  for (let i = 0; i < 200 && !pronto; i++) {
    const reg = await navigator.serviceWorker.getRegistration().catch(() => null);
    pronto = !!(reg && reg.active && reg.active.state === 'activated' && !reg.installing) && (await caches.keys()).includes(nome);
    if (!pronto) await new Promise((r) => setTimeout(r, 100));
  }
  const faltam = [];
  if (pronto) {
    const cache = await caches.open(nome);
    for (const f of lista) { const hit = await cache.match(new URL(f, location.href).href, { ignoreSearch: true }); if (!hit || !hit.ok) faltam.push(f); }
  }
  check(`sem rede: os ${lista.length} ficheiros da lista estão mesmo guardados na cópia «${nome}»`, pronto && lista.length > 100 && !faltam.length, pronto ? faltam.slice(0, 8).join(', ') : 'o service worker não ficou ativo a tempo');
  const velhas = (await caches.keys()).filter((k) => k !== nome);
  check('sem rede: não ficam cópias de versões antigas', !velhas.length, velhas.join(', '));
}

// ---------- Momentos que os robôs não mostram ----------
// Coisas que dependem do que o jogador faz (ou não faz) e que jogar o nível de fio a pavio não prova.
async function testMoments() {
  const abre = (id, a) => {
    game.startLevel(LEVELS.findIndex((L) => L.id === id));
    game.ui.act('start');
    const s = game.scene;
    while (s.i < a && s.state !== 'end') s.nextAct();
    if (s.state === 'fade') s.startAct();
    return s.act;
  };
  const toque = (s, k) => { if (k === 0) { I.actionPressed = true; I.action = true; } };
  const ate = (act, fim, bot, max = 60) => { for (let n = 0; n < max * 60 && !fim(act); n += 5) frames(5, bot); return fim(act); };
  window.__errors = [];

  // Crôcô: o logótipo (imperiais) e o cartaz (caracóis) aparecem primeiro; um toque salta-os e,
  // sem tocar, saem sozinhos
  let act = abre('croco', 0);
  frames(60, false);
  const logo = act.state === 'logo';
  frames(1, toque); frames(2, false);
  const saltaLogo = act.state === 'fill';
  act = abre('croco', 0);
  const saiLogo = ate(act, (a) => a.state === 'fill', false, 6);
  act = abre('croco', 1);
  frames(60, false);
  const cartaz = act.state === 'cartaz';
  frames(1, toque); frames(2, false);
  const saltaCartaz = act.state === 'aim';
  act = abre('croco', 1);
  const saiCartaz = ate(act, (a) => a.state === 'aim', false, 6);
  check('Crôcô: o logótipo e o cartaz dos caracóis aparecem primeiro, saltam-se com um toque e saem sozinhos', logo && saltaLogo && saiLogo && cartaz && saltaCartaz && saiCartaz, JSON.stringify({ logo, saltaLogo, saiLogo, cartaz, saltaCartaz, saiCartaz }));

  // Long Island: as medidas nas instruções; no fim, o cartão da receita fica até se tocar
  act = abre('xafarix', 2);
  const medida = /15 ml de vodka/.test($('#hint').textContent);
  const nota = ate(act, (a) => a.state === 'nota', true, 150);
  frames(6 * 60, false);
  const fica = act.state === 'nota' && game.scene.act === act;
  frames(1, toque); frames(3, false);
  const segue = game.scene.act !== act;
  act = abre('xafarix', 2);
  const sozinho = ate(act, (a) => a.state === 'nota', false, 150) && act.good === 0;     // sem tocar, o barman faz tudo
  check('Long Island: medidas nas instruções, e a receita fica no ecrã até se tocar', medida && nota && fica && segue && sozinho, JSON.stringify({ medida, nota, fica, segue, sozinho }));

  // telefonemas: a enxotar, o Lourenço ganha; sem tocar, a chamada cai (com os cinco intrusos)
  const tel = [];
  for (const L of LEVELS) {
    const a = (L.acts || []).findIndex((x) => x.act.name === 'Call');
    if (a < 0) continue;
    const cfg = L.acts[a];
    let c = abre(L.id, a);
    const ganha = ate(c, (x) => x.state === 'end', true, 60) && c.won && $('#hint').textContent === cfg.win;
    frames(5 * 60, true);
    const acaba = game.scene.act !== c || game.scene.state !== 'play';      // (é o último ato: o nível acaba)
    c = abre(L.id, a);
    const perde = ate(c, (x) => x.state === 'end', false, 60) && !c.won && $('#hint').textContent === cfg.lose;
    for (let k = 0; k < 90; k++) { frames(1, false); game.scene.draw(ctx2d(), game.view); }      // o fim de quem perde, fotograma a fotograma
    if (!(ganha && acaba && perde)) tel.push(`${L.id} (${cfg.animal}): ${JSON.stringify({ ganha, acaba, perde })}`);
  }
  check('telefonemas: a enxotar, o Lourenço ganha; sem tocar, a chamada cai (cinco intrusos)', !tel.length, tel.join(' | '));

  // a festa e o ecrã final: quem está nos abraços está à volta do bolo; no fim estão a família e os amigos
  const nomes = (l) => l.map(([w]) => w), festa = LEVELS.find((L) => L.id === 'festa') || { acts: [] };
  const abracos = (festa.acts.find((a) => a.act.name === 'Abracos') || {}).groups || [], bolo = festa.acts.find((a) => a.act.name === 'Bolo') || {};
  const nosAbracos = abracos.flatMap((g) => nomes(g.people)).sort().join(' '), convidados = nomes(CONVIDADOS).sort().join(' ');
  check('dados cruzados: os convidados dos abraços são os mesmos da roda do bolo', nosAbracos === convidados && bolo.crowd === CONVIDADOS && CONVIDADOS.length >= 20, `${nosAbracos} / ${convidados}`);
  const todos = nomes(TODOS), emCasa = ['ines', 'lourenco', 'tomas'];
  const faltam = [...nomes(FAMILIA), ...nomes(CONVIDADOS)].filter((w) => !emCasa.includes(w) && !todos.includes(w));
  const semFamilia = nomes(FAMILIA).filter((w) => convidados.split(' ').includes(w));
  check('dados cruzados: o ecrã final junta a família e os amigos, sem repetir ninguém (a família não vai à festa)', new Set(todos).size === todos.length && !faltam.length && !emCasa.some((w) => todos.includes(w)) && !semFamilia.length, `faltam: ${faltam.join(', ')}; na festa: ${semFamilia.join(', ')}`);
  game.showVictory();
  const fim = game.scene;
  for (let k = 0; k < 240; k++) { if (k % 40 === 0) fim.onTap({ type: 'pointerdown' }); fim.update(STEP); fim.draw(ctx2d(), game.view); }
  check('ecrã final: toda a gente a festejar, com foguetes a cada toque', fim.crowd.length === TODOS.length && fim.lourenco && fim.tomas && game.ui.current === 'victory');
  check('momentos: sem erros', !(window.__errors || []).length, (window.__errors || []).slice(0, 4).join(' | '));
  game.goMenu();
}

// Toca cada faixa «em seco» e mede-a: nenhuma pode ficar muda nem distorcer (pico acima de 1).
async function testMusic() {
  const bad = [], vols = [];
  for (const name of game.audio.tracks) {
    const m = await game.audio.measure(name, 6);
    if (!m) { check('música: medir o volume das faixas (sem OfflineAudioContext neste browser)', true); return; }
    vols.push(`${name} ${m.peak}/${m.rms}`);
    if (m.peak > 0.9 || m.rms < 0.01 || m.rms > 0.2) bad.push(`${name}: pico ${m.peak}, média ${m.rms}`);
  }
  check('música: nenhuma faixa muda nem a distorcer', !bad.length, bad.join(' | '));
  results[results.length - 1].info = results[results.length - 1].info || vols.join(' · ');
  // a música muda de ato para ato: à porta do Garage ouve-se abafada (*), na pista já não
  const tocou = (id) => {
    game.startLevel(LEVELS.findIndex((L) => L.id === id));
    game.ui.act('start');
    const s = game.scene, seq = [];
    for (let k = 0; k < s.acts.length; k++) { seq.push(game.audio.track + (game.audio.muffled ? '*' : '')); s.nextAct(); }
    return seq.join(' ');
  };
  const garage = tocou('garage'), pedido = tocou('pedido'), bimby = tocou('bimby'), festa = tocou('festa');
  check('música: muda de ato para ato (Garage, Pedido, telefonema, festa com DJ)', garage === 'house* house* house noite' && pedido === 'flamenco flamenco romance samba romance' && bimby.endsWith(' australia') && festa === 'party party dj parabens', [garage, pedido, bimby, festa].join(' | '));
  game.goMenu();
  check('música: de volta ao menu, sem som abafado', game.audio.track === 'menu' && !game.audio.muffled, game.audio.track);
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
  check('lista de níveis: 27 botões com título', btns.length === 27 && btns[0].textContent.includes(LEVELS[0].title));
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
  // uma gravação estragada (ou de outro formato) não pode impedir o jogo de abrir nem de voltar a gravar
  const estragos = ['{isto não é JSON', '"texto"', '[]', '7', 'null', JSON.stringify({ done: 'x' }), JSON.stringify({ done: [1, 2] }), JSON.stringify({ done: { [LEVELS[0].id]: { hearts: 'a', total: 3 }, [LEVELS[1].id]: { hearts: 2, total: 5 } }, muted: 'sim' })];
  const maus = estragos.filter((raw, k) => {
    try {
      localStorage.setItem(SAVE_KEY, raw);
      game.save.load();
      const d = game.save.data, limpo = d && d.done && typeof d.done === 'object' && !Array.isArray(d.done);
      if (!limpo || !game.isUnlocked(0)) return true;
      if (k === estragos.length - 1) return !(game.save.isDone(LEVELS[1].id) && !game.save.isDone(LEVELS[0].id));     // fica o que está bom
      game.save.complete(LEVELS[0].id, 1, 3);
      game.save.load();
      return !game.save.isDone(LEVELS[0].id);
    } catch (err) { return true; }
  });
  check('progresso: uma gravação estragada não impede de jogar nem de voltar a gravar', !maus.length, maus.join(' | '));
  game.save.data = JSON.parse(saved);
  game.save.write();
  game.debug = keep;
  // recomeçar a meio de um nível volta ao princípio
  game.startLevel(LEVELS.findIndex((L) => L.id === 'bimby'));
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

// ---------- Dados cruzados: tudo o que os níveis pedem tem de existir ----------
function testCross() {
  const semBoneco = [...missing];
  check('dados cruzados: todas as personagens e roupas pedidas existem no elenco', !semBoneco.length, semBoneco.join(', '));
  const semSom = [...game.audio.unknown];
  check('dados cruzados: todos os sons pedidos existem', !semSom.length, semSom.join(', '));
  game.goMenu();
}

// ---------- Ecrã tátil: toques, gestos e tamanho dos botões ----------
async function testTouch(mobile) {
  const cv = document.getElementById('game'), era = I.touch;
  if (typeof PointerEvent !== 'function') { check('toque: o browser tem eventos de ponteiro', false, 'sem PointerEvent'); return; }
  const PE = (type, id, fx, fy, extra = {}) => {
    const r = cv.getBoundingClientRect();
    const ev = new PointerEvent(type, { pointerId: id, pointerType: 'touch', isPrimary: id === 11, button: 0, buttons: type === 'pointerup' ? 0 : 1, bubbles: true, cancelable: true, clientX: r.left + r.width * fx, clientY: r.top + r.height * fy, ...extra });
    cv.dispatchEvent(ev);
    return ev;
  };
  const perto = (a, b) => Math.abs(a - b) < 0.02;
  const impedido = (alvo, tipo) => { const ev = new Event(tipo, { bubbles: true, cancelable: true }); alvo.dispatchEvent(ev); return ev.defaultPrevented; };
  const toca = (el) => { for (const t of ['pointerdown', 'pointerup']) el.dispatchEvent(new PointerEvent(t, { pointerId: 21, pointerType: 'touch', bubbles: true, cancelable: true })); el.click(); };

  // 1. no menu, tocar no fundo não mexe no jogo
  game.goMenu();
  I.reset();
  PE('pointerdown', 11, 0.5, 0.5);
  const quieto = !I.action && !I.actionPressed;
  PE('pointerup', 11, 0.5, 0.5);
  check('toque: no menu, tocar no fundo não mexe no jogo', quieto);

  // 2. os botões respondem ao toque: menu → níveis → voltar → nível → pausa → continuar
  toca($('[data-action="levels"]'));
  const lista = game.ui.current === 'levels';
  toca($('[data-screen="levels"] [data-action="back"]'));
  const volta = game.ui.current === 'menu';
  toca($('[data-action="levels"]'));
  toca($('#level-list .level-btn'));
  const historia = game.ui.current === 'story' && game.scene.level.id === LEVELS[0].id;
  toca($('[data-action="start"]'));
  const joga = document.body.classList.contains('playing') && game.ui.current === null;
  toca($('[data-action="pause"]'));
  const pausa = game.ui.current === 'pause' && game.scene.paused;
  toca($('[data-action="resume"]'));
  const retoma = game.ui.current === null && !game.scene.paused;
  check('toque: os botões respondem (níveis, voltar, escolher nível, começar, pausa, continuar)', lista && volta && historia && joga && pausa && retoma, JSON.stringify({ lista, volta, historia, joga, pausa, retoma }));

  // 3. tocar, manter, arrastar e largar na área de jogo
  I.setTouch(false);
  I.reset(); I.endFrame();
  window.dispatchEvent(new Event('touchstart'));
  const modo = I.touch;
  I.setTouch(false);
  const d = PE('pointerdown', 11, 0.25, 0.75);
  check('toque: tocar na área de jogo é a ação, na posição certa, e passa a modo tátil', modo && I.action && I.actionPressed && I.touch && perto(I.pointerX, 0.25) && perto(I.pointerY, 0.75) && d.defaultPrevented,
    JSON.stringify({ modo, a: I.action, p: I.actionPressed, t: I.touch, x: I.pointerX, y: I.pointerY, dp: d.defaultPrevented }));
  PE('pointermove', 11, 0.8, 0.3);
  const arrasta = perto(I.pointerX, 0.8) && perto(I.pointerY, 0.3) && I.action;
  I.endFrame();
  check('toque: arrastar segue o dedo e manter premido não repete o toque', arrasta && I.action && !I.actionPressed);
  PE('pointerdown', 12, 0.5, 0.5);
  PE('pointerup', 11, 0.8, 0.3);
  const dois = I.action;
  PE('pointerup', 12, 0.5, 0.5);
  check('toque: com dois dedos, só larga quando saem os dois', dois && !I.action && I.pointerX === -1 && I.pointerY === -1);
  PE('pointerdown', 13, 0.5, 0.5); PE('pointercancel', 13, 0.5, 0.5);
  const cancela = !I.action;
  PE('pointerdown', 14, 0.5, 0.5); window.dispatchEvent(new Event('blur'));
  const sai = !I.action, parou = game.scene.paused && game.ui.current === 'pause';
  PE('pointerup', 14, 0.5, 0.5);
  check('toque: um toque interrompido (chamada, gesto do sistema) larga a ação; sair da página põe o jogo em pausa', cancela && sai && parou, JSON.stringify({ cancela, sai, parou }));
  if (game.scene.paused) game.scene.togglePause();
  PE('pointerdown', 15, 0.5, 0.5); PE('pointermove', 15, 1.4, -0.3);
  const limite = I.pointerX === 1 && I.pointerY === 0;
  PE('pointerup', 15, 1.4, -0.3);
  check('toque: arrastar para fora do ecrã não dá posições impossíveis', limite, `${I.pointerX}, ${I.pointerY}`);
  I.reset(); I.endFrame();
  PE('pointerdown', 16, 0.5, 0.5, { pointerType: 'mouse', button: 2, buttons: 2 });
  const direito = !I.action;
  PE('pointerup', 16, 0.5, 0.5, { pointerType: 'mouse', button: 2 });
  PE('pointerdown', 17, 0.5, 0.5, { pointerType: 'pen' });
  const caneta = I.action;
  PE('pointerup', 17, 0.5, 0.5, { pointerType: 'pen' });
  check('toque: caneta conta como toque; botão direito do rato não', direito && caneta);

  // 4. gestos do sistema: sem zoom, sem menu de contexto, sem arrastar a página
  const gestos = ['dblclick', 'contextmenu', 'gesturestart', 'touchmove'].filter((t) => !impedido(cv, t));
  check('gestos: toque duplo, toque longo, pinça e arrastar não mexem na página', !gestos.length, gestos.join(', '));
  game.goMenu();
  game.ui.act('levels');
  const rol = document.querySelector('[data-screen="levels"] .scroll'), item = rol && rol.querySelector('button');
  check('gestos: a lista de níveis desliza com o dedo', !!item && !impedido(item, 'touchmove') && /auto|scroll/.test(getComputedStyle(rol).overflowY));
  const cb = getComputedStyle(document.body), cc = getComputedStyle(cv);
  check('CSS tátil: sem seleção de texto nem gestos do browser por cima do jogo', [cb.touchAction, cc.touchAction].includes('none') && [cb.userSelect, cb.webkitUserSelect].includes('none'), `${cb.touchAction}/${cc.touchAction}/${cb.userSelect}`);

  // 5. tamanho e posição dos botões em todos os ecrãs
  const pequenos = [], fora = [], minimo = mobile ? 40 : 24;
  const mede = (onde) => {
    for (const b of document.querySelectorAll('button, a[href], [data-action]')) {
      const cs = getComputedStyle(b), r = b.getBoundingClientRect(), ecra = b.closest('.screen');
      if (cs.display === 'none' || cs.visibility === 'hidden' || !r.width || !r.height || b.closest('[hidden]') || (ecra && !ecra.classList.contains('active'))) continue;
      const nome = (b.id || b.dataset.action || b.textContent.trim()).slice(0, 22);
      if (Math.min(r.width, r.height) < minimo) pequenos.push(`${onde}: ${nome} ${Math.round(r.width)}x${Math.round(r.height)}`);
      const rola = !!b.closest('.scroll');
      if (r.left < -1 || r.right > innerWidth + 1 || (!rola && (r.top < -1 || r.bottom > innerHeight + 1))) fora.push(`${onde}: ${nome}`);
    }
  };
  I.setTouch(mobile);
  game.goMenu(); mede('menu');
  game.ui.act('levels'); mede('níveis');
  game.ui.act('back'); game.ui.act('howto'); mede('como jogar');
  game.ui.act('back'); game.ui.showInstallHelp(game.installer.steps()); mede('instalar');
  const passos = game.installer.steps(), ua = navigator.userAgent;
  const sistema = /iPad|iPhone|iPod/.test(ua) ? 'iPhone' : /Android/.test(ua) ? 'Android' : (/Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR/.test(ua)) ? 'Safari' : 'computador';
  check(`instalar: instruções certas para este dispositivo (${sistema})`, passos.lead.includes(sistema) && passos.steps.length >= 2 && [passos.lead, ...passos.steps].every((x) => !textProblems(x).length), passos.lead);
  game.startLevel(LEVELS.findIndex((L) => L.id === 'tomas')); mede('história');
  game.ui.act('start'); mede('nível');
  game.scene.togglePause(); mede('pausa');
  game.scene.togglePause();
  for (let n = 0; n < 60 * 400 && game.ui.current !== 'complete'; n += 60) frames(60);
  if (game.ui.current === 'complete') mede('nível concluído'); else fora.push('não cheguei ao ecrã de nível concluído');
  check(`botões: todos com pelo menos ${minimo} px (para o dedo)`, !pequenos.length, [...new Set(pequenos)].slice(0, 8).join(' | '));
  check('botões: todos dentro do ecrã, em todos os menus', !fora.length, [...new Set(fora)].slice(0, 8).join(' | '));
  I.setTouch(era);
  game.goMenu();
}

// ---------- Teclado ----------
function testKeys() {
  const era = I.touch, tecla = (type, code) => { const ev = new KeyboardEvent(type, { code, key: code, bubbles: true, cancelable: true }); window.dispatchEvent(ev); return ev; };
  game.startLevel(0);
  game.ui.act('start');
  I.reset(); I.endFrame();
  I.setTouch(true);
  const sp = tecla('keydown', 'Space');
  const acao = I.action && I.actionPressed && !I.touch && sp.defaultPrevented;
  tecla('keyup', 'Space');
  tecla('keydown', 'ArrowLeft'); const esq = I.left; tecla('keyup', 'ArrowLeft');
  tecla('keydown', 'ArrowRight'); const dir = I.right; tecla('keyup', 'ArrowRight');
  tecla('keydown', 'ArrowUp'); const cima = I.up; tecla('keyup', 'ArrowUp');
  tecla('keydown', 'ArrowDown'); const baixo = I.down; tecla('keyup', 'ArrowDown');
  check('teclado: Espaço é a ação, as setas mexem e o jogo sai do modo tátil', acao && esq && dir && cima && baixo && !I.left && !I.right && !I.up && !I.down && !I.action, JSON.stringify({ acao, esq, dir, cima, baixo }));
  tecla('keydown', 'KeyP');
  const p = game.scene.paused && game.ui.current === 'pause';
  tecla('keydown', 'Escape');
  const esc = !game.scene.paused && game.ui.current === null;
  const mus = game.audio.musicMuted;
  document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyM', key: 'm', bubbles: true, cancelable: true }));
  const m = game.audio.musicMuted !== mus;
  if (m) game.ui.act('music');
  check('teclado: P pausa, Esc retoma e M liga/desliga a música', p && esc && m, JSON.stringify({ p, esc, m }));
  I.setTouch(era);
  game.scene.togglePause();
  game.goMenu();
}

// ---------- Instalar como app, som e gravação (o que cada browser tem de ter) ----------
async function testApp() {
  const vp = (document.querySelector('meta[name=viewport]') || {}).content || '';
  check('página: viewport de telemóvel (sem zoom, até às margens do ecrã) e língua pt-PT', /width=device-width/.test(vp) && /viewport-fit=cover/.test(vp) && /user-scalable=no/.test(vp) && document.documentElement.lang === 'pt-PT', vp);
  const man = document.querySelector('link[rel=manifest]'), maca = document.querySelector('link[rel="apple-touch-icon"]');
  let ok = false, info = '';
  try {
    const m = await (await fetch(man.href)).json();
    const urls = [maca.href, ...m.icons.map((i) => new URL(i.src, man.href).href)];
    const pngs = await Promise.all(urls.map((u) => fetch(u).then((r) => r.ok)));
    ok = !!m.start_url && /fullscreen|standalone/.test(m.display) && m.orientation === 'any' && m.lang === 'pt-PT' && m.icons.some((i) => /512/.test(i.sizes)) && m.icons.some((i) => /192/.test(i.sizes)) && m.icons.some((i) => i.purpose === 'maskable') && pngs.every(Boolean);
    info = JSON.stringify({ display: m.display, orientation: m.orientation, pngs });
    if (ANTIGO.test(JSON.stringify(m))) { ok = false; info = 'nome do jogo antigo no manifesto'; }
  } catch (err) { info = String(err); }
  check('app: manifesto e ícones para instalar no Android e no iPhone', ok && !!document.querySelector('meta[name="apple-mobile-web-app-capable"]') && !!document.querySelector('meta[name="mobile-web-app-capable"]'), info);
  check('som: o browser tem AudioContext (ou o do Safari antigo)', !!(window.AudioContext || window.webkitAudioContext));
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    let reg = null;
    for (let i = 0; i < 40 && !reg; i++) { reg = await navigator.serviceWorker.getRegistration().catch(() => null); if (!reg) await new Promise((r) => setTimeout(r, 100)); }
    check('sem rede: o service worker fica registado (o jogo abre sem ligação)', !!reg);
  }
  let grava = false;
  try { localStorage.setItem('qa-x', '1'); grava = localStorage.getItem('qa-x') === '1'; localStorage.removeItem('qa-x'); } catch (err) { /* sem gravação */ }
  check('gravação: o browser deixa guardar o progresso', grava);
  // a área de jogo cobre o ecrã (telemóvel/tablet) ou a moldura (computador), sem barras de deslocamento
  const c = document.getElementById('game').getBoundingClientRect(), L = game.layout, v = game.view;
  const cobre = Math.abs(c.left - L.x) < 1 && Math.abs(c.top - L.y) < 1 && c.width >= L.w - 0.5 && c.height >= L.h - 0.5 && c.width < L.w + v.k && c.height < L.h + v.k;
  const semBarras = document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight;
  const medidas = v.portrait ? (v.w >= 200 && v.w <= 340 && v.h >= 300) : (v.h >= 150 && v.h <= 300 && v.w >= 280);
  check(`ecrã: a área de jogo cobre ${Math.round(L.w)}x${Math.round(L.h)} sem barras, em ${v.w}x${v.h} píxeis de jogo`, cobre && semBarras && medidas, JSON.stringify({ cobre, semBarras, medidas, k: v.k }));
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
    if (ANTIGO.test(src)) bad.push(f + ': nome do jogo antigo');
    if (/fillText|\.font\s*=/.test(src)) bad.push(f + ': texto fora das letras de píxeis');
  }
  for (const f of ['index.html', 'css/style.css', 'sw.js', 'manifest.webmanifest']) {
    const src = await (await fetch(f)).text();
    if (ANTIGO.test(src)) bad.push(f + ': nome do jogo antigo');
    if (/[\u0000-\u0008�]/.test(src)) bad.push(f + ': carateres estragados');
  }
  check('código: sem restos de depuração, carateres estragados nem nomes do jogo antigo', !bad.length, bad.slice(0, 8).join(' | '));
  // o que a página mostra (menus e «Como jogar») também passa pela revisão de texto
  const pagina = [...document.querySelectorAll('.screen h1, .screen h2, .screen p, .screen li, .screen button, noscript')].map((el) => el.textContent.trim().replace(/\s+/g, ' ')).filter(Boolean);
  const erros = pagina.flatMap((s) => textProblems(s).map((p) => `${p} ⟶ ${s.slice(0, 50)}`));
  check(`textos dos menus (${pagina.length}): sem PT-BR, grafias antigas nem nomes do jogo antigo`, pagina.length > 20 && !erros.length, erros.slice(0, 6).join(' | '));
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
  // Durante os testes, o jogo não se pausa sozinho se a janela passar para segundo plano
  // (senão os robôs ficavam presos num nível em pausa).
  document.addEventListener('visibilitychange', (e) => e.stopImmediatePropagation(), true);
  window.__qa = { results, bad: [], errors, done: false };
  log(`QA — ${innerWidth}x${innerHeight}, ${I.touch ? 'tátil' : 'teclado'}, vista ${game.view.w}x${game.view.h}`);
  try {
    if (!only || only === 'dados') testData();
    if (!only || only === 'jogo') await testGame();
    if (!only || only === 'jogo' || only === 'textos') testShown();
    if (!only || only === 'ausente') await testAway();
    if (!only || only === 'parado') await testIdle();
    if (!only || only === 'momentos') await testMoments();
    if (!only || only === 'rodar') await testRotate();
    if (!only || only === 'jogo') testCross();
    if (!only || only === 'fluxo') testFlow();
    if (!only || only === 'toque') await testTouch(q.has('touch'));
    if (!only || only === 'teclado') testKeys();
    if (!only || only === 'app') await testApp();
    if (!only || only === 'app' || only === 'semrede') await testOffline();
    if (!only || only === 'fontes' || only === 'offline') await testSources();
    if (!only || only === 'musica') await testMusic();
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
  // relatório para o tests/matrix.mjs (só para este computador)
  const rep = q.get('report');
  if (rep && /^http:\/\/(localhost|127\.0\.0\.1):\d+\//.test(rep)) {
    fetch(rep, { method: 'POST', body: JSON.stringify({ tag: q.get('tag') || '', ua: navigator.userAgent, size: `${innerWidth}x${innerHeight}`, dpr: devicePixelRatio, view: `${game.view.w}x${game.view.h}`, touch: q.has('touch'), total: results.length, bad: window.__qa.bad, errors, medidas: results.filter((r) => /^desenho:/.test(r.name)).map((r) => r.name) }) }).catch(() => {});
  }
  log(`\n${results.length - bad.length}/${results.length} verificações passaram.` + (bad.length ? '\nFALHAS:\n' + window.__qa.bad.join('\n') : ''));
}
