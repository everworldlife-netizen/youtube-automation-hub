/**
 * Channel Analyzer
 * Takes a YouTube channel URL and uses AI to research:
 * - Channel niche and style
 * - Content patterns and top-performing formats
 * - Competitors in the same niche
 * - Viral opportunities based on the channel's positioning
 */

const { createAIClient, getModel } = require('../utils/ai-client');

class ChannelAnalyzer {
  constructor(config) {
    this.config = config;
    this.client = createAIClient(config);
    this.model = getModel(config);
  }

  /**
   * Full channel analysis from just a URL
   */
  async analyzeChannel(channelUrl) {
    const channelName = this.extractChannelName(channelUrl);

    console.log(`Analyzing channel: ${channelName}...`);

    // Step 1: Determine niche, style, audience
    const profile = await this.buildChannelProfile(channelName);

    // Step 2: Find competitors
    const competitors = await this.findCompetitors(channelName, profile);

    // Step 3: Analyze what's going viral in this niche
    const viralTrends = await this.analyzeNicheVirals(profile);

    // Step 4: Generate content recommendations
    const recommendations = await this.generateRecommendations(
      channelName,
      profile,
      competitors,
      viralTrends
    );

    return {
      channelUrl,
      channelName,
      profile,
      competitors,
      viralTrends,
      recommendations,
      analyzedAt: new Date().toISOString()
    };
  }

  /**
   * Build channel profile - niche, style, audience, content patterns
   */
  async buildChannelProfile(channelName) {
    const prompt = `
      Analyze the YouTube channel "${channelName}".

      Research and provide:
      1. Primary niche/category
      2. Sub-niches they cover
      3. Content style (educational, entertainment, vlog, tutorial, etc.)
      4. Typical video format (talking head, screen recording, animation, b-roll heavy, etc.)
      5. Target audience demographics (age range, interests)
      6. Posting frequency
      7. Average video length
      8. What makes their content unique
      9. Their strongest content themes (what gets the most engagement)
      10. Weaknesses or content gaps they could fill

      Return as JSON:
      {
        "niche": "primary niche",
        "subNiches": ["sub1", "sub2"],
        "contentStyle": "style description",
        "videoFormat": "format description",
        "targetAudience": { "ageRange": "18-34", "interests": ["interest1"] },
        "postingFrequency": "frequency",
        "avgVideoLength": "length",
        "uniqueAngle": "what makes them different",
        "strongestThemes": ["theme1", "theme2"],
        "contentGaps": ["gap1", "gap2"]
      }
    `;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000
    });

    try {
      const text = response.choices[0].message.content;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: text };
    } catch {
      return { raw: response.choices[0].message.content };
    }
  }

  /**
   * Find competitor channels in the same niche
   */
  async findCompetitors(channelName, profile) {
    const prompt = `
      For the YouTube channel "${channelName}" in the "${profile.niche}" niche:

      Find their top 5-8 competitors on YouTube. For each competitor provide:
      1. Channel name
      2. Why they're a competitor (similar content/audience)
      3. Their subscriber range (approximate)
      4. What they do well (that ${channelName} could learn from)
      5. Content strategies they use that get high engagement

      Return as JSON array:
      [
        {
          "channelName": "name",
          "channelUrl": "https://youtube.com/@handle",
          "whyCompetitor": "reason",
          "subscriberRange": "100K-500K",
          "strengths": ["strength1", "strength2"],
          "topStrategies": ["strategy1", "strategy2"]
        }
      ]
    `;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1200
    });

    try {
      const text = response.choices[0].message.content;
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      return [];
    }
  }

  /**
   * Analyze what's going viral in this niche right now
   */
  async analyzeNicheVirals(profile) {
    const prompt = `
      For the YouTube niche "${profile.niche}" (sub-niches: ${(profile.subNiches || []).join(', ')}):

      Analyze current viral trends and patterns:
      1. What topics are blowing up right now?
      2. What video formats are getting the most views?
      3. What hooks/thumbnails are driving the most clicks?
      4. What's the ideal video length for viral content in this niche?
      5. What emotional triggers are working (curiosity, shock, FOMO, etc.)?
      6. What titles patterns are performing well?
      7. What are audiences hungry for that nobody is making yet?

      Return as JSON:
      {
        "hotTopics": ["topic1", "topic2", "topic3"],
        "viralFormats": ["format1", "format2"],
        "effectiveHooks": ["hook1", "hook2"],
        "idealLength": { "shorts": "seconds", "longform": "minutes" },
        "emotionalTriggers": ["trigger1", "trigger2"],
        "titlePatterns": ["pattern1", "pattern2"],
        "untappedOpportunities": ["opportunity1", "opportunity2"]
      }
    `;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000
    });

    try {
      const text = response.choices[0].message.content;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: text };
    } catch {
      return { raw: response.choices[0].message.content };
    }
  }

  /**
   * Generate specific video recommendations based on all research
   */
  async generateRecommendations(channelName, profile, competitors, viralTrends) {
    const prompt = `
      Based on this research for YouTube channel "${channelName}":

      Channel Profile: ${JSON.stringify(profile)}
      Competitors: ${JSON.stringify(competitors)}
      Viral Trends: ${JSON.stringify(viralTrends)}

      Generate 10 specific video ideas that would likely go viral for this channel.
      Each idea should:
      - Match the channel's style and audience
      - Leverage current viral trends
      - Fill content gaps competitors aren't covering
      - Have a strong hook and clickable title

      Return as JSON array:
      [
        {
          "title": "Clickable YouTube title",
          "hook": "First 3 seconds hook",
          "description": "Brief video concept",
          "whyItWillWork": "Reasoning based on research",
          "contentType": "short or long",
          "estimatedViralScore": 1-100,
          "targetEmotion": "curiosity/shock/inspiration/etc",
          "suggestedTags": ["tag1", "tag2", "tag3"]
        }
      ]

      Sort by estimatedViralScore (highest first).
    `;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 2000
    });

    try {
      const text = response.choices[0].message.content;
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      return [];
    }
  }

  /**
   * Extract channel name from URL
   */
  extractChannelName(url) {
    if (url.includes('/@')) {
      return url.split('/@')[1].split('/')[0].split('?')[0];
    }
    if (url.includes('/channel/')) {
      return url.split('/channel/')[1].split('/')[0];
    }
    if (url.includes('/c/')) {
      return url.split('/c/')[1].split('/')[0];
    }
    // If just a name was entered
    return url.replace('https://', '').replace('http://', '').replace('www.youtube.com/', '').trim();
  }
}

module.exports = ChannelAnalyzer;
