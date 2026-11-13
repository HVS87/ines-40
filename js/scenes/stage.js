// A cena de todos os níveis: cada nível é uma sequência de «atos» (minijogos e momentos da
// história, em js/acts/), jogados uns a seguir aos outros. Esta cena trata de tudo o que é
// comum: o ecrã da história, a pausa, os corações, as instruções, as legendas entre atos
// («Alguns anos depois...») e o fim do nível. Ver js/acts/base.js para escrever um ato.
import { LEVELS } from '../levels/index.js';
import { Particles } from '../fx.js';
import { mkR, clamp, PINK, GOLD } from '../draw.js';

const FADE_T = 2.4;     // duração de uma legenda entre atos

export class StageScene {
  constructor(game, index) {
    this.game = game;
    this.index = index;
    this.level = LEVELS[index];
    this.t = 0;
    this.paused = false;
    this.errors = [];
    this.setup();
  }

  setup() {
    this.fx = new Particles();
    this.acts = (this.level.acts || []).map((cfg) => new cfg.act(this, cfg));
    this.total = this.acts.reduce((n, a) => n + a.max, 0);
    this.got = 0;
    this.i = -1;
    this.act = null;
    this.state = 'intro';      // intro → (fade → play) por cada ato → end → done
    this.timer = 0;
    this.topPx = null;
  }

  enter() { this.game.ui.showStory(this.index); }

  exit() {
    document.body.classList.remove('caption');
    this.game.ui.setLevelMode(false, false);
  }

  begin() {
    this.paused = false;
    this.game.input.reset();
    this.game.ui.setHud(this.got, this.total, this.level.title);
    this.game.ui.setLevelMode(true, true);
    this.nextAct();
  }

  restart() {
    document.body.classList.remove('caption');
    this.setup();
    this.begin();
  }

  togglePause() {
    if (this.state !== 'play' && this.state !== 'fade') return;
    this.paused = !this.paused;
    this.game.input.reset();
    this.game.ui.setLevelMode(true, !this.paused);
    this.game.ui.show(this.paused ? 'pause' : null);
    document.body.classList.toggle('caption', !this.paused && this.state === 'fade');
    if (!this.paused && this.lastHint) this.game.ui.setHint(this.lastHint);
  }

  autoPause() { if (!this.paused) this.togglePause(); }

  onResize() { this.topPx = null; }

  // ---------- O que os atos usam ----------
  // Instruções / falas, na caixa por baixo dos corações.
  hint(text) {
    this.lastHint = text || '';
    this.game.ui.setHint(this.lastHint);
  }

  // Dá n corações (nunca mais do que o máximo do ato), com um coraçãozinho a subir em (x, y).
  give(act, n = 1, x, y) {
    n = Math.max(0, Math.min(n, act.max - act.got));
    if (!n) return 0;
    act.got += n;
    this.got += n;
    this.game.ui.setHud(this.got, this.total, this.level.title);
    this.game.audio.play('heart');
    const v = this.game.view;
    for (let k = 0; k < n; k++) this.fx.heart((x === undefined ? v.w / 2 : x) + k * 6 - (n - 1) * 3, y === undefined ? v.h / 2 : y, k % 2 ? GOLD : PINK);
    return n;
  }

  // Altura (em píxeis de jogo) tapada, em cima, pelos corações e por duas linhas de instruções:
  // o que interessa deve ficar desenhado abaixo desta linha.
  top(v) {
    if (this.topPx === null) {
      let px = 0;
      try {
        const c = document.getElementById('game').getBoundingClientRect();
        const u = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--u')) || 14;
        const btn = document.querySelector('.hud .btn');
        const hud = btn && btn.offsetParent ? btn.getBoundingClientRect().bottom : c.top + 44 + u;
        px = c.height ? ((hud - c.top + u * 2.8) / c.height) * v.h : 0;
      } catch (err) { px = 0; }
      this.topPx = clamp(Math.ceil(px), 30, Math.round(v.h * 0.4));
    }
    return this.topPx;
  }

  // O ato atual acabou: passa ao seguinte (ou termina o nível).
  next(act) {
    if (act && act !== this.act) return;
    if (this.state === 'play') this.nextAct();
  }

