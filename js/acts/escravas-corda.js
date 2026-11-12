// «As Escravas», saltar à corda: a Ana e a Isabel dão à corda, a Inês salta (um toque = um salto)
// quando a corda passa por baixo dos pés. São sempre 12 voltas: cada 3 saltos certos dão um
// coração; se tropeçar, a corda recomeça (e à 3.ª vez abranda).
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, GOLD, PINK, lerp, person, shadow } from '../draw.js';
import { linhas, recreio } from './escravas-cenario.js';

const VOLTAS = 12;
const TAU = Math.PI * 2;

export class EscravasCorda extends Act {
  get max() { return this.cfg.hearts || 4; }

  start() {
    this.ines = getCharacter('inesc', 'farda');
    this.ana = getCharacter('anac', 'farda');
    this.isabel = getCharacter('isabelc', 'farda');
    this.maisa = getCharacter('maisac', 'farda');
    this.soft = getCharacter('softc', 'farda');
    this.phi = Math.PI;      // ângulo da corda: 0 = a rasar o chão, π = lá em cima
    this.n = 0;              // voltas dadas
    this.res = [];           // resultado de cada volta (true = saltou bem)
    this.ok = 0; this.fails = 0;
    this.y = 0; this.vy = 0; // altura do salto
    this.trip = 0;           // tropeçou: pausa antes de a corda recomeçar
    this.wait = 1.2; this.over = 0; this.cheer = 0;
    this.hint('Toca para saltar quando a corda passar por baixo dos pés!');
  }

  period() { return lerp(1.3, 0.9, this.n / (VOLTAS - 1)) + (this.fails >= 3 ? 0.25 : 0); }

  update(dt, I, v) {
    if (this.cheer > 0) this.cheer -= dt;
    if (this.vy || this.y > 0) { this.y += this.vy * dt; this.vy -= 620 * dt; if (this.y <= 0) { this.y = 0; this.vy = 0; } }
    if (this.over) { this.over += dt; if (this.over > 2.4) this.done(); return; }
    if (I.actionPressed && this.y === 0 && this.trip <= 0) { this.vy = 150; this.y = 0.01; this.sfx('jump'); }
    if (this.trip > 0) { this.trip -= dt; if (this.trip <= 0) this.phi = Math.PI * 0.7; return; }
    if (this.wait > 0) { this.wait -= dt; return; }
    this.phi += (TAU / this.period()) * dt;
    if (this.phi < TAU) return;
    // a corda passou pelo chão: a Inês estava no ar?
    this.phi -= TAU; this.n++;
    const good = this.y > 3, fy = linhas(v).fy;
    this.res.push(good);
    if (good) {
      this.ok++; this.cheer = 0.4; this.sfx('plim');
      if (this.ok % Math.max(1, Math.round(VOLTAS / this.max)) === 0) this.heart(1, v.w / 2, fy - 50);
    } else { this.fails++; this.trip = 0.9; this.phi = 0; this.sfx('toc'); }
    if (this.n >= VOLTAS) {
      this.over = 0.01; this.sfx('check');
      this.hint(this.ok >= 10 ? 'Ana: «Boa, Inês! És a campeã da corda!»' : this.ok >= 6 ? 'Ana: «Nada mal! Amanhã batemos o recorde!»' : 'Ana: «Não faz mal! Amanhã saltamos outra vez!»');
    }
  }

  rope(R, x1, x2, hy, front) {
    const c = Math.cos(this.phi), amp = c > 0 ? c * 12 : c * 46;
    for (let i = 0; i <= 48; i++) {
      const u = i / 48, x = lerp(x1, x2, u), y = hy + amp * 4 * u * (1 - u);
      if (front) { R(x, y + 1, 2, 2, INK); R(x, y, 2, 2, '#fff6e6'); } else R(x, y, 2, 2, '#6b4a2e');
    }
  }

  draw(ctx, v, R) {
    const { gy, fy } = linhas(v), t = this.t, cx = Math.round(v.w / 2), top = this.top(v);
    recreio(ctx, v, R, t, { cam: 337 - cx, top, gy, capela: 337, arvores: [337 - cx + v.w * 0.08, 337 + cx - v.w * 0.06] });
    const d = 58, hy = fy - 12, x1 = cx - d + 9, x2 = cx + d - 9;
    const front = Math.sin(this.phi) < 0 || this.trip > 0;    // a descer, a corda passa pela frente
    const arm = Math.round(Math.cos(this.phi) * 2), clap = this.cheer > 0 ? 3 : 0;
    // quem assiste (bate palmas e dá saltinhos quando corre bem)
    for (const [f, x, face] of [[this.maisa, cx - d - 34, 1], [this.soft, cx + d + 34, -1]]) {
      shadow(ctx, x, fy, 12);
      person(ctx, f, x, fy, { face, scale: 2, hop: clap });
    }
    if (!front) this.rope(R, x1, x2, hy, false);
    for (const [f, x, face] of [[this.ana, cx - d, 1], [this.isabel, cx + d, -1]]) {
      shadow(ctx, x, fy, 12);
      person(ctx, f, x, fy, { face, scale: 2 });
      R(x + face * 9 - 1, hy + arm - 1, 3, 3, INK);   // a mão que dá à corda
    }
    const wob = this.trip > 0 ? Math.round(Math.sin(t * 40) * 1.5) : 0;
    shadow(ctx, cx, fy, this.y > 6 ? 8 : 12);
    person(ctx, this.ines, cx + wob, fy, { face: 1, scale: 2, hop: Math.round(this.y), air: this.y > 2 });
    if (front) this.rope(R, x1, x2, hy, true);
    if (this.trip > 0) { R(cx - 3, fy - 44, 7, 9, INK); R(cx - 2, fy - 43, 5, 7, '#fff6e6'); R(cx, fy - 42, 1, 3, '#e0572f'); R(cx, fy - 38, 1, 1, '#e0572f'); }
    // as 12 voltas, em pintas: douradas as que correram bem
    const pw = 8, x0 = cx - Math.round((VOLTAS * pw) / 2), py = top + 5;
    R(x0 - 3, py - 3, VOLTAS * pw + 5, 11, INK); R(x0 - 2, py - 2, VOLTAS * pw + 3, 9, '#3a2f4f');
    for (let i = 0; i < VOLTAS; i++) {
      const c = i < this.res.length ? (this.res[i] ? GOLD : '#8a7f9a') : i === this.res.length && !this.over ? (Math.floor(t * 4) % 2 ? PINK : '#5a4a70') : '#5a4a70';
      R(x0 + i * pw, py, 5, 5, c);
    }
  }

  bot(I) {
    if (this.over || this.wait > 0 || this.trip > 0 || this.y > 0) return;
    const left = (TAU - this.phi) / (TAU / this.period());
    if (left < 0.26 && left > 0.08) I.actionPressed = true;
  }
}
