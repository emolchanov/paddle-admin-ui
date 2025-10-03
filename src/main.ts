import { is } from "@electron-toolkit/utils";
import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  powerSaveBlocker,
  MenuItem,
} from "electron";
import { getPort } from "get-port-please";
import { join } from "path";
import { appendFileSync } from "fs";
import { spawn, ChildProcess } from "child_process";

const id = powerSaveBlocker.start("prevent-display-sleep");

function initializeDatabasePath() {
  const dbDirectory = join(app.getPath("userData"), "database");

  process.env.DATABASE_DIR = dbDirectory;

  console.log(`Using database at: ${dbDirectory}`);
}

app.setAppLogsPath();
function logToFile(message: string | Error | unknown) {
  const logPath = join(app.getPath("logs"), "main.log");
  let formattedMessage: string;

  if (message instanceof Error) {
    formattedMessage = `[${new Date().toISOString()}] ERROR: ${
      message.stack || message.message
    }\n`;
  } else {
    formattedMessage = `[${new Date().toISOString()}] ${String(message)}\n`;
  }

  appendFileSync(logPath, formattedMessage);
}

const originalConsoleLog = console.log;
console.log = (...args: unknown[]) => {
  const message = args
    .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg)))
    .join(" ");
  is.dev || process.env.NODE_ENV === "development"
    ? originalConsoleLog(message)
    : logToFile(message);
};

const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const message = args
    .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg)))
    .join(" ");
  is.dev || process.env.NODE_ENV === "development"
    ? originalConsoleError(message)
    : logToFile(`ERROR: ${message}`);
};

const createWindow = async () => {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minHeight: 600,
    minWidth: 800,
    titleBarStyle: "hidden",
    titleBarOverlay: true,
    show: false,
    webPreferences: {
      preload: join(__dirname, "..", "renderer", "main_window", "preload.js"),
      nodeIntegration: true,
    },
  });

  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.key === "F12" || (input.key === "i" && input.meta && input.alt)) {
      mainWindow.webContents.toggleDevTools();
    }
  });

  try {
    const port = await startNextJSServer();
    console.log("Next.js server started on port:", port);
    mainWindow.loadURL(`http://localhost:${port}`);
    mainWindow.show();
  } catch (error) {
    console.error("Error starting Next.js server:", error);
  }

  return mainWindow;
};

// variable to hold Next.js server process
let nextServerProcess: ChildProcess | null = null;

const startNextJSServer = async () => {
  try {
    const port = await getPort({ portRange: [3000, 5000] });
    if (is.dev || process.env.NODE_ENV === "development") {
      // Development: run Next.js dev server
      const serverProc = spawn("npx", ["next", "dev", "-p", port.toString()], {
        cwd: app.getAppPath(),
        env: { ...process.env, PORT: port.toString() },
        stdio: "pipe",
      });
      // store process reference
      nextServerProcess = serverProc;
      serverProc.stdout.on("data", (data) => console.log(String(data)));
      serverProc.stderr.on("data", (data) => console.error(String(data)));
    } else {
      // Production: standalone Next.js server
      const serverPath = join(
        process.resourcesPath,
        ".next",
        "standalone",
        "server.js"
      );
      const nodeBinPath = join(
        process.resourcesPath,
        "bins/node-v24.4.1-darwin-arm64/bin/node"
      );
      const serverProc = spawn(nodeBinPath, [serverPath], {
        env: { ...process.env, PORT: port.toString() },
        stdio: "pipe",
      });
      // store process reference
      nextServerProcess = serverProc;
      serverProc.stdout.on("data", (data) => {
        const message = String(data);
        console.log(message);
      });
      serverProc.stderr.on("data", (data) => {
        const message = String(data);
        console.error(message);
      });
    }
    // Wait until server is ready
    await new Promise<void>((resolve) => {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:${port}`, {
            method: "HEAD",
          });
          if (res.ok) {
            clearInterval(interval);
            resolve();
          }
        } catch {}
      }, 5000);
    });
    return port;
  } catch (error) {
    console.error("Error starting Next.js server:", error);
    throw error;
  }
};

const closeApp = () => {
  if (nextServerProcess) {
    nextServerProcess.kill();
  }
  app.quit();
};

app.whenReady().then(async () => {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: app.name,
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: "Command+Q",
          click: closeApp,
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "pasteAndMatchStyle" },
        { role: "delete" },
        { role: "selectAll" },
        { type: "separator" },
        {
          label: "Speech",
          submenu: [{ role: "startSpeaking" }, { role: "stopSpeaking" }],
        },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        {
          label: "Developer Tools",
          accelerator:
            process.platform === "darwin" ? "Command+Option+I" : "F12",
          click: () => {
            const focusedWindow = BrowserWindow.getFocusedWindow();
            if (focusedWindow) {
              focusedWindow.webContents.toggleDevTools();
            }
          },
        },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        { type: "separator" },
        { role: "front" },
        { type: "separator" },
        { role: "window" },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  initializeDatabasePath();

  const mainWindow = await createWindow();

  // Create context menu
  const contextMenu = new Menu();
  contextMenu.append(new MenuItem({ role: "cut" }));
  contextMenu.append(new MenuItem({ role: "copy" }));
  contextMenu.append(new MenuItem({ role: "paste" }));
  contextMenu.append(new MenuItem({ type: "separator" }));
  contextMenu.append(new MenuItem({ role: "selectAll" }));

  // Add context menu handler
  mainWindow.webContents.on("context-menu", (e, params) => {
    const { isEditable, editFlags } = params;
    if (isEditable) {
      contextMenu.popup();
    }
  });

  ipcMain.on("ping", () => console.log("pong"));
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});


app.on("window-all-closed", () => {
  powerSaveBlocker.stop(id);
  closeApp();
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  closeApp();
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  closeApp();
});
