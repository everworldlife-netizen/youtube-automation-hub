# YouTube Automation Hub 🎬

**Fully autonomous YouTube channel management system with AI-powered content creation, video generation, analytics, and scheduling.** Creates viral Shorts and longform videos with professional quality.

## ✨ Features

- **🤖 Fully Autonomous** - Creates, optimizes, and publishes videos 24/7 without manual intervention
- - **🎥 AI-Powered Content Creation** - Uses OpenAI GPT-4 + DALL-E 3 for high-quality scripts and thumbnails
  - - **📹 Professional Video Generation** - Integrates ai-mixed-cut for cinematic video production
    - - **📊 Intelligent Analytics** - Analyzes competitors, identifies trends, and provides performance insights
      - - **🎬 Multi-Format Support** - Creates both YouTube Shorts (15-60s) and longform videos (8-20 min)
        - - **📅 Smart Scheduling** - Automatically uploads at optimal times for maximum reach
          - - **🔍 SEO Optimization** - Generates keyword-optimized titles, descriptions, and tags
            - - **💰 Cost-Efficient** - Works with FREE Gemini API or premium OpenAI (your choice)
              - - **📱 Web Dashboard** - Real-time monitoring and control panel
                - - **🔌 REST API** - Full API for integration with other tools
                 
                  - ## 🚀 Quick Start
                 
                  - ### Prerequisites
                  - - Node.js 14+ and npm
                    - - YouTube API credentials
                      - - OpenAI API key OR Google Gemini API key
                       
                        - ### Installation
                       
                        - ```bash
                          # Clone the repository
                          git clone https://github.com/yourusername/youtube-automation-hub.git
                          cd youtube-automation-hub

                          # Install dependencies
                          npm install

                          # Create .env file from example
                          cp .env.example .env

                          # Edit .env with your API keys
                          nano .env

                          # Start the automation
                          npm start

                          # Or run CLI commands
                          npm run automation
                          ```

                          ## ⚙️ Configuration

                          Edit `.env` file with your settings:

                          ```env
                          # AI Provider (openai or gemini)
                          OPENAI_API_KEY=your_key_here
                          AI_PROVIDER=openai

                          # YouTube API
                          YOUTUBE_CLIENT_ID=your_id
                          YOUTUBE_CLIENT_SECRET=your_secret
                          YOUTUBE_REFRESH_TOKEN=your_token

                          # Automation
                          UPLOAD_SCHEDULE=daily
                          CONTENT_TYPE=short  # or 'long' or 'mixed'
                          AUTO_PUBLISH=true
                          ```

                          ## 📁 Project Structure

                          ```
                          src/
                          ├── core/
                          │   ├── YouTubeAutomationHub.js      # Main orchestrator
                          │   └── ConfigManager.js              # Configuration handler
                          ├── agents/
                          │   ├── ContentStrategyAgent.js        # Trend analysis & strategy
                          │   ├── ScriptWriterAgent.js           # Script generation
                          │   └── ThumbnailDesignAgent.js        # Thumbnail creation
                          ├── engines/
                          │   └── VideoGenerationEngine.js       # Video creation (FFmpeg + ai-mixed-cut)
                          ├── services/
                          │   ├── YouTubePublisher.js            # Upload & scheduling
                          │   ├── AnalyticsService.js            # Performance tracking
                          │   └── CompetitorAnalyzer.js          # Competitor research
                          ├── api/
                          │   └── DashboardAPI.js                # REST API & Dashboard
                          └── utils/
                              ├── FFmpegHelper.js                # Video processing utilities
                              └── APIHelper.js                   # API request helpers
                          ```

                          ## 🎯 Usage Examples

                          ### Generate a Single Video

                          ```javascript
                          const hub = new YouTubeAutomationHub();

                          const result = await hub.runFullPipeline('Best productivity tips for 2024', 'short');
                          // Returns: { success: true, videoId, videoUrl, ...metadata }
                          ```

                          ### Research Competitors

                          ```javascript
                          const competitors = await hub.analyzeCompetitors([
                            'https://www.youtube.com/@MrBeast',
                            'https://www.youtube.com/@MKBHD'
                          ]);
                          ```

                          ### Get Trending Topics

                          ```javascript
                          const trends = await hub.getTrendingTopics('technology');
                          // Returns: [{ title, searchVolume, competition, viralPotential }, ...]
                          ```

                          ### Schedule Batch Content

                          ```javascript
                          const topics = ['Topic 1', 'Topic 2', 'Topic 3'];
                          const schedule = [
                            new Date('2024-02-15 08:00'),
                            new Date('2024-02-16 12:00'),
                            new Date('2024-02-17 18:00')
                          ];

                          const results = await hub.scheduleBatch(topics, 'short', schedule);
                          ```

                          ### Start 24/7 Automation

                          ```javascript
                          // Auto-generates and uploads 3 videos per day
                          await hub.startAutomationMode();

                          // Later, stop when needed
                          hub.stopAutomationMode();
                          ```

                          ## 🌐 Dashboard

                          Access the web dashboard at `http://localhost:3000`

                          **Features:**
                          - Real-time video generation status
                          - - Analytics dashboard with performance metrics
                            - - Competitor analysis charts
                              - - Trending topics widget
                                - - Manual video generation forms
                                  - - Channel management
                                    - - Video scheduling calendar
                                     
                                      - ## 📊 API Endpoints
                                     
                                      - ### Dashboard Routes
                                      - - `GET /api/dashboard` - Dashboard data
                                        - - `GET /api/stats` - Channel statistics
                                          - - `POST /api/generate` - Generate single video
                                            - - `GET /api/analytics` - Performance analytics
                                              - - `GET /api/trends` - Trending topics
                                                - - `POST /api/schedule` - Schedule videos
                                                  - - `GET /api/videos` - List generated videos
                                                   
                                                    - ## 🎬 Supported Content Types
                                                   
                                                    - ### YouTube Shorts (Vertical)
                                                    - - Resolution: 1080x1920
                                                      - - Duration: 15-60 seconds
                                                        - - Frame rate: 30 fps
                                                          - - Format: H.264 MP4
                                                           
                                                            - ### Longform Videos (Horizontal)
                                                            - - Resolution: 1920x1080
                                                              - - Duration: 8-20 minutes
                                                                - - Frame rate: 30-60 fps
                                                                  - - Format: H.264/VP9 MP4
                                                                   
                                                                    - ## 💡 Key Integrations
                                                                   
                                                                    - ### AI Models
                                                                    - - **OpenAI GPT-4** - Content strategy & script writing
                                                                      - - **DALL-E 3** - Thumbnail generation
                                                                        - - **Google Gemini** - Free alternative for content (limited)
                                                                         
                                                                          - ### Video Processing
                                                                          - - **FFmpeg** - Video encoding & effects
                                                                            - - **ai-mixed-cut** - Professional video generation
                                                                              - - **MoviePy** - Video editing & composition
                                                                               
                                                                                - ### YouTube API
                                                                                - - YouTube Data API v3 - Uploads, scheduling, metadata
                                                                                  - - Analytics API - Performance tracking
                                                                                   
                                                                                    - ## 🔒 Security
                                                                                   
                                                                                    - - API keys stored in `.env` (gitignored)
                                                                                      - - No hardcoded credentials
                                                                                        - - HTTPS for all API calls
                                                                                          - - Rate limiting on API endpoints
                                                                                            - - Token refresh handling
                                                                                             
                                                                                              - ## 📈 Performance Tips
                                                                                             
                                                                                              - 1. **Use GPU Acceleration** - Enable NVIDIA NVENC for faster video rendering
                                                                                                2. 2. **Batch Processing** - Generate multiple videos in parallel
                                                                                                   3. 3. **Cache Trends** - Reuse trend data within 24 hours
                                                                                                      4. 4. **Optimize FFmpeg** - Use H.264 with preset=fast for balance
                                                                                                         5. 5. **Monitor Quotas** - Track API usage to avoid rate limits
                                                                                                           
                                                                                                            6. ## 🐛 Troubleshooting
                                                                                                           
                                                                                                            7. ### Videos not uploading?
                                                                                                            - Check YouTube API credentials in `.env`
                                                                                                            - - Verify channel access permissions
                                                                                                              - - Check daily upload quota
                                                                                                               
                                                                                                                - ### Poor video quality?
                                                                                                                - - Increase `QUALITY_PRESET` in `.env`
                                                                                                                  - - Check FFmpeg installation: `ffmpeg -version`
                                                                                                                    - - Ensure GPU drivers are updated
                                                                                                                    
                                                                                                                    ### Script generation too slow?
                                                                                                                    - Switch to faster model: `gpt-3.5-turbo`
                                                                                                                    - - Or use Gemini for instant results
                                                                                                                      - - Check API rate limits
                                                                                                                       
                                                                                                                        - ### Missing dependencies?
                                                                                                                        - ```bash
                                                                                                                          npm install
                                                                                                                          npm install -g ffmpeg
                                                                                                                          ```
                                                                                                                          
                                                                                                                          ## 📚 Complete Code Documentation
                                                                                                                          
                                                                                                                          See `IMPLEMENTATION.md` for detailed code walkthrough and examples.
                                                                                                                          
                                                                                                                          ## 🤝 Contributing
                                                                                                                          
                                                                                                                          Contributions welcome! Please:
                                                                                                                          1. Fork the repository
                                                                                                                          2. 2. Create feature branch (`git checkout -b feature/amazing-feature`)
                                                                                                                             3. 3. Commit changes (`git commit -m 'Add amazing feature'`)
                                                                                                                                4. 4. Push to branch (`git push origin feature/amazing-feature`)
                                                                                                                                   5. 5. Open Pull Request
                                                                                                                                     
                                                                                                                                      6. ## 📝 License
                                                                                                                                     
                                                                                                                                      7. MIT License - see LICENSE file for details
                                                                                                                                     
                                                                                                                                      8. ## ⚠️ Disclaimer
                                                                                                                                     
                                                                                                                                      9. This tool is for educational and legitimate YouTube content creation purposes. Users are responsible for:
                                                                                                                                      10. - Complying with YouTube Terms of Service
                                                                                                                                          - - Ensuring content doesn't violate copyright
                                                                                                                                            - - Disclosing automated content as required by law
                                                                                                                                              - - Following all applicable regulations
                                                                                                                                               
                                                                                                                                                - ## 📞 Support
                                                                                                                                               
                                                                                                                                                - - 📖 Documentation: See docs/ folder
                                                                                                                                                  - - 🐛 Issues: GitHub Issues
                                                                                                                                                  - 💬 Discussions: GitHub Discussions
                                                                                                                                                  - - 📧 Email: support@example.com
                                                                                                                                                   
                                                                                                                                                    - ## 🎉 Roadmap
                                                                                                                                                    
                                                                                                                                                    - [ ] Telegram bot control
                                                                                                                                                    - [ ] - [ ] Discord integration
                                                                                                                                                    - [ ] - [ ] Mobile app
                                                                                                                                                    - [ ] - [ ] TikTok/Instagram Reels support
                                                                                                                                                    - [ ] - [ ] Advanced A/B testing
                                                                                                                                                    - [ ] - [ ] Custom AI model support
                                                                                                                                                    - [ ] - [ ] Multi-language support
                                                                                                                                                    - [ ] Advanced editing templates
                                                                                                                                                   
                                                                                                                                                    - [ ] ---
                                                                                                                                                   
                                                                                                                                                    - [ ] **Made with ❤️ for content creators who want to scale**
