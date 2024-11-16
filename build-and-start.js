/* eslint-disable no-console */
const { execSync } = require('child_process');

try {
  console.log('Building the auth application...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Starting the auth application...');
  execSync('npm start', { stdio: 'inherit' });
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}
