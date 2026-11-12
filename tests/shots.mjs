// Ferramenta de desenvolvimento: guarda capturas do canvas do jogo em tests/shots/*.png.
//   node tests/shots.mjs      → fica à escuta em http://localhost:8091
// No jogo aberto com ?dev: await __dev.shot('nome') envia a imagem atual do canvas (ampliada 2x).
// Só aceita pedidos feitos a partir deste computador.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'shots');
const LOCAL = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);
fs.mkdirSync(DIR, { recursive: true });

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  const m = /^\/([\w-]{1,60})\.png$/.exec(req.url || '');
  if (req.method !== 'POST' || !m || !LOCAL.has(req.socket.remoteAddress)) { res.writeHead(400); res.end('pedido inválido'); return; }
  const chunks = [];
  let size = 0;
  req.on('data', (c) => { size += c.length; if (size < 4e6) chunks.push(c); });
  req.on('end', () => {
    const buf = Buffer.concat(chunks);
    if (buf.length < 8 || buf.readUInt32BE(0) !== 0x89504e47) { res.writeHead(400); res.end('não é PNG'); return; }
    fs.writeFileSync(path.join(DIR, m[1] + '.png'), buf);
    res.writeHead(200); res.end('ok');
  });
}).listen(8091, '127.0.0.1');
