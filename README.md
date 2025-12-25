<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1aqaIcKtnSrKCJMo8YCwsgkoSHrZhXxlI

## Run Locally

**Prerequisites:**  Node.js

### Web Version
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the app:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

### Desktop App (Electron)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run Electron app:
   ```bash
   npm run dev:electron
   ```
   This will start the Vite dev server and launch the Electron app with a transparent fullscreen window.

3. Build macOS app bundle:
   ```bash
   npm run build:app
   ```
   This creates a `.dmg` file in the `dist` directory that can be installed on macOS.

**App Icon:** The app includes a custom brush icon (`assets/icon.icns`). To regenerate the icon from the SVG source:

```bash
cd assets
node convert-icon.cjs
```

This will convert `icon.svg` to `icon.icns` format required for macOS apps.

## Features

- **Drawing Tools**: Pen, Highlighter, Eraser
- **Text Tool**: Add text with customizable fonts and sizes
- **Laser Pointer**: Visual pointer for presentations
- **Undo/Redo**: Full history management
- **Export**: Save your canvas as PNG image
- **Save/Load**: Automatically saves to browser localStorage
- **Dark Mode**: Full dark mode support
- **Responsive Design**: Works on desktop and tablet devices
- **Desktop App**: Transparent fullscreen overlay for presentations and teaching
  - Always on top
  - Transparent background (see through to desktop)
  - Full screen mode
  - Perfect for screen annotation during lectures
# FletBrush
