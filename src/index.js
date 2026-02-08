require('dotenv').config();
const express = require('express');
const YouTubeAutomationHub = require('./core/YouTubeAutomationHub');
const DashboardAPI = require('./api/DashboardAPI');

// Initialize Express app for dashboard
const app = express();
app.use(express.json());

// Initialize YouTube Automation Hub
const hub = new YouTubeAutomationHub();

// Setup Dashboard API routes
DashboardAPI.setupRoutes(app, hub);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🎬 YouTube Automation Hub running on port ${PORT}`);
    console.log(`📊 Dashboard available at http://localhost:${PORT}`);
});

// Export for CLI usage
module.exports = hub;
