/**
 * Analytics Service
 * Tracks performance and provides insights
 */

const { google } = require('googleapis');

class AnalyticsService {
  constructor(config) {
    this.config = config;
    this.youtubeAnalytics = null;

    this.initClient();
  }

  initClient() {
    try {
      if (this.config.youtubeAuth) {
        this.youtubeAnalytics = google.youtubeAnalytics({
          version: 'v2',
          auth: this.config.youtubeAuth
        });
      }
    } catch (error) {
      console.warn('YouTube Analytics client initialization deferred');
    }
  }

  /**
   * Analyze competitor channels
   */
  async analyzeCompetitors(channelUrls) {
    const competitors = [];

    for (const url of channelUrls) {
      const channelId = this.extractChannelId(url);
      const stats = await this.getChannelStats(channelId);
      competitors.push({
        url,
        channelId,
        ...stats
      });
    }

    return competitors;
  }

  /**
   * Get channel statistics
   */
  async getChannelStats(channelId) {
    if (!this.youtubeAnalytics) {
      return { error: 'Analytics client not configured' };
    }

    try {
      const response = await this.youtubeAnalytics.reports.query({
        ids: `channel==${channelId}`,
        startDate: this.getDateString(30),
        endDate: this.getDateString(0),
        metrics: 'views,estimatedMinutesWatched,averageViewDuration,subscribersGained'
      });

      const data = response.data.rows?.[0] || [];
      return {
        views: data[0] || 0,
        watchTime: data[1] || 0,
        avgDuration: data[2] || 0,
        newSubscribers: data[3] || 0
      };
    } catch (error) {
      console.error('Failed to get channel stats:', error);
      return {};
    }
  }

  /**
   * Get video performance metrics
   */
  async getVideoMetrics(videoId) {
    if (!this.youtubeAnalytics) {
      return { error: 'Analytics client not configured' };
    }

    try {
      const response = await this.youtubeAnalytics.reports.query({
        ids: `channel==MINE`,
        filters: `video==${videoId}`,
        startDate: this.getDateString(90),
        endDate: this.getDateString(0),
        metrics: 'views,estimatedMinutesWatched,averageViewDuration,likes,shares,comments'
      });

      const data = response.data.rows?.[0] || [];
      return {
        views: data[0] || 0,
        watchTime: data[1] || 0,
        avgDuration: data[2] || 0,
        likes: data[3] || 0,
        shares: data[4] || 0,
        comments: data[5] || 0,
        engagementRate: this.calculateEngagement(data)
      };
    } catch (error) {
      console.error('Failed to get video metrics:', error);
      return {};
    }
  }

  /**
   * Calculate engagement rate
   */
  calculateEngagement(metrics) {
    const views = metrics[0] || 1;
    const likes = metrics[3] || 0;
    const shares = metrics[4] || 0;
    const comments = metrics[5] || 0;
    const engagement = (likes + shares + comments) / views;
    return (engagement * 100).toFixed(2);
  }

  /**
   * Get date string for analytics queries
   */
  getDateString(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  }

  /**
   * Extract channel ID from URL
   */
  extractChannelId(url) {
    if (url.includes('/channel/')) {
      return url.split('/channel/')[1].split('/')[0];
    }
    if (url.includes('/@')) {
      return url.split('/@')[1].split('/')[0];
    }
    return url;
  }

  /**
   * Generate performance report
   */
  async generateReport(videoIds = []) {
    const report = {
      generatedAt: new Date().toISOString(),
      videos: []
    };

    for (const videoId of videoIds) {
      const metrics = await this.getVideoMetrics(videoId);
      report.videos.push({
        videoId,
        ...metrics
      });
    }

    // Compute summary
    if (report.videos.length > 0) {
      const totalViews = report.videos.reduce((sum, v) => sum + (v.views || 0), 0);
      const totalLikes = report.videos.reduce((sum, v) => sum + (v.likes || 0), 0);
      const avgEngagement = report.videos.reduce(
        (sum, v) => sum + parseFloat(v.engagementRate || 0), 0
      ) / report.videos.length;

      report.summary = {
        totalVideos: report.videos.length,
        totalViews,
        totalLikes,
        avgEngagementRate: avgEngagement.toFixed(2)
      };
    }

    return report;
  }

  /**
   * Identify trending content patterns
   */
  async identifyTrends(videoIds) {
    const trends = {
      topPerformers: [],
      commonPatterns: {},
      opportunities: []
    };

    const allMetrics = [];
    for (const videoId of videoIds) {
      const metrics = await this.getVideoMetrics(videoId);
      allMetrics.push({ videoId, ...metrics });
    }

    // Sort by engagement
    allMetrics.sort((a, b) => parseFloat(b.engagementRate || 0) - parseFloat(a.engagementRate || 0));
    trends.topPerformers = allMetrics.slice(0, 5);

    // Analyze patterns
    if (allMetrics.length > 0) {
      const avgViews = allMetrics.reduce((sum, m) => sum + (m.views || 0), 0) / allMetrics.length;
      const avgEngagement = allMetrics.reduce(
        (sum, m) => sum + parseFloat(m.engagementRate || 0), 0
      ) / allMetrics.length;

      trends.commonPatterns = {
        averageViews: Math.round(avgViews),
        averageEngagement: avgEngagement.toFixed(2),
        totalVideosAnalyzed: allMetrics.length
      };

      // Identify opportunities - videos with high engagement but low views
      trends.opportunities = allMetrics.filter(
        m => parseFloat(m.engagementRate || 0) > avgEngagement && (m.views || 0) < avgViews
      ).map(m => ({
        videoId: m.videoId,
        engagementRate: m.engagementRate,
        views: m.views,
        recommendation: 'High engagement but low views - consider promoting this content'
      }));
    }

    return trends;
  }
}

module.exports = AnalyticsService;
