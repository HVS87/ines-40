// Entrada unificada: teclado + ecrã tátil (tocar, manter premido e arrastar na área de jogo).
const KEYS = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  Space: 'action', KeyZ: 'action', KeyX: 'action', Enter: 'action',
};

const kb = { left: false, right: false, action: false };
const tc = { action: false };
let opts = {};

export const input = {
  left: false,
  right: false,
  action: false,        // ação dos minijogos (Espaço, Enter, ou tocar/clicar no ecrã) mantida premida
  actionPressed: false, // ação premida neste instante
  pointerX: -1,         // posição horizontal do dedo/rato na área de jogo enquanto toca nela (0 a 1), ou -1
  pointerY: -1,         // idem, na vertical
  up: false,            // setas para cima e para baixo
  down: false,
  touch: false,         // true quando o jogador está a usar o ecrã tátil

  init(options) {
    opts = options || {};
    setTouch(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    bindKeyboard();
    bindTouch();
    const reset = () => this.reset();
    window.addEventListener('blur', reset);
    document.addEventListener('visibilitychange', reset);
  },

  endFrame() { this.actionPressed = false; },

  // Força o modo tátil ou de teclado (usado pela suite de testes).
  setTouch(on) { setTouch(!!on); },

  reset() {
    kb.left = kb.right = kb.action = false;
    tc.action = false;
    this.actionPressed = false;
    this.up = this.down = false;
    sync();
  },
};

function sync() {
  input.left = kb.left;
  input.right = kb.right;
  input.action = kb.action || tc.action;
}

function setTouch(on) {
  if (input.touch === on) return;
  input.touch = on;
  if (opts.onModeChange) opts.onModeChange();
}

function bindKeyboard() {
  window.addEventListener('keydown', (e) => {
    const playing = document.body.classList.contains('playing');
    if (e.code === 'Escape') { if (opts.onEscape) opts.onEscape(); e.preventDefault(); return; }
    if (e.code === 'KeyP') { if (opts.onPause) opts.onPause(); return; }
    // tecla já tratada pelos menus (ex.: Enter que carrega em «Continuar»): não chega ao jogo
    if (e.defaultPrevented) return;
    if (e.code === 'ArrowUp' || e.code === 'KeyW') input.up = true;
    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      input.down = true;
      if (playing) { e.preventDefault(); setTouch(false); }
      return;
    }
    const k = KEYS[e.code];
    if (!k) return;
    if (playing) { e.preventDefault(); setTouch(false); }
    if (playing && !e.repeat && !kb[k] && k === 'action') input.actionPressed = true;
    kb[k] = true;
    sync();
  });
  window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowUp' || e.code === 'KeyW') input.up = false;
    if (e.code === 'ArrowDown' || e.code === 'KeyS') input.down = false;
    const k = KEYS[e.code];
    if (!k) return;
    kb[k] = false;
    sync();
  });
}

function bindTouch() {
  // A meio do jogo passa logo a modo tátil; num menu, só depois do toque acabar (senão a
  // disposição mudava debaixo do dedo e o toque caía noutro sítio).
  window.addEventListener('touchstart', () => {
    if (input.touch) return;
    if (document.body.classList.contains('playing')) setTouch(true);
    else setTimeout(() => setTouch(true), 400);
  }, { passive: true, capture: true });

  // Tocar ou clicar em qualquer ponto do jogo: botão de ação dos minijogos
  const canvas = document.getElementById('game');
  const taps = new Set();
  const tapSync = () => { tc.action = taps.size > 0; if (!tc.action) input.pointerX = input.pointerY = -1; sync(); };
  const tapMove = (e) => {
    if (!taps.has(e.pointerId)) return;
    const r = canvas.getBoundingClientRect();
    input.pointerX = Math.max(0, Math.min(1, (e.clientX - r.left) / Math.max(1, r.width)));
    input.pointerY = Math.max(0, Math.min(1, (e.clientY - r.top) / Math.max(1, r.height)));
  };
  canvas.addEventListener('pointerdown', (e) => {
    if (!document.body.classList.contains('playing')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* sem captura */ }
    taps.add(e.pointerId);
    input.actionPressed = true;
    setTouch(e.pointerType === 'touch' || input.touch);
    tapMove(e);
    tapSync();
  });
  canvas.addEventListener('pointermove', tapMove);
  const tapEnd = (e) => { if (taps.delete(e.pointerId)) tapSync(); };
  canvas.addEventListener('pointerup', tapEnd);
  canvas.addEventListener('pointercancel', tapEnd);
  canvas.addEventListener('lostpointercapture', tapEnd);

  // Quando a janela perde o foco, larga tudo.
  const clear = () => { taps.clear(); tapSync(); };
  window.addEventListener('blur', clear);
  document.addEventListener('visibilitychange', clear);

  // Evita zoom, menus de contexto e "elástico" do iOS (exceto em zonas com scroll).
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('dblclick', (e) => e.preventDefault());
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('touchmove', (e) => {
    if (!e.target.closest || !e.target.closest('.scroll')) e.preventDefault();
  }, { passive: false });
}
