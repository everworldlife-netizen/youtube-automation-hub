/**
 * Thumbnail Design Agent
 * Generates eye-catching thumbnails using AI image generation
 */

const { createAIClient, getModel } = require('../utils/ai-client');
const fs = require('fs');
const path = require('path');

class ThumbnailDesignAgent {
  constructor(config) {
    this.config = config;
    this.client = createAIClient(config);
    this.model = getModel(config);
    this.outputDir = config.videoOutputDir || './videos';
  }

  /**
   * Generate thumbnail for video
   */
  async generateThumbnail(strategy, script) {
    try {
      // Generate thumbnail concept using GPT
      const concept = await this.generateConcept(strategy, script);

      // Generate image using DALL-E
      const imagePath = await this.generateImage(concept, script.title);

      return {
        path: imagePath,
        concept,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Thumbnail generation failed:', error);
      return {
        path: null,
        concept: null,
        error: error.message
      };
    }
  }

  /**
   * Generate thumbnail concept description
   */
  async generateConcept(strategy, script) {
    const conceptPrompt = `
      Design a YouTube thumbnail concept for:
      Title: "${script.title}"
      Topic: "${strategy.topic}"

      Requirements:
      - Eye-catching and clickable
      - High contrast colors
      - Clear text overlay (max 4 words)
      - Emotional expression or reaction
      - 1280x720 resolution optimized

      Return as JSON:
      {
        "imageDescription": "Detailed DALL-E prompt",
        "textOverlay": "Short text for thumbnail",
        "colorScheme": ["color1", "color2"],
        "style": "thumbnail style description",
        "emotionalTone": "excitement/shock/curiosity/etc"
      }
    `;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: conceptPrompt }],
      temperature: 0.8,
      max_tokens: 400
    });

    try {
      return JSON.parse(response.choices[0].message.content);
    } catch {
      return {
        imageDescription: `Eye-catching YouTube thumbnail for: ${script.title}`,
        textOverlay: script.title.split(' ').slice(0, 4).join(' '),
        colorScheme: ['#FF0000', '#FFFFFF'],
        style: 'bold and vibrant',
        emotionalTone: 'excitement'
      };
    }
  }

  /**
   * Generate image using DALL-E (OpenAI only) or fallback to ImageMagick
   */
  async generateImage(concept, title) {
    const outputPath = path.join(this.outputDir, `thumbnail_${Date.now()}.png`);

    // DALL-E is only available with OpenAI provider
    if (this.config.aiProvider === 'gemini') {
      return this.generateFallbackThumbnail(concept, title, outputPath);
    }

    try {
      const response = await this.client.images.generate({
        model: 'dall-e-3',
        prompt: `YouTube thumbnail, 1280x720, ${concept.imageDescription}. Style: ${concept.style}. Vibrant, high contrast, professional.`,
        n: 1,
        size: '1792x1024',
        quality: 'hd'
      });

      const imageUrl = response.data[0].url;
      await this.downloadImage(imageUrl, outputPath);

      console.log(`Thumbnail generated: ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error('DALL-E image generation failed:', error);
      return this.generateFallbackThumbnail(concept, title, outputPath);
    }
  }

  /**
   * Fallback thumbnail using ImageMagick (when DALL-E is unavailable)
   */
  generateFallbackThumbnail(concept, title, outputPath) {
    try {
      const { execSync } = require('child_process');
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const text = (concept.textOverlay || title || 'Untitled').replace(/"/g, '\\"');
      const command = [
        'convert -size 1280x720',
        'xc:#1a1a2e',
        '-fill white',
        '-gravity center',
        '-pointsize 48',
        `-annotate +0+0 "${text}"`,
        `"${outputPath}"`
      ].join(' ');

      execSync(command, { stdio: 'ignore' });
      console.log(`Fallback thumbnail generated: ${outputPath}`);
      return outputPath;
    } catch {
      console.warn('Fallback thumbnail generation failed');
      return null;
    }
  }

  /**
   * Download image from URL to local file
   */
  async downloadImage(url, outputPath) {
    const https = require('https');

    return new Promise((resolve, reject) => {
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const file = fs.createWriteStream(outputPath);
      https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      }).on('error', (err) => {
        fs.unlink(outputPath, () => {});
        reject(err);
      });
    });
  }

  /**
   * Generate multiple thumbnail variations
   */
  async generateVariations(strategy, script, count = 3) {
    const variations = [];

    for (let i = 0; i < count; i++) {
      const thumbnail = await this.generateThumbnail(strategy, script);
      variations.push(thumbnail);
    }

    return variations;
  }
}

module.exports = ThumbnailDesignAgent;
