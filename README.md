# justpixels

strip hidden data from your photos. completely in your browser.

## what it does

- removes exif, xmp, iptc, icc profiles, comments, thumbnails
- works 100% client-side. nothing leaves your device.
- supports png, jpeg, webp
- two modes: strip (fast) or re-encode (paranoid)

## usage

```bash
bun install
bun run dev
```

open http://localhost:3000

## build

```bash
bun run build
```

output is in `out/` - deploy anywhere.

## tech

- next.js 16, react 19, typescript 5
- tailwind css 4, shadcn ui
- webcodecs api with canvas fallback
- biome for linting

## browser support

- chrome 94+, edge 94+: full support
- firefox, safari 15+: canvas fallback

## license

gpl-3.0
