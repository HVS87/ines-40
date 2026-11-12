// Ferramentas de desenvolvimento (carregadas com ?dev no endereço): permitem conduzir o jogo
// pela consola, sem depender do relógio do browser.
//   await __dev.play('garage')            joga o nível inteiro com o robô e devolve o resultado
//   __dev.goto('garage', 1)               abre o nível diretamente no ato 1 (o segundo)
//   __dev.step(3)                         avança 3 segundos com o robô a jogar (false: sem robô)
//   __dev.info()                          estado atual (nível, ato, corações, instrução, erros)
//   await __dev.shot('nome')              guarda o canvas em tests/shots/nome.png (precisa de
//                                         `node tests/shots.mjs` a correr); a instrução atual
//                                         fica escrita por baixo da imagem
import { LEVELS } from '../js/levels/index.js';

const STEP = 1 / 60;
let game = null;

function clearInput() {
  const I = game.input;
  I.left = I.right = I.up = I.down = I.action = false;
  I.actionPressed = false;
  I.pointerX = I.pointerY = -1;
}

function frames(n, bot = true) {
  for (let k = 0; k < n; k++) {
    const s = game.scene;
    clearInput();
    if (bot && s.bot) s.bot();
    s.update(STEP);
  }
  clearInput();
  draw();
}

function draw() {
  const ctx = document.getElementById('game').getContext('2d');
  game.scene.draw(ctx, game.view);
}

function info() {
  const s = game.scene;
  return {
    level: s.level ? s.level.id : null, broken: s.level && s.level.broken,
    state: s.state, act: s.i, acts: s.acts ? s.acts.length : 0, actName: s.act ? s.act.constructor.name : '',
    got: s.got, total: s.total, hint: document.getElementById('hint').textContent,
    errors: (window.__errors || []).slice(-5), view: { ...game.view },
  };
}

function open(id) {
  const i = typeof id === 'number' ? id : LEVELS.findIndex((L) => L.id === id);
  if (i < 0) throw new Error('nível desconhecido: ' + id);
  window.__errors = [];
  game.startLevel(i);
  game.ui.act('start');
  return i;
}

export function init(g) {
  game = g;
  window.__dev = {
    // Guarda o canvas (ampliado 2x, com a instrução atual por baixo) em tests/shots/<nome>.png.
    async shot(name) {
      draw();
      const src = document.getElementById('game'), k = 2, c = document.createElement('canvas');
      c.width = src.width * k; c.height = src.height * k + 26;
      const x = c.getContext('2d');
      x.imageSmoothingEnabled = false;
      x.fillStyle = '#000'; x.fillRect(0, 0, c.width, c.height);
      x.drawImage(src, 0, 0, c.width, src.height * k);
      // a faixa tapada pelos corações e pela caixa de instruções (linha tracejada)
      const top = game.scene.top ? game.scene.top(game.view) * k : 0;
      x.fillStyle = '#ff00ff'; for (let i = 0; i < c.width; i += 8) x.fillRect(i, top, 4, 1);
      x.fillStyle = '#fff'; x.font = '11px monospace';
      x.fillText(document.getElementById('hint').textContent.slice(0, Math.floor(c.width / 6.7)), 4, c.height - 9);
      const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
      return (await fetch('http://localhost:8091/' + name + '.png', { method: 'POST', body: blob })).text();
    },
    // Folha de contacto: um fotograma de cada ato dos níveis dados (ao fim de `secs` segundos de
    // jogo com o robô), todos numa só imagem em tests/shots/<nome>.png. cols = fotogramas por linha.
    async sheet(name, ids, secs = 6, cols = 2) {
      const src = document.getElementById('game'), tiles = [];
      for (const id of ids) {
        const n = LEVELS.find((L) => L.id === id).acts.length;
        for (let a = 0; a < n; a++) {
          this.goto(id, a);
          frames(Math.round(secs / STEP), true);
          if (game.scene.i !== a) { this.goto(id, a); frames(Math.round(1.5 / STEP), true); }   // o ato acabou antes: fica o início
          draw();
          const c = document.createElement('canvas');
          c.width = src.width; c.height = src.height + 9;
          const x = c.getContext('2d');
          x.fillStyle = '#000'; x.fillRect(0, 0, c.width, c.height);
          x.drawImage(src, 0, 0);
          const top = game.scene.top(game.view);
          x.fillStyle = '#ff00ff'; for (let i = 0; i < c.width; i += 8) x.fillRect(i, top, 4, 1);
          x.fillStyle = '#fff'; x.font = '8px monospace';
          x.fillText((id + ' ' + a + ': ' + document.getElementById('hint').textContent).slice(0, Math.floor(c.width / 4.6)), 2, c.height - 2);
          tiles.push(c);
        }
      }
      const w = tiles[0].width, h = tiles[0].height, rows = Math.ceil(tiles.length / cols);
      const out = document.createElement('canvas');
      out.width = w * cols; out.height = h * rows;
      const o = out.getContext('2d');
      o.fillStyle = '#222'; o.fillRect(0, 0, out.width, out.height);
      tiles.forEach((t, i) => o.drawImage(t, (i % cols) * w, Math.floor(i / cols) * h));
      const blob = await new Promise((r) => out.toBlob(r, 'image/png'));
      return (await (await fetch('http://localhost:8091/' + name + '.png', { method: 'POST', body: blob })).text()) + ' ' + tiles.length;
    },
    levels: () => LEVELS.map((L, i) => `${i + 1} ${L.id}${L.broken ? ' (ERRO: ' + L.broken + ')' : ''}`),
    info,
    draw,
    step(secs = 1, bot = true) { frames(Math.round(secs / STEP), bot); return info(); },
    goto(id, act = 0) {
      open(id);
      const s = game.scene;
      while (s.i < act && s.state !== 'end') s.nextAct();
      if (s.state === 'fade') s.startAct();
      frames(2, false);
      return info();
    },
    // Joga o nível inteiro com o robô; maxSecs é o tempo de jogo máximo (não o tempo real).
    async play(id, maxSecs = 600) {
      open(id);
      const perAct = [];
      let n = 0, last = -1, t0 = 0;
      const max = Math.round(maxSecs / STEP);
      while (game.scene.state !== 'done' && n < max) {
        frames(60);
        n += 60;
        if (game.scene.i !== last) { if (last >= 0) perAct.push(+((n - t0) * STEP).toFixed(0)); last = game.scene.i; t0 = n; }
        if (n % 1800 === 0) await new Promise((r) => setTimeout(r, 0));
      }
      const r = info();
      r.done = game.scene.state === 'done';
      r.secs = Math.round(n * STEP);
      r.secsPerAct = perAct;
      return r;
    },
  };
}
