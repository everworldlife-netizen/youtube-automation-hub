/**
 * Config Manager
 * Loads and manages configuration from file and environment variables
 */

const fs = require('fs');
const path = require('path');

class ConfigManager {
  /**
   * Load configuration from file and environment variables
   */
  static load(configPath) {
    let fileConfig = {};

    // Try loading config file
    const resolvedPath = configPath
      ? path.resolve(configPath)
      : path.resolve(__dirname, '../../config/automation.config.json');

    if (fs.existsSync(resolvedPath)) {
      try {
        const raw = fs.readFileSync(resolvedPath, 'utf8');
        fileConfig = JSON.parse(raw);
      } catch (error) {
        console.warn(`Failed to parse config file: ${resolvedPath}`, error.message);
      }
    }

    // Merge with environment variables (env vars take precedence)
    const config = {
      // AI Provider
      aiProvider: process.env.AI_PROVIDER || fileConfig.aiProvider || 'openai',
      openaiKey: process.env.OPENAI_API_KEY || fileConfig.openaiKey || '',
      googleApiKey: process.env.GOOGLE_API_KEY || fileConfig.googleApiKey || '',

      // YouTube OAuth
      youtubeClientId: process.env.YOUTUBE_CLIENT_ID || fileConfig.youtubeClientId || '',
      youtubeClientSecret: process.env.YOUTUBE_CLIENT_SECRET || fileConfig.youtubeClientSecret || '',
      youtubeRefreshToken: process.env.YOUTUBE_REFRESH_TOKEN || fileConfig.youtubeRefreshToken || '',
      youtubeAuth: fileConfig.youtubeAuth || null,

      // Automation settings
      uploadSchedule: process.env.UPLOAD_SCHEDULE || fileConfig.uploadSchedule || 'daily',
      contentType: process.env.CONTENT_TYPE || fileConfig.contentType || 'short',
      autoPublish: (process.env.AUTO_PUBLISH === 'true') || fileConfig.autoPublish || false,
      defaultPublic: (process.env.AUTO_PUBLISH === 'true') || fileConfig.defaultPublic || false,

      // Video settings
      videoOutputDir: process.env.VIDEO_OUTPUT_DIR || fileConfig.videoOutputDir || './videos',
      tempDir: process.env.TEMP_DIR || fileConfig.tempDir || './temp',
      maxVideoLength: parseInt(process.env.MAX_VIDEO_LENGTH, 10) || fileConfig.maxVideoLength || 60,
      qualityPreset: process.env.QUALITY_PRESET || fileConfig.qualityPreset || 'high',

      // Channel configuration
      primaryChannelId: process.env.PRIMARY_CHANNEL_ID || fileConfig.primaryChannelId || '',
      channels: fileConfig.channels || {},

      // Logging
      logLevel: process.env.LOG_LEVEL || fileConfig.logLevel || 'info',
      logFile: process.env.LOG_FILE || fileConfig.logFile || './logs/automation.log',

      // Analytics
      enableAnalytics: (process.env.ENABLE_ANALYTICS !== 'false') && (fileConfig.enableAnalytics !== false),
      analyticsReportInterval: parseInt(process.env.ANALYTICS_REPORT_INTERVAL, 10) || fileConfig.analyticsReportInterval || 7,

      // Webhook
      webhookUrl: process.env.WEBHOOK_URL || fileConfig.webhookUrl || '',

      // Stats tracking
      videosGenerated: fileConfig.videosGenerated || 0,
      videosPublished: fileConfig.videosPublished || 0,
      totalViews: fileConfig.totalViews || 0,
      avgEngagement: fileConfig.avgEngagement || 0,
      lastUpload: fileConfig.lastUpload || null
    };

    return config;
  }

  /**
   * Save configuration to file
   */
  static save(config, configPath) {
    const resolvedPath = configPath
      ? path.resolve(configPath)
      : path.resolve(__dirname, '../../config/automation.config.json');

    const dir = path.dirname(resolvedPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(resolvedPath, JSON.stringify(config, null, 2));
    console.log(`Config saved to ${resolvedPath}`);
  }

  /**
   * Validate required configuration
   */
  static validate(config) {
    const issues = [];

    if (!config.openaiKey && config.aiProvider === 'openai') {
      issues.push('OPENAI_API_KEY is required when using OpenAI provider');
    }

    if (!config.googleApiKey && config.aiProvider === 'gemini') {
      issues.push('GOOGLE_API_KEY is required when using Gemini provider');
    }

    if (!config.youtubeClientId || !config.youtubeClientSecret) {
      issues.push('YouTube OAuth credentials (YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET) are required for publishing');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}

module.exports = ConfigManager;
