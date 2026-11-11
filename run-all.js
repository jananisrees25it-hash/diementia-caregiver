// Runner script to start both Backend API (Port 5000) and Vite Frontend (Port 5173) concurrently

const { spawn } = require('child_process');
const path = require('path');

const rootDir = __dirname;
const serverDir = path.join(rootDir, 'server');
const clientDir = path.join(rootDir, 'client');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';
const nodeCmd = 'node';

console.log('=================================================================');
console.log(' 🧠 Launching AI-Powered Cognitive Support & Caregiver Platform ');
console.log('=================================================================');
console.log(' Starting Backend Server on http://localhost:5000...');
console.log(' Starting Frontend Client on http://localhost:5173...');
console.log('=================================================================\n');

// Start Server
const serverProc = spawn(nodeCmd, ['server.js'], {
  cwd: serverDir,
  stdio: 'inherit',
  shell: true
});

// Start Client
const clientProc = spawn(npmCmd, ['run', 'dev'], {
  cwd: clientDir,
  stdio: 'inherit',
  shell: true
});

const cleanup = () => {
  console.log('\n[Shutting down services...]');
  if (serverProc && !serverProc.killed) serverProc.kill();
  if (clientProc && !clientProc.killed) clientProc.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
