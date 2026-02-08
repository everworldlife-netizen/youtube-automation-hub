/**
 * Dashboard API
 * Provides REST endpoints for monitoring and controlling the automation hub
 */

class DashboardAPI {
  /**
   * Setup Express routes for the dashboard
   */
  static setupRoutes(app, hub) {
    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Get dashboard stats
    app.get('/api/stats', async (req, res) => {
      try {
        const stats = await hub.getDashboardStats();
        res.json(stats);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Run full pipeline for a topic
    app.post('/api/pipeline', async (req, res) => {
      const { topic, contentType } = req.body;

      if (!topic) {
        return res.status(400).json({ error: 'topic is required' });
      }

      try {
        const result = await hub.runFullPipeline(topic, contentType || 'short');
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Generate script only
    app.post('/api/script', async (req, res) => {
      const { topic, contentType } = req.body;

      if (!topic) {
        return res.status(400).json({ error: 'topic is required' });
      }

      try {
        const script = await hub.generateScriptOnly(topic, contentType || 'short');
        res.json(script);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Get trending topics
    app.get('/api/trending', async (req, res) => {
      const { niche } = req.query;

      try {
        const topics = await hub.getTrendingTopics(niche);
        res.json(topics);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Analyze competitors
    app.post('/api/competitors', async (req, res) => {
      const { channelUrls } = req.body;

      if (!channelUrls || !Array.isArray(channelUrls)) {
        return res.status(400).json({ error: 'channelUrls array is required' });
      }

      try {
        const analysis = await hub.analyzeCompetitors(channelUrls);
        res.json(analysis);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Schedule batch generation
    app.post('/api/batch', async (req, res) => {
      const { topics, contentType, uploadSchedule } = req.body;

      if (!topics || !Array.isArray(topics)) {
        return res.status(400).json({ error: 'topics array is required' });
      }

      try {
        const results = await hub.scheduleBatch(
          topics,
          contentType || 'short',
          uploadSchedule || []
        );
        res.json(results);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Start automation mode
    app.post('/api/automation/start', async (req, res) => {
      try {
        await hub.startAutomationMode();
        res.json({ status: 'Automation mode started' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Stop automation mode
    app.post('/api/automation/stop', (req, res) => {
      hub.stopAutomationMode();
      res.json({ status: 'Automation mode stopped' });
    });
  }
}

module.exports = DashboardAPI;
