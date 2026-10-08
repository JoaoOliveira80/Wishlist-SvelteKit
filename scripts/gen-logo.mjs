// Gerador da marca Gamewish — fonte única da verdade.
// Define o mark UMA vez e emite SVG + PNG + ICO idênticos, na paleta void-arcade
// (limão #d7f542 + violeta #a78bfa sobre void #06080e).
//
// Uso: node scripts/gen-logo.mjs   (ou: npm run logo)
// Requer `sharp` como dependência de desenvolvimento.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'static');

const VOID = '#06080e';
const LIME = '#d7f542';
const LIME_SOFT = '#e6ff70';
const VIOLET = '#a78bfa';

// ── GAMEPAD + CORAÇÃO — "game" (d-pad) + "wish" (botão-coração) ─────────────
// Um gamepad limão, blocadão e legível a 16px: d-pad recortado (void) no
// ombro esquerdo e o botão "wish" (coração violeta) no direito. Sem enfeite
// extra — silhueta limpa que lê "controle" na hora, sem virar binóculo.
const PAD =
  'M13 25 C13 20.5 16.5 18 21 18 L43 18 ' +
  'C47.5 18 51 20.5 51 25 C54.5 26 57 29.5 57 34 ' +
  'C57 39.5 53.5 44.5 48 44.5 C45 44.5 43 42 43 39 ' +
  'L21 39 C21 42 19 44.5 16 44.5 C10.5 44.5 7 39.5 7 34 ' +
  'C7 29.5 9.5 26 13 25 Z';
// d-pad (cruz) recortado em void no ombro esquerdo
const DPAD_V = { x: 14.6, y: 24, w: 3, h: 9.5 };
const DPAD_H = { x: 11.9, y: 27.2, w: 8.2, h: 3 };
// botão "wish": coração violeta no ombro direito
const HEART =
  'M44.5 31 C44.5 31 40.3 28.3 40.3 25.9 C40.3 24.4 41.5 23.4 42.9 23.4 ' +
  'C43.7 23.4 44.3 23.8 44.5 24.3 C44.7 23.8 45.3 23.4 46.1 23.4 ' +
  'C47.5 23.4 48.7 24.4 48.7 25.9 C48.7 28.3 44.5 31 44.5 31 Z';

/**
 * Monta o SVG do mark.
 * @param {'icon'|'apple'|'mask'} mode icon = site/favicon; apple/mask = bleed p/ máscara do SO
 */
function markSvg(mode = 'icon') {
  const s = mode === 'apple' ? 0.82 : mode === 'mask' ? 0.72 : 1;

  const layers =
    `<rect width="64" height="64" fill="${VOID}"/>` +
    `<g transform="translate(32 32) scale(${s}) translate(-32 -32)">` +
    // gamepad limão — shape único, base lisa, punhos na curva (não lóbulos)
    `<path d="${PAD}" fill="${LIME}" filter="url(#gw-glow)"/>` +
    `<path d="${PAD}" fill="none" stroke="${LIME_SOFT}" stroke-width="1.1" stroke-linejoin="round" opacity="0.5"/>` +
    // d-pad "game" recortado em void (cruz)
    `<rect x="${DPAD_V.x}" y="${DPAD_V.y}" width="${DPAD_V.w}" height="${DPAD_V.h}" fill="${VOID}"/>` +
    `<rect x="${DPAD_H.x}" y="${DPAD_H.y}" width="${DPAD_H.w}" height="${DPAD_H.h}" fill="${VOID}"/>` +
    // botão "wish" — coração violeta
    `<path d="${HEART}" fill="${VIOLET}" filter="url(#gw-glow)"/>` +
    `</g>`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" role="img" aria-label="Gamewish">` +
    `<defs><filter id="gw-glow" x="-60%" y="-60%" width="220%" height="220%">` +
    `<feGaussianBlur stdDeviation="2.2" result="b"/>` +
    `<feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>` +
    `</filter></defs>` +
    layers +
    `</svg>`
  );
}

async function renderPng(svg, size) {
  return sharp(Buffer.from(svg), { density: 512 })
    .resize(size, size, { fit: 'contain', background: VOID })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

// Empacota PNGs num .ico multi-resolução.
function buildIco(sizes) {
  const count = sizes.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);
  let offset = 6 + count * 16;
  const entries = sizes.map(({ size, buf }) => {
    const e = Buffer.alloc(16);
    e[0] = size >= 256 ? 0 : size;
    e[1] = size >= 256 ? 0 : size;
    e[2] = 0;
    e[3] = 0;
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(buf.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += buf.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...sizes.map((s) => s.buf)]);
}

mkdirSync(OUT, { recursive: true });

// 1) SVGs (vetor — usados no site e como favicon escalável)
const iconSvg = markSvg('icon');
writeFileSync(resolve(OUT, 'favicon.svg'), iconSvg);
writeFileSync(resolve(OUT, 'logo.svg'), iconSvg);

// 2) PNGs
const png192 = await renderPng(iconSvg, 192);
const png512 = await renderPng(iconSvg, 512);
const apple = await renderPng(markSvg('apple'), 180);
const maskable = await renderPng(markSvg('mask'), 512);
writeFileSync(resolve(OUT, 'favicon-192.png'), png192);
writeFileSync(resolve(OUT, 'favicon-512.png'), png512);
writeFileSync(resolve(OUT, 'apple-touch-icon.png'), apple);
writeFileSync(resolve(OUT, 'favicon-maskable-512.png'), maskable);

// 3) ICO multi-res (48/32/16) a partir do mark com tile
const ico48 = await renderPng(iconSvg, 48);
const ico32 = await renderPng(iconSvg, 32);
const ico16 = await renderPng(iconSvg, 16);
writeFileSync(
  resolve(OUT, 'favicon.ico'),
  buildIco([
    { size: 48, buf: ico48 },
    { size: 32, buf: ico32 },
    { size: 16, buf: ico16 },
  ]),
);

console.log('Logo Gamewish gerada em static/: favicon.svg, logo.svg, favicon-192/512.png, apple-touch-icon.png, favicon-maskable-512.png, favicon.ico');
