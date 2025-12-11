# micro.log

Simple micro-journaling app for desktop and web.

## Features

- Daily log with bullet-style entries
- Tags (#project) and mentions (@person)
- Dreams journal
- Notes for longer content
- Ideas tracker with status
- Quotes collection
- Stats and insights
- Dark/light mode

## Storage

**Desktop (Electron):** Choose any folder on your computer. Data is saved as `microlog-data.json`. Sync with Dropbox, iCloud, or any cloud service.

**Web:** Data is stored in browser localStorage.

## Quick Start

```bash
# Install dependencies
npm install

# Run web development
npm run dev

# Run desktop app
npm run electron:dev
```

## Build

```bash
# Build web app
npm run build

# Build desktop app
npm run electron:build

# Platform-specific builds
npm run electron:build:mac
npm run electron:build:win
npm run electron:build:linux
```

## License

MIT
