import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const mainSource = await readFile(new URL("./main.js", import.meta.url), "utf8");
const htmlSource = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("keeps the renderer isolated and follows macOS workspaces", () => {
  assert.match(mainSource, /nodeIntegration:\s*false/);
  assert.match(mainSource, /contextIsolation:\s*true/);
  assert.match(mainSource, /sandbox:\s*true/);
  assert.match(mainSource, /setWindowOpenHandler\(\(\) => \(\{ action: "deny" \}\)\)/);
  assert.match(
    mainSource,
    /setVisibleOnAllWorkspaces\(true,\s*\{\s*visibleOnFullScreen:\s*true,?\s*\}\)/,
  );
  assert.match(mainSource, /isVisibleOnAllWorkspaces\(\)/);
  assert.match(mainSource, /VITE_DEV_SERVER_URL/);
  assert.match(htmlSource, /Content-Security-Policy/);
});
