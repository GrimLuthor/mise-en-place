#!/usr/bin/env node
// Generates public/icons/icon-192.png and icon-512.png
// Uses only Node.js built-ins (zlib). Run once with: node scripts/gen-icons.mjs

import { mkdirSync, writeFileSync } from 'fs'
import { deflateSync } from 'zlib'

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[i] = c
  }
  return t
})()

function crc32(buf) {
  let crc = 0xffffffff
  for (const byte of buf) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii')
  const lenBuf = Buffer.alloc(4)
  lenBuf.writeUInt32BE(data.length)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])))
  return Buffer.concat([lenBuf, typeBytes, data, crcBuf])
}

function buildPNG(size) {
  const BG_R = 16, BG_G = 185, BG_B = 129   // #10b981 emerald
  const FG_R = 255, FG_G = 255, FG_B = 255  // white

  // 3-channel RGB pixel buffer (flat)
  const pixels = Buffer.alloc(size * size * 3)

  // Fill background
  for (let i = 0; i < size * size; i++) {
    pixels[i * 3] = BG_R; pixels[i * 3 + 1] = BG_G; pixels[i * 3 + 2] = BG_B
  }

  // Draw a white rect — no rx rounding at this level (close enough at small sizes)
  function fillRect(x, y, w, h, r, g, b) {
    for (let py = y; py < y + h; py++) {
      for (let px = x; px < x + w; px++) {
        if (px < 0 || px >= size || py < 0 || py >= size) continue
        const idx = (py * size + px) * 3
        pixels[idx] = r; pixels[idx + 1] = g; pixels[idx + 2] = b
      }
    }
  }

  // Scale factor from 32px design space to target size
  const s = size / 32

  // Pot handles (two tall thin rects)
  fillRect(Math.round(13 * s), Math.round(8 * s), Math.round(2 * s), Math.round(6 * s), FG_R, FG_G, FG_B)
  fillRect(Math.round(17 * s), Math.round(8 * s), Math.round(2 * s), Math.round(6 * s), FG_R, FG_G, FG_B)
  // Lid
  fillRect(Math.round(6 * s), Math.round(13 * s), Math.round(20 * s), Math.round(3 * s), FG_R, FG_G, FG_B)
  // Body
  fillRect(Math.round(8 * s), Math.round(15 * s), Math.round(16 * s), Math.round(9 * s), FG_R, FG_G, FG_B)

  // Build PNG scanlines: prepend filter byte 0 (None) to each row
  const scanlines = Buffer.alloc(size * (1 + size * 3))
  for (let y = 0; y < size; y++) {
    const rowOffset = y * (1 + size * 3)
    scanlines[rowOffset] = 0 // filter None
    pixels.copy(scanlines, rowOffset + 1, y * size * 3, (y + 1) * size * 3)
  }

  const compressed = deflateSync(scanlines, { level: 9 })

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 2  // color type: RGB
  // bytes 10,11,12 already 0 (compression, filter, interlace)

  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync('public/icons', { recursive: true })

for (const size of [192, 512]) {
  const png = buildPNG(size)
  writeFileSync(`public/icons/icon-${size}.png`, png)
  console.log(`✓ public/icons/icon-${size}.png (${png.length} bytes)`)
}
