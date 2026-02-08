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
const ChannelAnalyzer = require('../services/channel-analyzer');
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
      analytics: new AnalyticsService(this.config),
      channelAnalyzer: new ChannelAnalyzer(this.config)
    };

    this.channelData = null; // Stores channel analysis results
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

  /**
   * Analyze your channel - the starting point for everything
   */
  async analyzeMyChannel(channelUrl) {
    this.logger.info(`Analyzing channel: ${channelUrl}`);
    this.channelData = await this.agents.channelAnalyzer.analyzeChannel(channelUrl);
    this.logger.success('Channel analysis complete');
    return this.channelData;
  }

  /**
   * Get cached channel data
   */
  getChannelData() {
    return this.channelData;
  }

  /**
   * One-click: research channel + generate video ideas
   */
  async researchAndRecommend(channelUrl) {
    this.logger.info('Starting full channel research...');

    // Analyze the channel if not already done or if URL changed
    if (!this.channelData || this.channelData.channelUrl !== channelUrl) {
      this.channelData = await this.agents.channelAnalyzer.analyzeChannel(channelUrl);
    }

    return this.channelData;
  }

  /**
   * One-click: pick best idea and generate the full video
   * Takes a recommendation from the channel analysis and runs the full pipeline
   */
  async generateFromRecommendation(recommendation) {
    if (!recommendation) {
      throw new Error('No recommendation provided. Run channel analysis first.');
    }

    this.logger.info(`Generating video for: "${recommendation.title}"`);

    // Build a strategy from the recommendation + channel data
    const strategy = {
      topic: recommendation.title,
      hook: recommendation.hook,
      targetEmotion: recommendation.targetEmotion,
      tags: recommendation.suggestedTags || [],
      channelProfile: this.channelData?.profile || {},
      viralTrends: this.channelData?.viralTrends || {},
      timestamp: new Date().toISOString()
    };

    const contentType = recommendation.contentType || 'short';

    // Generate script using the enriched strategy
    this.logger.info('Generating script...');
    const script = await this.agents.scriptWriter.generateScript(strategy, contentType);

    // Generate thumbnail
    this.logger.info('Generating thumbnail...');
    const thumbnail = await this.agents.thumbnail.generateThumbnail(strategy, script);

    return {
      success: true,
      recommendation,
      strategy,
      script,
      thumbnail,
      contentType
    };
  }

  /**
   * Full one-click automation: analyze channel -> pick best idea -> generate everything
   */
  async oneClickAutomate(channelUrl, videoIndex = 0) {
    this.logger.info('Starting one-click automation...');

    // Step 1: Research the channel
    const research = await this.researchAndRecommend(channelUrl);

    if (!research.recommendations || research.recommendations.length === 0) {
      throw new Error('No video recommendations generated. Try again.');
    }

    // Step 2: Pick the best recommendation
    const picked = research.recommendations[videoIndex] || research.recommendations[0];
    this.logger.info(`Selected idea: "${picked.title}" (viral score: ${picked.estimatedViralScore})`);

    // Step 3: Generate the video content
    const result = await this.generateFromRecommendation(picked);

    this.logger.success('One-click automation complete!');

    return {
      ...result,
      channelAnalysis: {
        channelName: research.channelName,
        niche: research.profile?.niche,
        competitorsFound: research.competitors?.length || 0,
        totalRecommendations: research.recommendations.length
      }
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
