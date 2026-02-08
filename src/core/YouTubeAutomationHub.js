/**
 * YouTube Automation Hub - Integrated Internal Tool
 * Combines: youtube-automation-agent + ai-mixed-cut + analytics + video editing
 * Works directly in Claude Code Web
 */

const fs = require('fs');
const path = require('path');

const ContentStrategyAgent = require('../agents/content-strategy-agent');
const ScriptWriterAgent = require('../agents/script-writer-agent');
const ThumbnailDesignAgent = require('../agents/thumbnail-design-agent');
const VideoGenerationEngine = require('../engines/video-generation-engine');
const YouTubePublisher = require('../services/youtube-publisher');
const AnalyticsService = require('../services/analytics-service');
const ConfigManager = require('../utils/config-manager');

class YouTubeAutomationHub {
  constructor(configPath) {
    this.config = ConfigManager.load(configPath);
    this.agents = {
      strategy: new ContentStrategyAgent(this.config),
      scriptWriter: new ScriptWriterAgent(this.config),
      thumbnail: new ThumbnailDesignAgent(this.config),
      videoEngine: new VideoGenerationEngine(this.config),
      publisher: new YouTubePublisher(this.config),
      analytics: new AnalyticsService(this.config)
    };

    this.queue = [];
    this.isProcessing = false;
    this.logger = this.createLogger();
  }

  createLogger() {
    return {
      info: (msg) => console.log(`[INFO] ${new Date().toISOString()}: ${msg}`),
      error: (msg) => console.error(`[ERROR] ${new Date().toISOString()}: ${msg}`),
      success: (msg) => console.log(`[SUCCESS] ${new Date().toISOString()}: ${msg}`)
    };
  }

  /**
   * Full Automation Pipeline
   */
  async runFullPipeline(topic, contentType = 'short') {
    this.logger.info(`Starting full pipeline for topic: "${topic}"`);

    try {
      // Stage 1: Research & Strategy
      this.logger.info('Stage 1: Content Strategy & Research');
      const strategy = await this.agents.strategy.analyze(topic, contentType);

      // Stage 2: Script Generation
      this.logger.info('Stage 2: Script Generation');
      const script = await this.agents.scriptWriter.generateScript(
        strategy,
        contentType
      );

      // Stage 3: Thumbnail Design
      this.logger.info('Stage 3: Thumbnail Generation');
      const thumbnail = await this.agents.thumbnail.generateThumbnail(
        strategy,
        script
      );

      // Stage 4: Video Generation
      this.logger.info('Stage 4: Video Generation (ai-mixed-cut integration)');
      const videoPath = await this.agents.videoEngine.generateVideo({
        script,
        thumbnail,
        contentType,
        strategy
      });

      // Stage 5: Publishing
      this.logger.info('Stage 5: Publishing to YouTube');
      const uploadResult = await this.agents.publisher.upload({
        videoPath,
        title: script.title,
        description: script.description,
        tags: script.tags,
        thumbnail: thumbnail.path,
        isPublic: this.config.defaultPublic
      });

      this.logger.success(`Video published! URL: ${uploadResult.videoUrl}`);

      return {
        success: true,
        videoId: uploadResult.videoId,
        videoUrl: uploadResult.videoUrl,
        strategy,
        script,
        thumbnail,
        metadata: uploadResult
      };
    } catch (error) {
      this.logger.error(`Pipeline failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Run only script generation
   */
  async generateScriptOnly(topic, contentType = 'short') {
    const strategy = await this.agents.strategy.analyze(topic, contentType);
    return await this.agents.scriptWriter.generateScript(strategy, contentType);
  }

  /**
   * Run only video generation
   */
  async generateVideoOnly(script, contentType = 'short') {
    return await this.agents.videoEngine.generateVideo({
      script,
      contentType
    });
  }

  /**
   * Analyze competitor channels
   */
  async analyzeCompetitors(channelUrls = []) {
    return await this.agents.analytics.analyzeCompetitors(channelUrls);
  }

  /**
   * Get trending topics in niche
   */
  async getTrendingTopics(niche) {
    return await this.agents.strategy.getTrendingTopics(niche);
  }

  /**
   * Schedule batch content generation
   */
  async scheduleBatch(topics, contentType = 'short', uploadSchedule = []) {
    this.logger.info(`Scheduling batch: ${topics.length} videos`);

    const results = [];
    for (let i = 0; i < topics.length; i++) {
      try {
        const result = await this.runFullPipeline(topics[i], contentType);

        if (uploadSchedule[i]) {
          await this.agents.publisher.scheduleUpload(
            result.videoId,
            uploadSchedule[i]
          );
        }

        results.push({ topic: topics[i], success: true, ...result });
      } catch (error) {
        results.push({ topic: topics[i], success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Start 24/7 Automation Mode
   */
  async startAutomationMode() {
    this.logger.info('Starting 24/7 Automation Mode');

    const dailySchedule = {
      morning: { hour: 6, topics: 1 },
      afternoon: { hour: 12, topics: 1 },
      evening: { hour: 18, topics: 1 }
    };

    this.automationInterval = setInterval(async () => {
      try {
        const hour = new Date().getHours();

        for (const [, schedule] of Object.entries(dailySchedule)) {
          if (hour === schedule.hour) {
            const topics = await this.getTrendingTopics();
            const topicToUse = topics[0]?.title || 'Top 10 Tips';

            await this.runFullPipeline(topicToUse, 'short');
            break;
          }
        }
      } catch (error) {
        this.logger.error(`Automation cycle failed: ${error.message}`);
      }
    }, 60000); // Check every minute
  }

  /**
   * Stop Automation Mode
   */
  stopAutomationMode() {
    if (this.automationInterval) {
      clearInterval(this.automationInterval);
      this.automationInterval = null;
      this.logger.info('Automation Mode stopped');
    }
  }

  /**
   * Get Dashboard Stats
   */
  async getDashboardStats() {
    return {
      videosGenerated: this.config.videosGenerated || 0,
      videosPublished: this.config.videosPublished || 0,
      totalViews: this.config.totalViews || 0,
      avgEngagement: this.config.avgEngagement || 0,
      channelsConnected: Object.keys(this.config.channels || {}).length,
      lastUpload: this.config.lastUpload || 'Never',
      aiCostThisMonth: this.calculateMonthlyCost()
    };
  }

  calculateMonthlyCost() {
    const videosThisMonth = this.config.videosGenerated || 0;
    if (this.config.aiProvider === 'openai') {
      return (videosThisMonth * 0.25).toFixed(2);
    }
    return '0.00';
  }
}

module.exports = YouTubeAutomationHub;
