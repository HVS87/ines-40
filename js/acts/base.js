// Um «ato» é um bocado de um nível: um minijogo ou um momento da história. Cada nível
// (js/levels/*.js) é uma lista de atos: { act: Classe, ...configuração }.
//
// Para criar um ato, estende-se Act e escreve-se:
//   get max()            → quantos corações o ato pode dar (0 se for só história)
//   start(v)             → começa (pôr o estado inicial e a primeira instrução com this.hint)
//   update(dt, I, v)     → lógica, 60 vezes por segundo; quando acabar, chamar this.done()
//   draw(ctx, v, R)      → desenha tudo (o fundo incluído); R(x, y, w, h, cor) faz um retângulo
//   bot(I, v)            → o robô dos testes: mexe em I (I.left, I.right, I.up, I.down, I.action,
//                          I.actionPressed, I.pointerX, I.pointerY) para jogar o ato até ao fim
//
// I é o js/input.js: I.actionPressed (tocou no ecrã / Espaço / Enter neste instante), I.action
// (mantido premido), I.left / I.right / I.up / I.down (setas), I.pointerX / I.pointerY (posição
// do dedo, de 0 a 1, ou -1 se não estiver a tocar). v = { w, h, portrait }: tamanho do ecrã em
// píxeis de jogo (deitado ≈ 320–430 x 180–200; ao alto ≈ 250 x 440–600).
import { getCharacter } from '../sprites.js';
import { person, shadow } from '../draw.js';

export class Act {
  constructor(scene, cfg = {}) {
    this.s = scene;
    this.game = scene.game;
    this.cfg = cfg;
    this.got = 0;
  }

  get max() { return this.cfg.hearts || 0; }

  start() {}
  update() {}
  draw() {}
  bot() {}

  // ----- atalhos -----
  hint(text) { this.s.hint(text); }                      // instruções / falas
  heart(n = 1, x, y) { return this.s.give(this, n, x, y); }   // dá corações (com efeito em x, y)
  sfx(name) { this.game.audio.play(name); }              // efeito sonoro (ver SOUNDS em js/audio.js)
  done() { this.s.next(this); }                          // o ato acabou
  top(v) { return this.s.top(v); }                       // linha abaixo da qual o ecrã está livre
  get fx() { return this.s.fx; }                         // partículas (burst, heart)
  get t() { return this.s.t; }                           // relógio da cena, em segundos
}

// Momento da história: um cenário, as personagens e as falas, que avançam com um toque
// (ou sozinhas, ao fim de uns segundos).
//   { act: Talk, bg(ctx, v, R, t, act), cast: [{ who, outfit, x (0–1), face, name, scale, hop }],
//     lines: ['Ana: «Olá!»', ...], hearts: 0, ground: 0.8, onLine(i, act) }
// Quem fala (o nome antes dos dois pontos, igual ao `name` de alguém do elenco) dá uns saltinhos.
export class Talk extends Act {
  constructor(scene, cfg) {
    super(scene, cfg);
    this.people = (cfg.cast || []).map((c) => ({ ...c, frames: getCharacter(c.who, c.outfit) }));
  }

  start() {
    this.i = -1;
    this.timer = 0;
    this.advance();
  }

  advance() {
    this.i++;
    this.timer = 0;
    const lines = this.cfg.lines || [];
    if (this.i >= lines.length) {
      if (this.max) this.heart(this.max);
      this.done();
      return;
    }
    this.hint(lines[this.i]);
    this.speaker = (/^([^:«]{1,24}):/.exec(lines[this.i]) || [])[1] || '';
    if (this.cfg.onLine) this.cfg.onLine(this.i, this);
    this.sfx('click');
  }

  update(dt, I) {
    this.timer += dt;
    const line = (this.cfg.lines || [])[this.i] || '';
    if ((this.timer > 0.45 && I.actionPressed) || this.timer > 3 + line.length * 0.06) this.advance();
  }

  ground(v) { return Math.round(v.h * (this.cfg.ground || (v.portrait ? 0.7 : 0.82))); }

  draw(ctx, v, R) {
    const gy = this.ground(v), t = this.t;
    if (this.cfg.bg) this.cfg.bg(ctx, v, R, t, this);
    else { R(0, 0, v.w, gy, '#2a2358'); R(0, gy, v.w, v.h - gy, '#3f8a4a'); }
    for (const p of this.people) {
      const x = Math.round(p.x * v.w), talking = p.name && p.name === this.speaker;
      const hop = talking ? Math.round(Math.abs(Math.sin(t * 7)) * 2) : 0;
      shadow(ctx, x, gy, (p.scale || 2) * 7);
      person(ctx, p.frames, x, gy - (p.dy || 0), { face: p.face || 1, scale: p.scale || 2, hop });
    }
    if (this.cfg.fg) this.cfg.fg(ctx, v, R, t, this);
    // «toca para continuar»: um triângulo a piscar ao canto
    if (this.timer > 0.6 && Math.floor(t * 2.5) % 2) { R(v.w - 12, v.h - 10, 5, 1, '#fff6e6'); R(v.w - 11, v.h - 9, 3, 1, '#fff6e6'); R(v.w - 10, v.h - 8, 1, 1, '#fff6e6'); }
  }

  bot(I) { if (this.timer > 0.5) I.actionPressed = true; }
}
