/**
 * Content Strategy Agent
 * Analyzes YouTube trends, researches niches, identifies viral patterns
 */

const OpenAI = require('openai');

class ContentStrategyAgent {
  constructor(config) {
    this.config = config;
    const apiKey = config.openaiKey || process.env.OPENAI_API_KEY;
    this.client = apiKey ? new OpenAI({ apiKey }) : null;
  }

  /**
   * Analyze topic and generate strategy
   */
  async analyze(topic, contentType = 'short') {
    try {
      // 1. Get YouTube trending data
      const trendData = await this.getYouTubeTrends(topic);

      // 2. Analyze competitor content
      const competitorAnalysis = await this.analyzeCompetitors(topic);

      // 3. Identify viral patterns
      const viralPatterns = this.identifyViralPatterns(topic, contentType);

      // 4. Generate strategic recommendations using AI
      const strategy = await this.generateStrategy(
        topic,
        trendData,
        competitorAnalysis,
        viralPatterns
      );

      return strategy;
    } catch (error) {
      console.error('Strategy analysis failed:', error);
      throw error;
    }
  }

  /**
   * Get YouTube trends for niche
   */
  async getYouTubeTrends(topic) {
    const trendPrompt = `
      Analyze YouTube trends for topic: "${topic}"
      Provide:
      1. Current trending angles
      2. Viral video characteristics
      3. Popular video lengths
      4. Best posting times
      5. Engagement hooks

      Return as JSON.
    `;

    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: trendPrompt }],
      temperature: 0.7,
      max_tokens: 500
    });

    try {
      return JSON.parse(response.choices[0].message.content);
    } catch {
      return { raw: response.choices[0].message.content };
    }
  }

  /**
   * Analyze competitor channels
   */
  async analyzeCompetitors(topic) {
    const analysisPrompt = `
      Based on successful "${topic}" content creators, analyze:
      1. Content structure
      2. Video hooks (first 3 seconds)
      3. Call-to-action patterns
      4. Thumbnail strategies
      5. Optimal video length

      Return as JSON.
    `;

    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: analysisPrompt }],
      temperature: 0.7,
      max_tokens: 500
    });

    try {
      return JSON.parse(response.choices[0].message.content);
    } catch {
      return { raw: response.choices[0].message.content };
    }
  }

  /**
   * Identify viral patterns
   */
  identifyViralPatterns(topic, contentType) {
    const patterns = {
      hooks: [
        'Start with shocking fact',
        'Ask intriguing question',
        'Show incredible result',
        'Demonstrate problem',
        'Tell unexpected story'
      ],
      structures: {
        short: ['hook', 'problem', 'solution', 'result', 'cta'],
        medium: ['hook', 'intro', 'problem', 'solution1', 'solution2', 'result', 'cta'],
        long: ['hook', 'intro', 'problem', 'context', 'solution1', 'solution2', 'solution3', 'result', 'cta']
      },
      pacing: {
        short: 'Fast cuts every 2-3 seconds',
        medium: 'Balanced cuts every 3-5 seconds',
        long: 'Varied pacing with 2-10 second segments'
      }
    };

    return {
      hooks: patterns.hooks,
      structure: patterns.structures[contentType] || patterns.structures.short,
      pacing: patterns.pacing[contentType] || patterns.pacing.short
    };
  }

  /**
   * Generate comprehensive strategy
   */
  async generateStrategy(topic, trendData, competitorAnalysis, viralPatterns) {
    const strategyPrompt = `
      Create a YouTube content strategy for: "${topic}"

      Trend Data: ${JSON.stringify(trendData)}
      Competitor Analysis: ${JSON.stringify(competitorAnalysis)}

      Generate:
      1. Recommended video angles (top 3)
      2. Target audience
      3. Optimal posting schedule
      4. Hashtag strategy
      5. Thumbnail style recommendations
      6. SEO keywords

      Return as detailed JSON.
    `;

    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: strategyPrompt }],
      temperature: 0.7,
      max_tokens: 800
    });

    try {
      const parsed = JSON.parse(response.choices[0].message.content);
      return {
        topic,
        timestamp: new Date().toISOString(),
        ...parsed,
        viralPatterns
      };
    } catch {
      return { topic, raw: response.choices[0].message.content };
    }
  }

  /**
   * Get trending topics
   */
  async getTrendingTopics(niche = 'general', count = 10) {
    const trendingPrompt = `
      Get top ${count} trending topics in the "${niche}" niche on YouTube right now.
      Consider:
      1. Search volume
      2. Competition level
      3. Potential viral factors
      4. Seasonal relevance

      Return as JSON array with: title, searchVolume, competition, viralPotential
    `;

    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: trendingPrompt }],
      temperature: 0.5,
      max_tokens: 1000
    });

    try {
      const text = response.choices[0].message.content;
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      return [];
    }
  }
}

module.exports = ContentStrategyAgent;
