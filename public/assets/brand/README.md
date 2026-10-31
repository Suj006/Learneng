# PING VIBE brand assets

`ping-vibe-logo.jpg` — **official master logo (source of truth). Never edit, re-export, crop, filter or overwrite it.**

Expected: the official PING VIBE artwork (3D typography, girl character, cat, cloud, rainbow, castle, tagline
"Your World. Your Words. Your Vibe."), JPEG as supplied by the brand owner (committed byte-for-byte), 1536×1024 (3:2). If your master has a different size, update
`LOGO_WIDTH`/`LOGO_HEIGHT` in `src/components/PingVibeLogo.tsx`.

Derivative assets (generated, never hand-edited, safe to delete and regenerate):

| File | Purpose |
|---|---|
| `derived/og-image.jpg` | 1200×630 social preview: the full master logo letter-boxed on white (no crop) |
| `derived/icon-512.png`, `derived/icon-192.png`, `derived/apple-touch-icon.png`, `derived/favicon-32.png` | Square app icons: the full master logo contained in a white square (no crop, no recolour) |

Regenerate after adding/replacing the master:

```bash
npm run brand:assets
```

A compact mark for very narrow headers is **not** derived automatically; per brand rules, add a separately
approved compact asset as `ping-vibe-mark.png` if one is created.
