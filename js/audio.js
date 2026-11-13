// Som "chiptune" gerado com WebAudio (sem ficheiros de som): efeitos e música de fundo.
// Os efeitos e a música têm volumes (e botões de silêncio) independentes.
import { TRACKS } from './musicas.js';

let ac = null;
let sfxBus = null, musicBus = null;
let muted = false;        // efeitos sonoros desligados
let musicMuted = false;   // música desligada
let ducked = false;       // música mais baixa (por exemplo, na pausa)

function tone(freq, at, dur, type = 'square', vol = 0.06, slideTo = 0, bus = sfxBus, start = ac.currentTime) {
  const t0 = start + at;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.value = 0;                 // mudo até ao instante da nota (senão ouvia-se um estalido)
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(bus);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// Um apito contínuo (sem o decair dos outros sons), como o do monitor cardíaco em linha reta.
function hold(freq, dur, type = 'square', vol = 0.03, at = 0) {
  const t0 = ac.currentTime + at;
  const osc = ac.createOscillator(), gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.setValueAtTime(vol, t0 + dur - 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(sfxBus);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

const SOUNDS = {
  flatline: () => { hold(1000, 2.4, 'square', 0.028); hold(1000, 2.4, 'sine', 0.03); },
  plim: () => { tone(1568, 0, 0.32, 'triangle', 0.09); tone(2349, 0.03, 0.45, 'sine', 0.06); tone(3136, 0.06, 0.3, 'sine', 0.03); },
  catchWin: () => [784, 988, 1175, 1568, 1175, 1568, 1976, 2349].forEach((f, i) => tone(f, i * 0.09, 0.2, 'square', 0.05)),
  click: () => tone(660, 0, 0.06, 'square', 0.04),
  jump: () => tone(330, 0, 0.14, 'square', 0.05, 660),
  heart: () => { tone(988, 0, 0.08, 'square', 0.05); tone(1319, 0.07, 0.14, 'square', 0.05); },
  stomp: () => tone(220, 0, 0.12, 'triangle', 0.1, 440),
  hurt: () => tone(300, 0, 0.3, 'sawtooth', 0.05, 90),
  check: () => { tone(523, 0, 0.08, 'triangle', 0.08); tone(784, 0.08, 0.12, 'triangle', 0.08); },
  win: () => [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.11, 0.16, 'square', 0.05)),
  boom: () => { tone(160, 0, 0.35, 'triangle', 0.09, 45); tone(900 + Math.random() * 600, 0.02, 0.2, 'square', 0.012, 200); },
  saw: () => [0, 0.09, 0.18, 0.27].forEach((d, i) => tone(i % 2 ? 150 : 190, d, 0.08, 'sawtooth', 0.05)),
  toc: () => { tone(520, 0, 0.07, 'triangle', 0.14, 180); tone(140, 0, 0.1, 'square', 0.05, 70); },
  buzz: () => { tone(110, 0, 0.5, 'sawtooth', 0.08); tone(116, 0, 0.5, 'square', 0.04); },
  inject: () => tone(300, 0, 0.5, 'sine', 0.06, 700),
  pop: () => { tone(500, 0, 0.1, 'square', 0.05, 1200); tone(1319, 0.1, 0.16, 'square', 0.05); },
  slurp: () => tone(520, 0, 0.09, 'sine', 0.07, 300),
  chirp: () => { tone(2300, 0, 0.06, 'sine', 0.04, 3100); tone(2700, 0.09, 0.06, 'sine', 0.04, 3300); tone(2300, 0.18, 0.08, 'sine', 0.04, 3000); },
  ring: () => { tone(1400, 0, 0.09, 'square', 0.05); tone(1750, 0.1, 0.09, 'square', 0.05); },
  kiss: () => { tone(900, 0, 0.08, 'sine', 0.08, 1600); tone(1319, 0.12, 0.3, 'triangle', 0.08); },
  fanfare: () => [392, 523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.16, 0.24, 'square', 0.05)),
};

// ---------- Música ----------
// As faixas estão escritas em js/musicas.js (ver aí o formato). Aqui fica o «motor»: melodia,
// acompanhamento, baixo e percussão, agendados passo a passo.
const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const freqOf = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
function midiOf(name) {
  const m = /^([A-G])([#b]?)(\d)$/.exec(name);
  if (!m) throw new Error('nota desconhecida: ' + name);
  return 12 * (Number(m[3]) + 1) + SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}
// Acorde → notas MIDI da tríade, a partir da oitava 3 ('Am' = lá, dó, mi; 'E7' junta a sétima).
function triad(chord) {
  const m = /^([A-G][#b]?)(m?)(7?)$/.exec(chord);
  if (!m) throw new Error('acorde desconhecido: ' + chord);
  const root = midiOf(m[1] + '3'), out = [root, root + (m[2] ? 3 : 4), root + 7];
  if (m[3]) out.push(root + 10);
  return out;
}

// Ruído filtrado (pratos, tarola, palmas): um pedaço de ruído branco por contexto de áudio.
const noiseBufs = new WeakMap();
function noiseBuf() {
  let buf = noiseBufs.get(ac);
  if (!buf) {
    buf = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.5), ac.sampleRate);
    const d = buf.getChannelData(0);
    let seed = 12345;
    for (let i = 0; i < d.length; i++) { seed = (seed * 16807) % 2147483647; d[i] = (seed / 2147483647) * 2 - 1; }
    noiseBufs.set(ac, buf);
  }
  return buf;
}
function noise(t0, dur, vol, kind, freq, bus) {
  const src = ac.createBufferSource(), flt = ac.createBiquadFilter(), gain = ac.createGain();
  src.buffer = noiseBuf();
  flt.type = kind; flt.frequency.value = freq;
  gain.gain.value = 0;
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(flt); flt.connect(gain); gain.connect(bus);
  src.start(t0, (t0 * 7.3) % 0.2);
  src.stop(t0 + dur + 0.02);
}
// A percussão: cada instrumento recebe (instante, volume, saída).
const hit = (freq, t0, dur, type, vol, slide, bus) => tone(freq, 0, dur, type, vol, slide, bus, t0);
const DRUMS = {
  k: (t, v, o) => hit(150, t, 0.16, 'sine', 0.15 * v, 45, o),                                                            // bombo
  s: (t, v, o) => { noise(t, 0.13, 0.05 * v, 'bandpass', 1900, o); hit(190, t, 0.08, 'triangle', 0.05 * v, 120, o); },   // tarola
  h: (t, v, o) => noise(t, 0.035, 0.022 * v, 'highpass', 7000, o),                                                       // prato fechado
  o: (t, v, o) => noise(t, 0.14, 0.018 * v, 'highpass', 6000, o),                                                        // prato aberto
  c: (t, v, o) => { noise(t, 0.09, 0.04 * v, 'bandpass', 1300, o); noise(t + 0.012, 0.07, 0.028 * v, 'bandpass', 1300, o); },   // palmas
  m: (t, v, o) => noise(t, 0.05, 0.012 * v, 'highpass', 5000, o),                                                        // ganzá
  r: (t, v, o) => hit(1900, t, 0.03, 'square', 0.02 * v, 0, o),                                                          // aro / castanholas
  x: (t, v, o) => { hit(1400, t, 0.05, 'triangle', 0.06 * v, 0, o); hit(2100, t, 0.03, 'triangle', 0.03 * v, 0, o); },   // paus
  u: (t, v, o) => hit(95, t, 0.3, 'sine', 0.16 * v, 60, o),                                                              // surdo
  U: (t, v, o) => hit(120, t, 0.09, 'sine', 0.11 * v, 90, o),                                                            // surdo abafado
  t: (t, v, o) => { noise(t, 0.03, 0.03 * v, 'bandpass', 3800, o); hit(1700, t, 0.03, 'square', 0.01 * v, 0, o); },      // tamborim
  a: (t, v, o) => hit(660, t, 0.09, 'square', 0.016 * v, 0, o),                                                          // agogô grave
  A: (t, v, o) => hit(880, t, 0.09, 'square', 0.016 * v, 0, o),                                                          // agogô agudo
  b: (t, v, o) => hit(110, t, 0.22, 'triangle', 0.13 * v, 55, o),                                                        // bombo de festa
  g: (t, v, o) => { hit(3300, t, 0.09, 'sine', 0.028 * v, 0, o); hit(4950, t, 0.06, 'sine', 0.012 * v, 0, o); },         // ferrinhos
};

const pattern = (p) => String(p || '').replace(/\s+/g, '');
const num = (v, d) => (v === undefined ? d : v);
// Prepara uma faixa: a melodia passa a uma lista de passos com { f, len } (ou null).
const prepared = {};
function prepare(name) {
  if (prepared[name]) return prepared[name];
  const tr = TRACKS[name], tokens = tr.melody.join(' ').trim().split(/\s+/);
  const lead = tokens.map((tok, i) => {
    if (tok === '-' || tok === '.') return null;
    let len = 1;
    while (tokens[i + len] === '-') len++;
    return { f: freqOf(midiOf(tok)), len };
  });
  const div = tr.div || 2, g = tr.gain || 1;
  prepared[name] = {
    name, per: tr.per || 8, step: 60 / tr.bpm / div, swing: tr.swing || 0, steps: tokens.length, lead,
    gain: g, wave: tr.lead || 'square', leadVol: num(tr.leadVol, 0.03) * g, leadLen: tr.leadLen || 0.95,
    arp: tr.arp || 'square', arpVol: num(tr.arpVol, 0.011) * g, comp: pattern(tr.comp === undefined ? '0121' : tr.comp), compLen: tr.compLen || 0.8,
    bass: pattern(tr.bass === undefined ? 'r.f.' : tr.bass), bassWave: tr.bassWave || 'triangle', bassVol: num(tr.bassVol, 0.065) * g, bassLen: tr.bassLen || 1.7,
    drums: Object.entries(tr.drums || {}).map(([k, p]) => ({ play: DRUMS[k], p: pattern(p) })).filter((d) => d.play && d.p),
    chords: tr.chords.map(triad),
  };
  return prepared[name];
}

// Toca o passo `s` de uma faixa no instante t0, para a saída `out`.
function playStep(tr, s, t0, out) {
  const d = tr.step, ch = tr.chords[Math.floor(s / tr.per) % tr.chords.length];
  if (tr.swing && s % 2) t0 += tr.swing * d;
  const n = tr.lead[s];
  if (n) tone(n.f, 0, d * n.len * tr.leadLen, tr.wave, tr.leadVol, 0, out, t0);
  // acompanhamento: notas soltas do acorde (arpejo) ou o acorde inteiro
  const c = tr.comp ? tr.comp[s % tr.comp.length] : '.';
  if (c === 'x' || c === 'X') for (const m of ch) tone(freqOf(m + 12), 0, d * tr.compLen, tr.arp, tr.arpVol * (c === 'X' ? 1.3 : 0.8), 0, out, t0);
  else if (c >= '0' && c <= '3') tone(freqOf(c === '3' ? ch[0] + 24 : ch[Number(c)] + 12), 0, d * tr.compLen, tr.arp, tr.arpVol, 0, out, t0);
  // baixo
  const b = tr.bass ? tr.bass[s % tr.bass.length] : '.';
  const low = b === 'r' ? ch[0] - 12 : b === 'f' ? ch[2] - 12 : b === 't' ? ch[1] - 12 : b === 'R' ? ch[0] : b === 'F' ? ch[2] - 24 : null;
  if (low !== null) tone(freqOf(low), 0, d * tr.bassLen, tr.bassWave, tr.bassVol, 0, out, t0);
  // percussão
  for (const dr of tr.drums) {
    const k = dr.p[s % dr.p.length];
    if (k === 'x') dr.play(t0, tr.gain, out); else if (k === 'X') dr.play(t0, 1.4 * tr.gain, out); else if (k === 'o') dr.play(t0, 0.5 * tr.gain, out);
  }
}

// Verifica como estão escritas as faixas (para os testes): devolve a lista de problemas.
function checkTracks() {
  const bad = [];
  for (const [name, tr] of Object.entries(TRACKS)) {
    try {
      const p = prepare(name), bars = p.steps / p.per;
      if (!Number.isInteger(bars)) bad.push(`${name}: a melodia tem ${p.steps} passos (compassos de ${p.per})`);
      else if (bars % p.chords.length) bad.push(`${name}: ${bars} compassos para ${p.chords.length} acordes`);
      tr.melody.forEach((m, i) => { if (m.trim().split(/\s+/).length !== p.per) bad.push(`${name}: compasso ${i + 1} com ${m.trim().split(/\s+/).length} passos`); });
      for (const [k, q] of [['comp', p.comp], ['bass', p.bass], ...Object.entries(tr.drums || {}).map(([d, v]) => ['drums.' + d, pattern(v)])]) {
        if (q && q.length % p.per && p.per % q.length) bad.push(`${name}: desenho ${k} com ${q.length} passos`);
      }
      for (const k of Object.keys(tr.drums || {})) if (!DRUMS[k]) bad.push(`${name}: percussão desconhecida «${k}»`);
      if (/[^.0-3xX]/.test(p.comp)) bad.push(`${name}: desenho comp inválido`);
      if (/[^.rftRF]/.test(p.bass)) bad.push(`${name}: desenho bass inválido`);
    } catch (err) { bad.push(`${name}: ${err.message}`); }
  }
  return bad;
}

const music = { want: null, track: null, step: 0, next: 0, timer: 0 };
let musicFilter = null, muffled = false;      // filtro que «abafa» a música (ouvida do lado de fora)

function musicLevel() { return musicMuted ? 0 : ducked ? 0.35 : 1; }
function applyMusicLevel() {
  if (!musicBus) return;
  const t = ac.currentTime;
  musicBus.gain.cancelScheduledValues(t);
  musicBus.gain.setTargetAtTime(musicLevel(), t, 0.15);
}
function applyMuffle() {
  if (musicFilter) musicFilter.frequency.setTargetAtTime(muffled ? 260 : 20000, ac.currentTime, 0.12);
}

// Agenda os passos que vão tocar nos próximos instantes (técnica do "lookahead").
function schedule() {
  if (!ac || ac.state !== 'running' || !music.track) return;
  const tr = music.track;
  if (music.next < ac.currentTime) music.next = ac.currentTime + 0.05;
  while (music.next < ac.currentTime + 0.25) {
    playStep(tr, music.step % tr.steps, music.next, musicBus);
    music.step++;
    music.next += tr.step;
  }
}

function startMusic() {
  if (!ac || ac.state !== 'running' || document.hidden || musicMuted || !music.want) return;
  if (!music.track || music.track.name !== music.want) {
    music.track = prepare(music.want);
    music.step = 0;
    music.next = ac.currentTime + 0.12;
  }
  if (!music.timer) music.timer = setInterval(schedule, 50);
  schedule();
}

function stopMusic(forget) {
  if (music.timer) clearInterval(music.timer);
  music.timer = 0;
  if (forget) music.track = null;
}

export const audio = {
  get muted() { return muted; },
  setMuted(m) { muted = !!m; },

  get musicMuted() { return musicMuted; },
  setMusicMuted(m) {
    musicMuted = !!m;
    if (!ac) return;
    applyMusicLevel();
    if (musicMuted) stopMusic(true); else startMusic();
  },

  // Os nomes das faixas e a verificação de como estão escritas (para os testes).
  get tracks() { return Object.keys(TRACKS); },
  get track() { return music.want; },          // a faixa pedida neste momento
  get muffled() { return muffled; },
  checkTracks,

  // Toca uma faixa «em seco» durante `secs` segundos (sem som) e mede-a: { peak, rms }.
  // Serve para os testes verem que nenhuma faixa fica muda nem distorce.
  async measure(name, secs = 6) {
    const OC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!OC || !TRACKS[name]) return null;
    const live = ac, off = new OC(1, Math.floor(22050 * secs), 22050);
    try {
      ac = off;
      const tr = prepare(name);
      for (let k = 0, t = 0.05; t < secs - 0.6; k++, t += tr.step) playStep(tr, k % tr.steps, t, off.destination);
    } finally { ac = live; }
    const d = (await off.startRendering()).getChannelData(0);
    let peak = 0, sum = 0;
    for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > peak) peak = v; sum += v * v; }
    return { peak: +peak.toFixed(3), rms: +Math.sqrt(sum / d.length).toFixed(4) };
  },

  // Abafa a música, como quem a ouve do lado de fora da discoteca (ou repõe o som normal).
  muffle(on) {
    muffled = !!on;
    if (ac) applyMuffle();
  },

  // Escolhe a faixa de música (os nomes estão em js/musicas.js).
  setTrack(name) {
    if (!TRACKS[name]) name = 'play';
    if (music.want === name) return;
    music.want = name;
    stopMusic(true);
    startMusic();
  },

  // Baixa a música (pausa) ou repõe o volume normal.
  duck(on) {
    ducked = !!on;
    if (ac) applyMusicLevel();
  },

  // Os browsers só permitem som depois de um gesto do utilizador.
  unlock() {
    try {
      if (!ac) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        ac = new AC();
        sfxBus = ac.createGain();
        sfxBus.connect(ac.destination);
        musicBus = ac.createGain();
        musicBus.gain.value = musicLevel();
        musicFilter = ac.createBiquadFilter();
        musicFilter.type = 'lowpass';
        musicFilter.frequency.value = muffled ? 260 : 20000;
        musicBus.connect(musicFilter);
        musicFilter.connect(ac.destination);
        ac.onstatechange = () => { if (ac.state === 'running') startMusic(); };
      }
      // no iOS o contexto pode ficar "suspended" ou "interrupted" (chamadas, ecrã bloqueado)
      if (ac.state !== 'running') ac.resume().then(startMusic, () => {});
      else startMusic();
    } catch (err) { /* sem áudio */ }
  },

  // Chamado quando a página fica escondida ou volta a estar visível.
  visibility(hidden) {
    if (!ac) return;
    if (hidden) { stopMusic(false); if (ac.suspend) ac.suspend().catch(() => {}); }
    else if (ac.resume) ac.resume().then(startMusic, () => {});
  },

  play(name) {
    if (muted || !ac || ac.state !== 'running') return;
    const s = SOUNDS[name];
    if (s) try { s(); } catch (err) { /* ignora */ }
  },
};
