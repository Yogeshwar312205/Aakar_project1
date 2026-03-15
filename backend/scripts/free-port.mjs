import { execSync } from 'node:child_process';

const portArg = process.argv[2] || '3000';
const port = String(portArg).trim();

if (!/^\d+$/.test(port)) {
  console.error(`Invalid port: ${port}`);
  process.exit(1);
}

try {
  const output = execSync(`netstat -ano | findstr :${port}`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });

  const pids = new Set();
  const lines = output.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    // Typical line: TCP 0.0.0.0:3000 0.0.0.0:0 LISTENING 12345
    const parts = line.split(/\s+/);
    const pid = parts[parts.length - 1];
    if (/^\d+$/.test(pid)) {
      pids.add(pid);
    }
  }

  if (pids.size === 0) {
    console.log(`No process found on port ${port}.`);
    process.exit(0);
  }

  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: ['ignore', 'pipe', 'pipe'] });
      console.log(`Stopped PID ${pid} on port ${port}.`);
    } catch {
      // Ignore individual kill failures so startup can continue if process exits in parallel.
    }
  }
} catch {
  console.log(`No process found on port ${port}.`);
}
