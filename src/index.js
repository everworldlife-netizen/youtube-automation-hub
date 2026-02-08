require('dotenv').config();
const path = require('path');
const express = require('express');
const YouTubeAutomationHub = require('./core/YouTubeAutomationHub');
const DashboardAPI = require('./api/DashboardAPI');

// Initialize Express app for dashboard
const app = express();
app.use(express.json());

// Serve the web dashboard
app.use(express.static(path.join(__dirname, 'public')));

// Initialize YouTube Automation Hub
const hub = new YouTubeAutomationHub();

// Setup Dashboard API routes
DashboardAPI.setupRoutes(app, hub);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('');
    console.log('  YouTube Automation Hub is running!');
    console.log('');
    console.log(`  Dashboard:  http://localhost:${PORT}`);
    console.log(`  API:        http://localhost:${PORT}/api/health`);
    console.log('');
    console.log('  Open the Dashboard URL in your browser to get started.');
    console.log('  Press Ctrl+C to stop the server.');
    console.log('');
});

// Export for CLI usage
module.exports = hub;