  nextAct() {
    this.i++;
    this.timer = 0;
    document.body.classList.remove('caption');
    if (this.i >= this.acts.length) { this.endLevel(); return; }
    this.act = this.acts[this.i];
    this.act.got = 0;
    this.tune();
    if (this.act.cfg.when) {
      // ecrã a negro com a legenda do tempo que passou
      this.state = 'fade';
      document.body.classList.add('caption');
      this.hint(this.act.cfg.when);
    } else this.startAct();
  }

  // A música do momento: a do ato (se tiver uma própria), senão a do nível. `muffled` abafa-a,
  // como quem a ouve do lado de fora.
  tune() {
    const a = this.act, au = this.game.audio;
    au.setTrack((a && (a.cfg.music || a.music)) || this.level.music || 'play');
    au.muffle(!!(a && a.cfg.muffled));
  }

  startAct() {
    this.state = 'play';
    this.timer = 0;
    document.body.classList.remove('caption');
    this.hint('');
    this.game.input.reset();
    this.safe(() => this.act.start(this.game.view));
  }

  endLevel() {
    this.state = 'end';
    this.timer = 0;
    this.game.ui.setLevelMode(true, false);
    this.game.audio.play('fanfare');
    this.hint(this.level.ending || '');
  }

  finish() {
    this.state = 'done';
    this.game.save.complete(this.level.id, this.got, this.total);
    this.game.ui.setLevelMode(false, false);
    this.game.ui.showComplete(this.index, this.got, this.total);
  }

  // Um erro num ato nunca pode deixar o jogo preso: regista-se e passa-se ao ato seguinte.
  safe(fn) {
    try { fn(); } catch (err) {
      this.errors.push(`${this.level.id} ato ${this.i}: ${err && err.message}`);
      (window.__errors = window.__errors || []).push(this.errors[this.errors.length - 1]);
      console.error(err);
      if (this.state === 'play') this.nextAct();
    }
  }

  // ---------- Lógica ----------
  update(dt) {
    this.t += dt;
    if (this.paused) return;
    this.fx.update(dt);
    this.timer += dt;
    const I = this.game.input, v = this.game.view;
    if (this.state === 'fade') {
      if (this.timer > FADE_T || (this.timer > 0.7 && I.actionPressed)) this.startAct();
    } else if (this.state === 'play') {
      const act = this.act;
      this.safe(() => act.update(dt, I, v));
    } else if (this.state === 'end') {
      if (Math.floor(this.timer * 6) !== Math.floor((this.timer - dt) * 6)) this.fx.heart(v.w * 0.2 + Math.random() * v.w * 0.6, v.h * 0.45 + Math.random() * v.h * 0.25, Math.random() < 0.3 ? GOLD : PINK);
      if (this.timer > (this.level.ending ? 3.6 : 1.4)) this.finish();
    }
  }

  // O robô dos testes automáticos: joga o ato atual (ver `bot` em js/acts/base.js).
  bot() {
    const I = this.game.input, v = this.game.view;
    if (this.state === 'fade') { if (this.timer > 0.8) I.actionPressed = true; } else if (this.state === 'play' && this.act) this.act.bot(I, v);
  }

  // ---------- Desenho ----------
  draw(ctx, v) {
    const R = mkR(ctx);
    if (this.act && this.state !== 'fade') {
      const act = this.act;
      try { act.draw(ctx, v, R); } catch (err) {
        if (!this.drawErr) { this.drawErr = true; this.errors.push(`${this.level.id} ato ${this.i} (desenho): ${err && err.message}`); (window.__errors = window.__errors || []).push(this.errors[this.errors.length - 1]); console.error(err); }
      }
      ctx.globalAlpha = 1;
    } else R(0, 0, v.w, v.h, '#0a0614');
    this.fx.draw(ctx);
    // cada ato abre com um pequeno «fade» a partir do negro
    if (this.state === 'play' && this.timer < 0.35) R(0, 0, v.w, v.h, `rgba(10,6,20,${(1 - this.timer / 0.35).toFixed(2)})`);
  }
}
