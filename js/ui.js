// Interface (menus, HUD e painéis) feita em HTML por cima do canvas.
import { LEVELS, levelLabel } from './levels/index.js';
import { fullscreen, isStandalone } from './device.js';

const $ = (sel) => document.querySelector(sel);
const HEART = '<svg class="ico-heart" aria-hidden="true"><use href="#heart"/></svg>';

export class UI {
  constructor(game) {
    this.game = game;
    this.screens = [...document.querySelectorAll('.screen')];
    this.current = null;
    this.kb = false;   // true quando a última interação foi por teclado

    document.addEventListener('pointerdown', () => { this.kb = false; game.audio.unlock(); }, true);
    // o Safari do iOS só liberta o som no fim de um toque
    document.addEventListener('touchend', () => game.audio.unlock(), true);
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn || btn.disabled) return;
      game.audio.unlock();
      game.audio.play('click');
      this.act(btn.dataset.action, btn);
    });
    document.addEventListener('keydown', (e) => this.onKey(e));

    $('#btn-fullscreen').hidden = !fullscreen.supported || isStandalone();

    this.refreshMenu();
  }

  // Mostra um ecrã pelo nome (ou nenhum, com null).
  show(name) {
    this.current = name;
    this.game.audio.duck(name === 'pause');
    for (const s of this.screens) s.classList.toggle('active', s.dataset.screen === name);
    const scroller = name && this.active().querySelector('.scroll');
    if (scroller) scroller.scrollTop = 0;
    if (name && this.kb) this.focusFirst();
    else if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }

  active() { return this.screens.find((s) => s.classList.contains('active')); }

  buttons() {
    const s = this.active();
    return s ? [...s.querySelectorAll('.btn')].filter((b) => !b.disabled && !b.hidden && b.offsetParent !== null && getComputedStyle(b).visibility !== 'hidden') : [];
  }

  focusFirst() {
    const s = this.active();
    if (!s) return;
    const b = s.querySelector('.btn-primary:not([disabled]):not([hidden])') || this.buttons()[0];
    if (b) b.focus();
  }

  // inLevel: mostra o HUD · playing: a área de jogo responde a toques e teclas
  setLevelMode(inLevel, playing) {
    if (!inLevel) this.setHint('');
    document.body.classList.toggle('in-level', inLevel);
    document.body.classList.toggle('playing', playing);
  }

  setHud(got, total, title) {
    $('#hud-hearts').textContent = got + '/' + total;
    $('#hud-title').textContent = title;
  }

  // Linha de instruções por baixo do HUD (usada pelos minijogos).
  setHint(text) { this.setText('#hint', this.local(text || '')); }

  // Põe o texto e a classe .on quando há texto (o CSS mostra o elemento por essa classe; ver
  // style.css: no Safari, :empty nem sempre é reavaliado quando o texto muda).
  setText(sel, text) {
    const el = $(sel);
    el.textContent = text;
    el.classList.toggle('on', text !== '');
  }

  // A jogar com teclado, «Toca para...» passa a «Carrega em Espaço para...» (e também «Toca quando...»,
  // «Toca só quando...», «Toca a um ritmo...», «Toca muitas vezes...»). Frases como «Toca nos
  // presentes (ou usa as setas...)» já dizem as teclas.
  local(text) {
    if (this.game.input.touch) return text;
    return text
      .replace(/\b([Tt])oca (para|quando|só quando|mesmo quando|a um ritmo)\b/g, (m, t, rest) => (t === 'T' ? 'Carrega' : 'carrega') + ' em Espaço ' + rest)
      .replace(/\b([Tt])oca muitas vezes\b/g, (m, t) => (t === 'T' ? 'Carrega' : 'carrega') + ' muitas vezes em Espaço')
      .replace(/\bToca-lhe!/g, 'Carrega em Espaço!');
  }

  refreshMenu() {
    const d = this.game.save.data;
    const started = LEVELS.some((L) => this.game.save.isDone(L.id));
    $('#btn-play').textContent = started ? 'Continuar' : 'Jogar';
    const sons = 'Sons: ' + (d.muted ? 'Não' : 'Sim'), musica = 'Música: ' + (d.musicMuted ? 'Não' : 'Sim');
    $('#btn-sound').textContent = sons;
    $('#btn-sound-pause').textContent = sons;
    $('#btn-music').textContent = musica;
    $('#btn-music-pause').textContent = musica;
  }

  buildLevels() {
    const box = $('#level-list');
    box.textContent = '';
    LEVELS.forEach((L, i) => {
      const open = this.game.isUnlocked(i);
      const rec = this.game.save.data.done[L.id];
      const b = document.createElement('button');
      b.className = 'btn level-btn' + (open ? '' : ' locked');
      b.disabled = !open;
      b.dataset.action = 'level';
      b.dataset.index = i;
      const num = document.createElement('span');
      num.className = 'lv-num';
      num.textContent = levelLabel(i);
      const name = document.createElement('span');
      name.className = 'lv-name';
      name.textContent = open ? L.title : '???';
      const score = document.createElement('span');
      score.className = 'lv-score';
      if (rec) score.innerHTML = HEART + ' ' + Math.min(rec.hearts, rec.total) + '/' + rec.total;
      b.append(num, name, score);
      box.append(b);
    });
  }

  showStory(index) {
    const L = LEVELS[index];
    $('#story-kicker').textContent = levelLabel(index);
    $('#story-title').textContent = L.title;
    $('#story-text').textContent = L.story || '';
    $('#story-help').textContent = L.help || '';
    $('#story-help').hidden = !L.help;
    this.setLevelMode(false, false);
    this.show('story');
  }

  // Passos para adicionar o jogo ao ecrã principal (quando o browser não tem pedido próprio).
  showInstallHelp(info) {
    $('#install-lead').textContent = info.lead;
    const ol = $('#install-steps');
    ol.textContent = '';
    for (const s of info.steps) {
      const li = document.createElement('li');
      li.textContent = s;
      ol.append(li);
    }
    this.show('install');
  }

  showComplete(index, got, total, text) {
    const L = LEVELS[index];
    $('#complete-title').textContent = text || L.outro || L.title;
    $('#complete-hearts').textContent = got + '/' + total;
    $('#complete-perfect').hidden = !(total > 0 && got === total);
    this.show('complete');
  }

  // O ecrã final: os parabéns, por cima do fogo de artifício.
  showVictory() {
    this.setLevelMode(false, false);
    // Deixa o fogo de artifício brilhar um pouco antes de mostrar os botões.
    const actions = $('.victory-actions');
    actions.classList.remove('ready');
    clearTimeout(this.victoryTimer);
    this.victoryTimer = setTimeout(() => {
      actions.classList.add('ready');
      if (this.kb && this.current === 'victory') this.focusFirst();
    }, 2500);
    this.show('victory');
  }

  act(action, btn) {
    const g = this.game, save = g.save;
    switch (action) {
      case 'play': {
        const i = g.nextLevel();
        if (i < 0) { this.buildLevels(); this.show('levels'); } else g.startLevel(i);
        break;
      }
      case 'levels': this.buildLevels(); this.show('levels'); break;
      case 'howto': this.show('howto'); break;
      case 'back': this.show('menu'); break;
      case 'level': g.startLevel(Number(btn.dataset.index)); break;
      case 'sound':
        save.data.muted = !save.data.muted;
        save.write();
        g.audio.setMuted(save.data.muted);
        g.audio.play('click');
        this.refreshMenu();
        break;
      case 'music':
        save.data.musicMuted = !save.data.musicMuted;
        save.write();
        g.audio.setMusicMuted(save.data.musicMuted);
        this.refreshMenu();
        break;
      case 'fullscreen': fullscreen.toggle(); break;
      case 'install': g.installer.install(); break;
      case 'start': this.show(null); g.scene.begin(); break;
      case 'pause':
      case 'resume': if (g.scene.togglePause) g.scene.togglePause(); break;
      case 'restart':
      case 'retry': this.show(null); g.scene.restart(); break;
      case 'next': g.afterLevel(g.scene.index); break;
      case 'menu': g.goMenu(); break;
    }
  }

  onKey(e) {
    this.kb = true;
    this.game.audio.unlock();
    if (e.code === 'KeyM' && !e.repeat) { this.act('music'); return; }
    if (document.body.classList.contains('playing') || !this.current) return;
    // Enter/Espaço mantidos (vindos do jogo) não podem ir carregando nos botões dos ecrãs seguintes
    if (e.repeat && (e.code === 'Enter' || e.code === 'Space')) { e.preventDefault(); return; }
    const list = this.buttons();
    if (!list.length) return;
    const i = list.indexOf(document.activeElement);
    if (e.code === 'ArrowDown' || e.code === 'ArrowRight') {
      list[(i + 1) % list.length].focus();
      e.preventDefault();
    } else if (e.code === 'ArrowUp' || e.code === 'ArrowLeft') {
      list[(i - 1 + list.length) % list.length].focus();
      e.preventDefault();
    } else if (e.code === 'Enter' && i < 0) {
      this.focusFirst();
      if (document.activeElement && document.activeElement.click) document.activeElement.click();
      e.preventDefault();
    }
  }

  // Tecla Esc: pausa durante o jogo; "voltar" nos menus.
  escape() {
    const scene = this.game.scene;
    if (document.body.classList.contains('playing') || this.current === 'pause') {
      if (scene.togglePause) scene.togglePause();
      return;
    }
    // na animação final, o Esc não salta o "Parabéns" (os botões só aparecem no fim)
    if (this.current === 'victory' && !$('.victory-actions').classList.contains('ready')) return;
    const s = this.active();
    const back = s && s.querySelector('[data-back]');
    if (back && !back.hidden) back.click();
  }
}
