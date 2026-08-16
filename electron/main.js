import { app, BrowserWindow, screen } from "electron";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
const devServerUrl = process.env.VITE_DEV_SERVER_URL || "http://127.0.0.1:5173";

let mainWindow = null;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  console.log("Creating window with dimensions:", width, "x", height);
  console.log("isDev:", isDev);
  console.log("app.isPackaged:", app.isPackaged);

  mainWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    fullscreen: false, // fullscreen 대신 전체 화면 크기 사용
    skipTaskbar: false, // Dock에 표시되도록
    resizable: true,
    movable: true,
    minimizable: true,
    maximizable: true,
    closable: true,
    hasShadow: false,
    backgroundColor: "#00000000", // 완전 투명 배경
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      backgroundThrottling: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

  if (process.platform === "darwin") {
    mainWindow.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
    });
  }

  // Set window to cover entire screen
  mainWindow.setBounds({ x: 0, y: 0, width, height });
  mainWindow.setAlwaysOnTop(true, "screen-saver");

  if (process.platform === "darwin") {
    console.log(
      "Visible on all workspaces:",
      mainWindow.isVisibleOnAllWorkspaces(),
    );
  }

  // Load the app
  if (isDev) {
    // Development: Load from Vite dev server
    console.log("Loading from dev server:", devServerUrl);
    mainWindow.loadURL(devServerUrl).catch((err) => {
      console.error("Failed to load dev server:", err);
    });
  } else {
    // Production: Load from built files using app.getAppPath()
    // app.getAppPath() returns the correct path whether packaged (app.asar) or not
    const indexPath = join(app.getAppPath(), "dist", "index.html");

    console.log("Loading from:", indexPath);
    console.log("app.getAppPath():", app.getAppPath());

    if (existsSync(indexPath)) {
      mainWindow.loadFile(indexPath).catch((err) => {
        console.error("Failed to load file:", err);
      });
    } else {
      console.error("Built files not found at:", indexPath);
      console.error("app.getAppPath():", app.getAppPath());
      console.error("__dirname:", __dirname);
    }
  }

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Error handling
  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription, validatedURL) => {
      console.error(
        "Failed to load:",
        errorCode,
        errorDescription,
        validatedURL,
      );
    },
  );

  mainWindow.webContents.on("render-process-gone", (_event, details) => {
    console.error("Renderer process exited:", details.reason);
  });

  // Prevent navigation to external URLs
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (url !== mainWindow.webContents.getURL()) {
      event.preventDefault();
    }
  });

  // Show window when ready
  mainWindow.webContents.once("did-finish-load", () => {
    console.log("Window loaded successfully");
    mainWindow.show();
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on("window-all-closed", () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== "darwin") {
    app.quit();
  }
});
