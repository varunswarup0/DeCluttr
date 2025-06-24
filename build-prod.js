const { spawn, spawnSync } = require('child_process');

function checkLogin() {
  const result = spawnSync('npx', ['eas', 'whoami'], { encoding: 'utf8' });
  const output = `${result.stdout || ''}${result.stderr || ''}`.trim();

  if (output.includes('Not logged in')) {
    console.error('EAS CLI is not logged in. Run "npx eas login" before building.');
    process.exit(1);
  }

  if (result.error || result.status !== 0) {
    console.error('Failed to run "eas" command. Ensure eas-cli is installed.');
    process.exit(1);
  }
}

function runBuild() {
  const args = ['eas', 'build', '--profile', 'production'];
  const child = spawn('npx', args, { stdio: 'inherit' });
  child.on('exit', code => process.exit(code));
}

checkLogin();
runBuild();
