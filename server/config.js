import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const PORT = process.env.PORT || 3000;
export const API_BASE = process.env.API_BASE || 'https://pollar.up.railway.app';
export const FONT_FAMILY = "'HK Grotesk', 'Noto Sans', 'DejaVu Sans', sans-serif";
export const PROJECT_ROOT = join(__dirname, '..');

// Load logo buffer at startup for Sharp compositing
export let logoBuffer = null;
try {
  logoBuffer = readFileSync(join(PROJECT_ROOT, 'server-assets/logo-white.png'));
  console.log('Logo loaded successfully');
} catch (err) {
  console.warn('Could not load logo:', err.message);
}
