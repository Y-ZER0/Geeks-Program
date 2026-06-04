// Launches both frontend and backend concurrently
import { spawn } from "child_process";

const server = spawn("node", ["server/index.js"], { stdio: "inherit" });
const vite = spawn("npx", ["vite", "--host"], { stdio: "inherit", shell: true });

process.on("SIGINT", () => {
  server.kill();
  vite.kill();
  process.exit();
});
