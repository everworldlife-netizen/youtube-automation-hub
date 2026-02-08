/**
 * YouTube Publisher Service
 * Handles uploads, scheduling, and channel management
 */

const { google } = require('googleapis');
const fs = require('fs');

class YouTubePublisher {
  constructor(config) {
    this.config = config;
    this.youtube = null;

    this.initClient();
  }

  initClient() {
    try {
      const auth = this.config.youtubeAuth || this.createOAuth2Client();
      this.youtube = google.youtube({
        version: 'v3',
        auth
      });
    } catch (error) {
      console.warn('YouTube client initialization deferred - auth not configured');
    }
  }

  createOAuth2Client() {
    const clientId = this.config.youtubeClientId || process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = this.config.youtubeClientSecret || process.env.YOUTUBE_CLIENT_SECRET;
    const refreshToken = this.config.youtubeRefreshToken || process.env.YOUTUBE_REFRESH_TOKEN;

    if (!clientId || !clientSecret) {
      return null;
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'http://localhost:3000/oauth2callback'
    );

    if (refreshToken) {
      oauth2Client.setCredentials({ refresh_token: refreshToken });
    }

    return oauth2Client;
  }

  /**
   * Upload video to YouTube
   */
  async upload(options) {
    const {
      videoPath,
      title,
      description,
      tags,
      thumbnail,
      isPublic = false
    } = options;

    if (!this.youtube) {
      throw new Error('YouTube client not initialized. Configure OAuth2 credentials.');
    }

    try {
      console.log('Uploading video to YouTube...');

      const fileSize = fs.statSync(videoPath).size;

      const response = await this.youtube.videos.insert(
        {
          part: 'snippet,status',
          requestBody: {
            snippet: {
              title: title,
              description: description,
              tags: tags,
              categoryId: '24'
            },
            status: {
              privacyStatus: isPublic ? 'public' : 'private',
              selfDeclaredMadeForKids: false
            }
          },
          media: {
            body: fs.createReadStream(videoPath)
          }
        },
        {
          onUploadProgress: (event) => {
            const progress = Math.round((event.bytesRead / fileSize) * 100);
            console.log(`Upload progress: ${progress}%`);
          }
        }
      );

      const videoId = response.data.id;
      console.log(`Video uploaded! ID: ${videoId}`);

      if (thumbnail && fs.existsSync(thumbnail)) {
        await this.uploadThumbnail(videoId, thumbnail);
      }

      return {
        success: true,
        videoId: videoId,
        videoUrl: `https://youtube.com/watch?v=${videoId}`
      };
    } catch (error) {
      console.error('Video upload failed:', error);
      throw error;
    }
  }

  /**
   * Upload custom thumbnail
   */
  async uploadThumbnail(videoId, thumbnailPath) {
    try {
      await this.youtube.thumbnails.set({
        videoId: videoId,
        media: {
          body: fs.createReadStream(thumbnailPath)
        }
      });
      console.log('Thumbnail uploaded successfully');
    } catch (error) {
      console.warn('Thumbnail upload failed:', error.message);
    }
  }

  /**
   * Schedule video upload
   */
  async scheduleUpload(videoId, publishAt) {
    try {
      const publishDate = publishAt instanceof Date ? publishAt : new Date(publishAt);

      await this.youtube.videos.update({
        part: 'status',
        requestBody: {
          id: videoId,
          status: {
            publishAt: publishDate.toISOString(),
            privacyStatus: 'private'
          }
        }
      });
      console.log(`Video scheduled for ${publishDate.toISOString()}`);
    } catch (error) {
      console.error('Scheduling failed:', error);
      throw error;
    }
  }

  /**
   * Get video statistics
   */
  async getStats(videoId) {
    try {
      const response = await this.youtube.videos.list({
        part: 'statistics,snippet',
        id: videoId
      });

      const video = response.data.items[0];
      if (!video) {
        throw new Error(`Video not found: ${videoId}`);
      }

      return {
        title: video.snippet.title,
        views: parseInt(video.statistics.viewCount, 10) || 0,
        likes: parseInt(video.statistics.likeCount, 10) || 0,
        comments: parseInt(video.statistics.commentCount, 10) || 0
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      throw error;
    }
  }

  /**
   * Create playlist
   */
  async createPlaylist(title, description) {
    try {
      const response = await this.youtube.playlists.insert({
        part: 'snippet,status',
        requestBody: {
          snippet: {
            title: title,
            description: description
          },
          status: {
            privacyStatus: 'public'
          }
        }
      });

      return response.data.id;
    } catch (error) {
      console.error('Playlist creation failed:', error);
      throw error;
    }
  }

  /**
   * Add video to playlist
   */
  async addToPlaylist(playlistId, videoId) {
    try {
      await this.youtube.playlistItems.insert({
        part: 'snippet',
        requestBody: {
          snippet: {
            playlistId: playlistId,
            resourceId: {
              kind: 'youtube#video',
              videoId: videoId
            }
          }
        }
      });
      console.log('Video added to playlist');
    } catch (error) {
      console.error('Failed to add video to playlist:', error);
      throw error;
    }
  }
}

module.exports = YouTubePublisher;
