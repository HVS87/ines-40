// O final do jogo: fogo de artifício e toda a gente da história a festejar os 40 anos da Inês — a
// família, os amigos e quem foi aparecendo pelo caminho; ao lado dela, o Lourenço, o Tomás, a Jeanne
// no carrinho e o Ginja. Cada toque no ecrã lança mais foguetes.
import { getCharacter } from '../sprites.js';
import { Fireworks, Particles } from '../fx.js';
import { mkR, sky, stars, person, text, PINK, GOLD } from '../draw.js';
import { TODOS } from '../convidados.js';
import { carrinho } from '../acts/festa.js';
import { ginja } from '../acts/casa-comum.js';

export class VictoryScene {
  constructor(game) {
    this.game = game;
    this.music = 'party';
    this.fire = new Fireworks();
    this.fx = new Particles();
    this.ines = getCharacter('ines', 'festa');
    this.lourenco = getCharacter('lourenco', 'festa');
    this.tomas = getCharacter('tomas', 'festa');
    this.crowd = TODOS.map(([who, outfit]) => getCharacter(who, outfit));
    this.t = 0;
  }

  enter() {
    this.game.ui.showVictory();
    this.onTap = (e) => {
      if (e.type === 'keydown' && (e.repeat || (e.code !== 'Space' && e.code !== 'Enter'))) return;
      if (e.target && e.target.closest && e.target.closest('.btn')) return;
      const v = this.game.view;
      for (let k = 0; k < 2; k++) this.fire.launch(v.w, v.h, v.h * 0.1, v.h * 0.45);
    };
    document.addEventListener('pointerdown', this.onTap);
    document.addEventListener('keydown', this.onTap);
  }

  exit() {
    document.removeEventListener('pointerdown', this.onTap);
    document.removeEventListener('keydown', this.onTap);
  }

  update(dt) {
    this.t += dt;
    const v = this.game.view;
    this.fire.update(dt, v.w, v.h, v.h * 0.1, v.h * 0.45, () => this.game.audio.play('boom'));
    this.fx.update(dt);
    if (Math.floor(this.t * 3) !== Math.floor((this.t - dt) * 3)) this.fx.heart(v.w * 0.5 - 20 + Math.random() * 40, v.h * 0.8 - 50, Math.random() < 0.4 ? GOLD : PINK);
  }

  draw(ctx, v) {
    const R = mkR(ctx), t = this.t, gy = Math.round(v.h * (v.portrait ? 0.88 : 0.86));
    sky(ctx, v.w, v.h, gy, ['#0b0a24', '#161440', '#2a2358', '#4a2f78']);
    stars(ctx, v.w, gy * 0.6, t, 5, 50);
    this.fire.draw(ctx);
    R(0, gy, v.w, v.h - gy, '#2a2540'); R(0, gy, v.w, 2, '#4a4468');
    // grinalda de bandeirinhas
    for (let x = 0, i = 0; x < v.w; x += 9, i++) {
      const y = gy - 62 + Math.round(Math.sin((x / v.w) * Math.PI) * 6);
      R(x, y, 9, 1, '#fff6e6'); R(x + 2, y + 1, 5, 3, ['#ff5d8f', '#ffd166', '#7be0b0', '#6fb0f0'][i % 4]); R(x + 3, y + 4, 3, 2, ['#ff5d8f', '#ffd166', '#7be0b0', '#6fb0f0'][i % 4]);
    }
    // toda a gente, em filas (tantas quantas forem precisas), aos saltos. Cada fila enche-se do meio
    // para fora, à esquerda e à direita, e deixa um vão ao centro: largo na da frente (para a Inês e
    // os da casa), estreito nas de trás (para ninguém ficar tapado pela Inês).
    const cx = Math.round(v.w / 2), lado = (v.w - 16) / 2, passo = v.w < 280 ? 13 : 15, VAO_FRENTE = 62, VAO = 22;
    const cabe = (vao) => Math.max(2, Math.floor((lado - vao) / passo) * 2);
    const filas = [this.crowd.slice(0, cabe(VAO_FRENTE))], resto = this.crowd.slice(filas[0].length);
    const por = Math.ceil(resto.length / Math.max(1, Math.ceil(resto.length / cabe(VAO))));
    for (let i = 0; i < resto.length; i += por) filas.push(resto.slice(i, i + por));
    for (let r = filas.length - 1; r >= 0; r--) {           // as de trás primeiro
      const fila = filas[r], vao = r ? VAO : VAO_FRENTE, esp = (lado - vao) / Math.ceil(fila.length / 2);
      fila.forEach((f, k) => {
        const x = Math.round(cx + (k % 2 ? 1 : -1) * (vao + (Math.floor(k / 2) + 0.5) * esp));
        const hop = Math.round(Math.abs(Math.sin(t * 6 + (k + r * 7) * 0.9)) * 3);
        person(ctx, f, x, gy + 1 - r * 14, { face: x < cx ? 1 : -1, hop });
      });
    }
    // os da casa, ao lado da Inês: o Lourenço, o Tomás, a Jeanne no carrinho e o Ginja
    person(ctx, this.lourenco, cx - 27, gy + 3, { face: 1, hop: Math.round(Math.abs(Math.sin(t * 6 + 1)) * 3) });
    person(ctx, this.tomas, cx + 27, gy + 3, { face: -1, hop: Math.round(Math.abs(Math.sin(t * 6 + 2)) * 3) });
    carrinho(R, cx + 46, gy + 5, t);
    ginja(R, cx - 46, gy + 5, 1, t, 1, Math.round(Math.abs(Math.sin(t * 7)) * 2));
    // a Inês ao centro, em grande
    const hop = Math.round(Math.abs(Math.sin(t * 5)) * 4);
    person(ctx, this.ines, cx, gy + 6, { scale: 2, hop });
    text(ctx, '40', v.w / 2, gy - 58 - hop, GOLD, { scale: 2, align: 'center', shadow: '#2b1d2e' });
    this.fx.draw(ctx);
  }
}
