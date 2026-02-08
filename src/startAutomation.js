/**
 * Standalone automation starter
 * Run with: npm run automation
 */

require('dotenv').config();
const YouTubeAutomationHub = require('./core/YouTubeAutomationHub');

async function main() {
  const hub = new YouTubeAutomationHub();

  console.log('YouTube Automation Hub - Starting 24/7 Mode');
  console.log('Press Ctrl+C to stop\n');

  await hub.startAutomationMode();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down automation...');
    hub.stopAutomationMode();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    hub.stopAutomationMode();
    process.exit(0);
  });
}

main().catch(error => {
  console.error('Automation startup failed:', error);
  process.exit(1);
});
