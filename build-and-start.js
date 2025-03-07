/* eslint-disable no-console */
const { execSync } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env.production') });

try {
  console.log('Building the auth application...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Starting the auth application...');
  
  // Get the PORT from environment variables or use a default
  const port = process.env.PORT || 4041;
  
  // Explicitly set the PORT environment variable when running npm start
  execSync(`PORT=${port} npm start`, { stdio: 'inherit' });
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}
