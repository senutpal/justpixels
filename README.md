# justpixels

> **Privacy-first image metadata remover.** Strip EXIF, XMP, and other hidden data from your photos entirely in your browser.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

## Features

- **100% Client-Side** : Your images never leave your device
- **No Upload, No Server** : All processing happens in your browser
- **Two Processing Modes:**
  - **Strip Mode** : Fast binary metadata removal, preserves quality
  - **Re-encode Mode** : Full pixel reconstruction for paranoid-level privacy
- **Batch Processing** : Process multiple images at once
- **Format Support** : PNG, JPEG, and WebP
- **Works Offline** : No internet required after initial load
- **Dark/Light Theme** : Easy on the eyes

## Security Architecture

justpixels is designed with privacy as the core principle:

| Security Property | Implementation |
|-------------------|----------------|
| No Data Transmission | Static export, no API routes |
| No Server-Side Processing | All operations use Web APIs |
| No Analytics/Tracking | Zero external scripts |
| No Cookies/Storage | No persistent data |
| Cryptographic Verification | SHA-256 hashes via Web Crypto API |

### What Gets Removed

- **EXIF** : GPS coordinates, camera model, timestamps
- **XMP** : Adobe metadata, editing history
- **IPTC** : Copyright, captions, keywords
- **ICC Profiles** : Color profiles that may contain identifiers
- **Comments** : Embedded text comments
- **Thumbnails** : Embedded preview images that may contain metadata

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+

### Installation

```bash
# Clone the repository
git clone https://github.com/senutpal/justpixels.git
cd justpixels

# Install dependencies
bun install

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
# Create static export
bun run build

# Output is in the 'out' directory
```

The static files can be deployed to any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) with React 19
- **Language:** [TypeScript 5](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/)
- **Runtime:** [Bun](https://bun.sh/)
- **Linting:** [Biome](https://biomejs.dev/)

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/
│   ├── home/           # Home page components
│   ├── about/          # About page components
│   ├── layout/         # Shared layout components
│   └── ui/             # Base UI components
├── lib/
│   ├── image-processor.ts    # Processing orchestrator
│   ├── metadata-stripper.ts  # Binary metadata removal
│   ├── canvas-processor.ts   # Canvas-based re-encoding
│   ├── wasm-processor.ts     # WebCodecs-based processing
│   ├── crypto.ts             # SHA-256 hashing
│   └── types.ts              # TypeScript definitions
└── types/              # Additional type declarations
```

## Browser Compatibility

| Browser | Strip Mode | Re-encode Mode |
|---------|------------|----------------|
| Chrome 94+ | Yes | Yes (WebCodecs) |
| Edge 94+ | Yes | Yes (WebCodecs) |
| Firefox | Yes | Yes (Canvas fallback) |
| Safari 15+ | Yes | Yes (Canvas fallback) |

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run Biome linter |
| `bun run format` | Format code with Biome |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  <strong>Your photos. Your privacy. Just pixels.</strong>
</p>
