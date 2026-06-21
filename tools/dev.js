const { spawn } = require('child_process');

const isWindows = process.platform === 'win32';
const command = isWindows ? 'cmd.exe' : 'npm';

function npmArgs(script) {
  return isWindows ? ['/d', '/s', '/c', 'npm.cmd', 'run', script] : ['run', script];
}

function pipeWithPrefix(stream, prefix, writer) {
  let buffer = '';

  stream.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim()) writer(`[${prefix}] ${line}\n`);
    }
  });

  stream.on('end', () => {
    if (buffer.trim()) writer(`[${prefix}] ${buffer}\n`);
  });
}

const processes = [
  { name: 'api', script: 'dev:server' },
  { name: 'web', script: 'dev:client' }
].map(({ name, script }) => {
  const child = spawn(command, npmArgs(script), {
    cwd: process.cwd(),
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  });

  pipeWithPrefix(child.stdout, name, process.stdout.write.bind(process.stdout));
  pipeWithPrefix(child.stderr, name, process.stderr.write.bind(process.stderr));

  child.on('exit', (code, signal) => {
    if (code && code !== 0) {
      process.stderr.write(`[${name}] exited with code ${code}\n`);
      shutdown(code);
      return;
    }

    if (signal) process.stderr.write(`[${name}] stopped by ${signal}\n`);
  });

  return child;
});

let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of processes) {
    if (!child.killed) child.kill();
  }

  setTimeout(() => process.exit(code), 250);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
process.on('exit', () => {
  for (const child of processes) {
    if (!child.killed) child.kill();
  }
});

console.log('RentEase dev servers starting...');
console.log('API: http://localhost:5000');
console.log('Web: http://127.0.0.1:5173');
