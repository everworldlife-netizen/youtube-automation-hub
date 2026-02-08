/**
 * Script Writer Agent
 * Generates engaging, optimized video scripts
 */

const { createAIClient, getModel } = require('../utils/ai-client');

class ScriptWriterAgent {
  constructor(config) {
    this.config = config;
    this.client = createAIClient(config);
    this.model = getModel(config);
  }

  /**
   * Generate video script
   */
  async generateScript(strategy, contentType = 'short') {
    const lengthConfig = {
      short: { minWords: 150, maxWords: 300, duration: 60 },
      medium: { minWords: 500, maxWords: 1000, duration: 300 },
      long: { minWords: 2000, maxWords: 4000, duration: 1200 }
    };

    const config = lengthConfig[contentType] || lengthConfig.short;

    const scriptPrompt = `
      Create a viral YouTube ${contentType} video script for: "${strategy.topic}"

      Strategy Details:
      ${JSON.stringify(strategy, null, 2)}

      Requirements:
      - ${config.minWords}-${config.maxWords} words
      - ${config.duration} seconds of content
      - Start with a POWERFUL HOOK (first 3 seconds critical)
      - Use storytelling techniques
      - Include clear call-to-action at end
      - Optimize for retention (keep viewers watching)
      - Add natural pauses for breathing
      - Include visual cues (e.g., [CUT TO:], [SHOW:])

      Format as JSON with:
      {
        "hook": "First 15 seconds",
        "mainContent": ["section1", "section2", ...],
        "callToAction": "Final CTA",
        "visualCues": ["cue1", "cue2", ...],
        "voiceoverScript": "Full script",
        "title": "SEO-optimized title",
        "description": "YouTube description",
        "tags": ["tag1", "tag2", ...],
        "estimatedDuration": seconds,
        "keyMessages": ["msg1", "msg2", ...]
      }
    `;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: scriptPrompt }],
      temperature: 0.8,
      max_tokens: 2000
    });

    try {
      const parsed = JSON.parse(response.choices[0].message.content);
      return {
        contentType,
        generatedAt: new Date().toISOString(),
        ...parsed
      };
    } catch {
      return {
        contentType,
        voiceoverScript: response.choices[0].message.content,
        title: strategy.topic,
        description: `Video about ${strategy.topic}`,
        tags: strategy.tags || [],
        estimatedDuration: config.duration
      };
    }
  }

  /**
   * Optimize script for SEO
   */
  async optimizeForSEO(script, keywords = []) {
    const optimizationPrompt = `
      Optimize this YouTube script for SEO:

      Current Script: ${JSON.stringify(script)}
      Target Keywords: ${keywords.join(', ')}

      Provide:
      1. Improved title (60 chars max)
      2. SEO-optimized description (5000 chars)
      3. Best hashtags (3-5)
      4. Updated tags
      5. Keyword placement recommendations

      Return as JSON.
    `;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: optimizationPrompt }],
      temperature: 0.6,
      max_tokens: 800
    });

    try {
      return JSON.parse(response.choices[0].message.content);
    } catch {
      return { optimized: response.choices[0].message.content };
    }
  }

  /**
   * Generate multiple script variations
   */
  async generateVariations(strategy, count = 3) {
    const variations = [];

    for (let i = 0; i < count; i++) {
      const script = await this.generateScript(strategy);
      variations.push(script);
    }

    return variations;
  }

  /**
   * A/B test script variants
   */
  async testVariants(variant1, variant2) {
    const testPrompt = `
      Compare these two YouTube scripts and predict which will perform better:

      Variant 1: ${JSON.stringify(variant1)}
      Variant 2: ${JSON.stringify(variant2)}

      Analyze:
      1. Hook effectiveness
      2. Retention probability
      3. Engagement potential
      4. CTA clarity
      5. Overall viral potential (1-100)

      Recommend the winner with reasoning.
    `;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: testPrompt }],
      temperature: 0.5,
      max_tokens: 600
    });

    return response.choices[0].message.content;
  }
}

module.exports = ScriptWriterAgent;
