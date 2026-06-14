import { spawn } from "node:child_process";

const cwd = process.cwd();
const children = [];

function run(name, command, args, extraEnv = {}) {
  const child = spawn(command, args, {
    cwd,
    env: {
      ...process.env,
      FORCE_COLOR: "1",
      NEXT_PUBLIC_ENABLE_INTERVIEW: "true",
      ...extraEnv,
    },
    stdio: ["inherit", "pipe", "pipe"],
    shell: false,
  });

  const prefix = `[${name}]`;

  child.stdout.on("data", (chunk) => {
    process.stdout.write(`${prefix} ${chunk}`);
  });

  child.stderr.on("data", (chunk) => {
    process.stderr.write(`${prefix} ${chunk}`);
  });

  child.on("exit", (code, signal) => {
    const reason = signal ? `signal ${signal}` : `code ${code ?? 0}`;
    process.stderr.write(`${prefix} exited with ${reason}\n`);
    shutdown(child.pid ?? undefined);
  });

  children.push(child);
}

function shutdown(exitedPid) {
  for (const child of children) {
    if (!child.pid || child.pid === exitedPid) {
      continue;
    }

    try {
      child.kill("SIGTERM");
    } catch {
      // Ignore child shutdown errors during teardown.
    }
  }
}

process.on("SIGINT", () => {
  shutdown();
  process.exit(130);
});

process.on("SIGTERM", () => {
  shutdown();
  process.exit(143);
});

run("blog", "pnpm", ["dev:blog"]);
run("backend", "pnpm", ["dev:backend"], {
  OPENAI_PROXY: process.env.OPENAI_PROXY || "http://127.0.0.1:6789",
  HTTPS_PROXY: process.env.HTTPS_PROXY || "http://127.0.0.1:6789",
  HTTP_PROXY: process.env.HTTP_PROXY || "http://127.0.0.1:6789",
  ALL_PROXY: process.env.ALL_PROXY || "socks5://127.0.0.1:6789",
});
