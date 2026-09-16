const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal pure-Node PNG generator
function createPNG(width, height, drawFn) {
  const buffer = Buffer.alloc(width * height * 4);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      buffer[idx] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
      buffer[idx + 3] = a;
    }
  }

  // PNG specification chunks
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(6, 9); // RGBA color type
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Scanlines with filter byte 0
  const scanlines = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    const lineStart = y * (width * 4 + 1);
    scanlines[lineStart] = 0; // Filter None
    buffer.copy(scanlines, lineStart + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressedData = zlib.deflateSync(scanlines);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const crcTable = new Int32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const crcVal = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// Icon design: Indigo/Violet gradient with wallet / currency shape
function iconDrawer(x, y, w, h) {
  const nx = x / w;
  const ny = y / h;
  const cx = w / 2;
  const cy = h / 2;

  // Indigo gradient (#4F46E5 to #7C3AED)
  let r = Math.round(79 + (124 - 79) * ny);
  let g = Math.round(70 + (58 - 70) * ny);
  let b = Math.round(229 + (237 - 229) * ny);
  let a = 255;

  // Rounded squircle background corner check
  const cornerR = w * 0.22;
  let inCorner = false;
  if (x < cornerR && y < cornerR) {
    if (Math.hypot(x - cornerR, y - cornerR) > cornerR) inCorner = true;
  } else if (x > w - cornerR && y < cornerR) {
    if (Math.hypot(x - (w - cornerR), y - cornerR) > cornerR) inCorner = true;
  } else if (x < cornerR && y > h - cornerR) {
    if (Math.hypot(x - cornerR, y - (h - cornerR)) > cornerR) inCorner = true;
  } else if (x > w - cornerR && y > h - cornerR) {
    if (Math.hypot(x - (w - cornerR), y - (h - cornerR)) > cornerR) inCorner = true;
  }
  if (inCorner) {
    return [0, 0, 0, 0];
  }

  // Draw white wallet card shape in center
  const cardLeft = w * 0.25;
  const cardRight = w * 0.75;
  const cardTop = h * 0.32;
  const cardBottom = h * 0.68;
  const cardR = w * 0.08;

  let inCard = false;
  if (x >= cardLeft && x <= cardRight && y >= cardTop && y <= cardBottom) {
    // Check card corner radii
    let inCardCorner = false;
    if (x < cardLeft + cardR && y < cardTop + cardR) {
      if (Math.hypot(x - (cardLeft + cardR), y - (cardTop + cardR)) > cardR) inCardCorner = true;
    } else if (x > cardRight - cardR && y < cardTop + cardR) {
      if (Math.hypot(x - (cardRight - cardR), y - (cardTop + cardR)) > cardR) inCardCorner = true;
    } else if (x < cardLeft + cardR && y > cardBottom - cardR) {
      if (Math.hypot(x - (cardLeft + cardR), y - (cardBottom - cardR)) > cardR) inCardCorner = true;
    } else if (x > cardRight - cardR && y > cardBottom - cardR) {
      if (Math.hypot(x - (cardRight - cardR), y - (cardBottom - cardR)) > cardR) inCardCorner = true;
    }
    if (!inCardCorner) inCard = true;
  }

  // Clasp/Flap on right side of wallet
  const flapLeft = w * 0.60;
  const flapRight = w * 0.80;
  const flapTop = h * 0.44;
  const flapBottom = h * 0.56;
  let inFlap = false;
  if (x >= flapLeft && x <= flapRight && y >= flapTop && y <= flapBottom) {
    inFlap = true;
  }

  if (inCard || inFlap) {
    // White card with inner shading
    r = 255;
    g = 255;
    b = 255;

    // Little gold clasp button inside flap
    const btnCx = w * 0.70;
    const btnCy = h * 0.50;
    const btnR = w * 0.035;
    if (Math.hypot(x - btnCx, y - btnCy) <= btnR) {
      r = 245;
      g = 158;
      b = 11; // Amber #F59E0B
    }
  }

  return [r, g, b, a];
}

const pubDir = path.join(__dirname, '..', 'public');
fs.mkdirSync(pubDir, { recursive: true });

fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), createPNG(192, 192, iconDrawer));
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), createPNG(512, 512, iconDrawer));
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), createPNG(180, 180, iconDrawer));

console.log('Icons generated successfully in public/');
