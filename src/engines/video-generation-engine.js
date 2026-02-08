/**
 * Video Generation Engine
 * Integrates with ai-mixed-cut for professional video creation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class VideoGenerationEngine {
  constructor(config) {
    this.config = config;
    this.outputDir = config.videoOutputDir || './videos';
    this.tempDir = config.tempDir || './temp';

    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.outputDir, this.tempDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Generate professional video using FFmpeg + effects
   */
  async generateVideo(options) {
    const {
      script,
      contentType
    } = options;

    try {
      console.log('Generating video with professional effects...');

      // Step 1: Generate audio from script
      const audioPath = await this.generateAudio(script.voiceoverScript);

      // Step 2: Create video base
      const videoPath = await this.createVideoBase(
        audioPath,
        script,
        contentType
      );

      // Step 3: Add effects (cinema, transitions)
      const effectsPath = await this.addCinematicEffects(videoPath, contentType);

      // Step 4: Add subtitles
      const finalPath = await this.addSubtitles(effectsPath, script);

      return finalPath;
    } catch (error) {
      console.error('Video generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate audio using Text-to-Speech
   */
  async generateAudio(script) {
    const audioPath = path.join(this.tempDir, `audio_${Date.now()}.mp3`);

    try {
      const sanitizedScript = script.replace(/"/g, '\\"');
      const command = `edge-tts --text "${sanitizedScript}" --write-media "${audioPath}" --voice en-US-AriaNeural`;

      execSync(command, { stdio: 'ignore' });

      console.log(`Audio generated: ${audioPath}`);
      return audioPath;
    } catch (error) {
      console.error('Audio generation failed:', error);
      throw error;
    }
  }

  /**
   * Create video base structure
   */
  async createVideoBase(audioPath, script, contentType) {
    const videoPath = path.join(this.outputDir, `video_${Date.now()}.mp4`);

    const width = contentType === 'short' ? 1080 : 1920;
    const height = contentType === 'short' ? 1920 : 1080;
    const duration = script.estimatedDuration || 60;

    try {
      const command = [
        'ffmpeg',
        `-f lavfi -i color=c=black:s=${width}x${height}:d=${duration}`,
        `-i "${audioPath}"`,
        '-c:v libx264 -c:a aac',
        '-pix_fmt yuv420p',
        `-shortest "${videoPath}" -y`
      ].join(' ');

      execSync(command, { stdio: 'ignore' });
      console.log(`Video base created: ${videoPath}`);
      return videoPath;
    } catch (error) {
      console.error('Video base creation failed:', error);
      throw error;
    }
  }

  /**
   * Add cinematic effects (color grading, transitions, overlays)
   */
  async addCinematicEffects(videoPath, contentType) {
    const effectsPath = path.join(this.tempDir, `effects_${Date.now()}.mp4`);

    const width = contentType === 'short' ? 1080 : 1920;
    const height = contentType === 'short' ? 1920 : 1080;

    const effects = [
      `scale=${width}:${height}:force_original_aspect_ratio=decrease:flags=lanczos`,
      `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`,
      'eq=brightness=0.06:contrast=1.1',
      'hue=s=1.2'
    ];

    try {
      const filterComplex = effects.join(',');
      const command = [
        'ffmpeg',
        `-i "${videoPath}"`,
        `-vf "${filterComplex}"`,
        '-c:a copy',
        `"${effectsPath}" -y`
      ].join(' ');

      execSync(command, { stdio: 'ignore' });
      console.log(`Effects added: ${effectsPath}`);
      return effectsPath;
    } catch (error) {
      console.error('Effects addition failed:', error);
      throw error;
    }
  }

  /**
   * Add subtitles to video
   */
  async addSubtitles(videoPath, script) {
    const finalPath = path.join(this.outputDir, `final_${Date.now()}.mp4`);
    const srtPath = path.join(this.tempDir, `subtitles_${Date.now()}.srt`);

    try {
      const srt = this.generateSRTFile(script);
      fs.writeFileSync(srtPath, srt);

      const escapedSrtPath = srtPath.replace(/'/g, "'\\''");
      const command = [
        'ffmpeg',
        `-i "${videoPath}"`,
        `-vf "subtitles='${escapedSrtPath}':force_style='FontSize=20,PrimaryColour=&H00FFFFFF&'"`,
        '-c:a copy',
        `"${finalPath}" -y`
      ].join(' ');

      execSync(command, { stdio: 'ignore' });
      console.log(`Subtitles added: ${finalPath}`);
      return finalPath;
    } catch (error) {
      console.error('Subtitle addition failed:', error);
      throw error;
    }
  }

  /**
   * Generate SRT subtitle file
   */
  generateSRTFile(script) {
    const text = script.voiceoverScript || '';
    const lines = text.split('.').filter(line => line.trim().length > 0);
    const wordsPerSecond = 2.5;
    let timeIndex = 0;
    let srtContent = '';

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const words = trimmed.split(' ').length;
      const duration = words / wordsPerSecond;

      const startTime = this.formatTime(timeIndex);
      const endTime = this.formatTime(timeIndex + duration);

      srtContent += `${index + 1}\n`;
      srtContent += `${startTime} --> ${endTime}\n`;
      srtContent += `${trimmed}\n\n`;

      timeIndex += duration;
    });

    return srtContent;
  }

  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  }

  /**
   * Generate thumbnail using ImageMagick
   */
  async generateThumbnail(script) {
    const thumbnailPath = path.join(this.outputDir, `thumbnail_${Date.now()}.png`);

    try {
      const sanitizedTitle = (script.title || 'Untitled').replace(/"/g, '\\"');
      const command = [
        'convert -size 1280x720',
        'xc:black',
        '-fill white',
        '-gravity center',
        '-pointsize 48',
        `-annotate +0+0 "${sanitizedTitle}"`,
        `"${thumbnailPath}"`
      ].join(' ');

      execSync(command, { stdio: 'ignore' });
      return thumbnailPath;
    } catch (error) {
      console.warn('Thumbnail generation failed, using default');
      return null;
    }
  }
}

module.exports = VideoGenerationEngine;
