// Genera las imágenes optimizadas (WebP, varios anchos) a partir de las
// fotografías originales del estudio guardadas en _source/photos.
// Uso: npm run images
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const SRC = '_source/photos';
const OUT = 'assets/img';

// crop: región [left, top, width, height] sobre el original (2560x1707 salvo indicación)
const images = [
  { name: 'hero-cadillac', src: 'Detalle-15.jpg', crop: [540, 0, 1500, 1707], widths: [560, 840, 1200] },
  { name: 'escaparate', src: 'Detalle-21.jpg', widths: [480, 900] },
  { name: 'correccion-reformer', src: 'Detalle-30.jpg', widths: [640, 1107] },
  { name: 'reformer', src: 'Detalle-20.jpg', widths: [800, 1280, 1920] },
  { name: 'reformer-cabecero', src: 'Detalle-19.jpg', crop: [430, 0, 1707, 1707], widths: [360, 640] },
  { name: 'cadillac', src: 'Detalle-12.jpg', crop: [1060, 0, 1366, 1707], widths: [480, 800] },
  { name: 'wunda-chair', src: 'Detalle-10.jpg', crop: [380, 0, 1366, 1707], widths: [480, 800] },
  { name: 'sala', src: 'Detalle-01.jpg', widths: [800, 1280, 1920] },
  { name: 'recepcion', src: 'Detalle-02.jpg', crop: [300, 0, 1707, 1707], widths: [400, 720] },
  { name: 'cafe', src: 'Detalle-04.jpg', crop: [600, 0, 1366, 1707], widths: [400, 720] },
  { name: 'toallas', src: 'Detalle-05.jpg', widths: [480, 900] },
  { name: 'elina', src: 'Detalle-16.jpg', crop: [200, 0, 1707, 1707], widths: [400, 720] },
  { name: 'estiramiento', src: 'Detalle-11.jpg', widths: [800, 1280, 1920] },
];

await fs.mkdir(OUT, { recursive: true });
const manifest = {};

for (const img of images) {
  const input = path.join(SRC, img.src);
  let base = sharp(input).rotate();
  if (img.crop) {
    const [left, top, width, height] = img.crop;
    base = base.extract({ left, top, width, height });
  }
  const buf = await base.toBuffer();
  const meta = await sharp(buf).metadata();
  manifest[img.name] = { ratio: `${meta.width}/${meta.height}`, widths: [] };
  for (const w of img.widths) {
    const width = Math.min(w, meta.width);
    const file = `${img.name}-${width}.webp`;
    const info = await sharp(buf)
      .resize({ width })
      .webp({ quality: 72, effort: 6 })
      .toFile(path.join(OUT, file));
    manifest[img.name].widths.push(width);
    console.log(file.padEnd(34), `${info.width}x${info.height}`, `${Math.round(info.size / 1024)} KB`);
  }
}

// Imagen para compartir en redes (Open Graph): 1200x630
await sharp(path.join(SRC, 'Detalle-15.jpg'))
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .jpeg({ quality: 78, mozjpeg: true })
  .toFile('assets/img/og-estudio-pilates-zgz.jpg');

// Logotipo original del estudio, recortado y en negro / marfil
const logo = await sharp(path.join(SRC, 'logo-negro.png')).trim().resize({ height: 200 }).png().toBuffer();
await sharp(logo).toFile(path.join(OUT, 'logo.png'));
await sharp(logo).webp({ quality: 90, alphaQuality: 100 }).toFile(path.join(OUT, 'logo.webp'));
await sharp(logo)
  .negate({ alpha: false })
  .webp({ quality: 90, alphaQuality: 100 })
  .toFile(path.join(OUT, 'logo-claro.webp'));


console.log('OK');
