/**
 * AI-WELFARE-COPILOT — Unified Development Runner
 * Starts Express Core Backend (5000), Flask Auth Microservice (5001), and Vite Frontend (5173) concurrently.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = __dirname;

// Detect python executable
function getPythonCommand() {
  const venvPythonWin = path.join(rootDir, 'backend-python', 'venv', 'Scripts', 'python.exe');
  const venvPythonUnix = path.join(rootDir, 'backend-python', 'venv', 'bin', 'python');

  if (fs.existsSync(venvPythonWin)) {
    return venvPythonWin;
  }
  if (fs.existsSync(venvPythonUnix)) {
    return venvPythonUnix;
  }
  return process.platform === 'win32' ? 'python' : 'python3';
}

const processes = [];

function startProcess(name, command, args, cwd, color) {
  const proc = spawn(command, args, {
    cwd,
    shell: true,
    env: { ...process.env, PYTHONUNBUFFERED: '1', FORCE_COLOR: '1' }
  });

  proc.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`${color}[${name}]${'\x1b[0m'} ${line}`);
      }
    });
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.error(`${color}[${name}:err]${'\x1b[0m'} ${line}`);
      }
    });
  });

  proc.on('close', (code) => {
    console.log(`${color}[${name}]${'\x1b[0m'} Process exited with code ${code}`);
  });

  processes.push(proc);
  return proc;
}

console.log('\x1b[1m\x1b[36m==================================================================\x1b[0m');
console.log('\x1b[1m\x1b[36m  AI-WELFARE-COPILOT — Starting All Services\x1b[0m');
console.log('\x1b[1m\x1b[36m  1. Express Core Backend  -> http://localhost:5000\x1b[0m');
console.log('\x1b[1m\x1b[36m  2. Flask Auth / OTP      -> http://localhost:5001\x1b[0m');
console.log('\x1b[1m\x1b[36m  3. React Frontend        -> http://localhost:5173\x1b[0m');
console.log('\x1b[1m\x1b[36m==================================================================\x1b[0m\n');

// 1. Start Express Backend
startProcess(
  'Express:5000',
  'node',
  ['server.js'],
  path.join(rootDir, 'backend'),
  '\x1b[36m' // Cyan
);

// 2. Start Flask Auth Backend
const pythonCmd = getPythonCommand();
startProcess(
  'Flask:5001',
  pythonCmd,
  ['app.py'],
  path.join(rootDir, 'backend-python'),
  '\x1b[33m' // Yellow
);

// 3. Start Vite Frontend
startProcess(
  'Vite:5173',
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['run', 'dev'],
  path.join(rootDir, 'frontend'),
  '\x1b[32m' // Green
);

function cleanup() {
  console.log('\n\x1b[31mShutting down all AI-WELFARE-COPILOT services...\x1b[0m');
  processes.forEach(proc => {
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', proc.pid, '/f', '/t']);
      } else {
        proc.kill('SIGTERM');
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  });
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
