# Getting Started with YouTube Automation Hub

## Step 1: Prerequisites

### System Requirements
- **Node.js** 14.0.0 or higher
- - **npm** 6.0.0 or higher
  - - **FFmpeg** 4.0 or higher
    - - **Git** for cloning the repository
     
      - ### Install System Dependencies
     
      - **macOS:**
      - ```bash
        brew install node ffmpeg git
        ```

        **Windows:**
        - Download Node.js from https://nodejs.org/
        - - Download FFmpeg from https://ffmpeg.org/download.html
          - - Download Git from https://git-scm.com/
           
            - **Linux (Ubuntu/Debian):**
            - ```bash
              sudo apt-get update
              sudo apt-get install nodejs npm ffmpeg git
              ```

              ## Step 2: Clone and Setup

              ```bash
              # Clone the repository
              git clone https://github.com/everworldlife-netizen/youtube-automation-hub.git
              cd youtube-automation-hub

              # Install Node.js dependencies
              npm install

              # Verify FFmpeg installation
              ffmpeg -version
              ```

              ## Step 3: Get API Keys

              ### A. OpenAI API Key (for GPT-4 and DALL-E)

              1. Go to https://platform.openai.com/api-keys
              2. 2. Create an account or log in
                 3. 3. Click "Create new secret key"
                    4. 4. Copy the key (keep it safe!)
                       5. 5. **Cost:** ~$0.20-0.30 per video
                         
                          6. ### B. YouTube API Credentials
                         
                          7. 1. Go to https://console.cloud.google.com
                             2. 2. Create a new project
                                3. 3. Enable "YouTube Data API v3"
                                   4. 4. Go to "Create Credentials" → OAuth 2.0 Client ID
                                      5. 5. Download JSON credentials file
                                         6. 6. Extract `client_id`, `client_secret`, and `refresh_token`
                                           
                                            7. ### C. Google Gemini API (Free Alternative)
                                           
                                            8. 1. Go to https://aistudio.google.com/app/apikey
                                               2. 2. Click "Get API Key"
                                                  3. 3. Create a new API key
                                                     4. 4. **Cost:** FREE (60 requests/min limit)
                                                       
                                                        5. ## Step 4: Configure Environment Variables
                                                       
                                                        6. ```bash
                                                           # Copy example file
                                                           cp .env.example .env

                                                           # Edit .env with your API keys
                                                           nano .env  # or use your favorite editor

                                                           # Keep secrets local only. Never share real keys in PRs/issues/chat.
                                                           # If a key is ever exposed, revoke/rotate it immediately.
                                                           ```

                                                           Fill in the following:

                                                           ```env
                                                           # OpenAI (choose this for best quality)
                                                           OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx
                                                           AI_PROVIDER=openai

                                                           # OR Google Gemini (free alternative)
                                                           GOOGLE_API_KEY=AIzaSyxxxxxxxxxxxxxxx
                                                           AI_PROVIDER=gemini

                                                           # Note: variable names must be exact (example: GOOGLE_API_KEY).
                                                           # Do not use keys with spaces like "YOUTUBE api".

                                                           # YouTube API
                                                           YOUTUBE_CLIENT_ID=xxxx.apps.googleusercontent.com
                                                           YOUTUBE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxx
                                                           YOUTUBE_REFRESH_TOKEN=1//0xxxxxxxxx

                                                           # Automation Settings
                                                           UPLOAD_SCHEDULE=daily
                                                           CONTENT_TYPE=short  # Options: short, long, mixed
                                                           AUTO_PUBLISH=true

                                                           # Channels (get these from your YouTube URLs)
                                                           PRIMARY_CHANNEL_ID=UCxxxxxxxxxxxxxxxxx
                                                           ```

                                                           ## Step 5: Start the Application

                                                           ### Option A: Web Dashboard (Recommended for First-Time Users)

                                                           ```bash
                                                           # Start the Express server
                                                           npm start

                                                           # Open browser to http://localhost:3000
                                                           # You'll see the interactive dashboard
                                                           ```

                                                           ### Option B: CLI Automation

                                                           ```bash
                                                           # Run automated content generation
                                                           npm run automation

                                                           # This will start the 24/7 automation mode
                                                           ```

                                                           ### Option C: Development Mode (with Auto-Reload)

                                                           ```bash
                                                           # Start with nodemon for development
                                                           npm run dev
                                                           ```

                                                           ## Step 6: Generate Your First Video

                                                           ### Via Web Dashboard

                                                           1. Open http://localhost:3000
                                                           2. 2. Click "New Video"
                                                              3. 3. Enter topic: "10 productivity tips for remote workers"
                                                                 4. 4. Select content type: "Shorts" or "Longform"
                                                                    5. 5. Click "Generate Video"
                                                                       6. 6. Watch real-time generation status
                                                                          7. 7. Click "Preview" to watch the video
                                                                             8. 8. Click "Upload" to publish to YouTube
                                                                               
                                                                                9. ### Via CLI
                                                                               
                                                                                10. ```bash
                                                                                    # Create a file: test-generation.js
                                                                                    const hub = require('./src/core/YouTubeAutomationHub');

                                                                                    (async () => {
                                                                                      const result = await hub.runFullPipeline(
                                                                                        'Best productivity hacks 2024',
                                                                                        'short'
                                                                                      );

                                                                                      console.log('Video generated:', result.videoUrl);
                                                                                    })();

                                                                                    # Run it
                                                                                    node test-generation.js
                                                                                    ```

                                                                                    ## Step 7: Monitor Your Channel

                                                                                    ### Dashboard Features

                                                                                    - **📊 Analytics** - View performance metrics for all videos
                                                                                    - - **📈 Trends** - See what topics are trending in your niche
                                                                                      - - **🎥 Video Library** - Browse all generated videos
                                                                                        - - **📅 Schedule** - Plan future uploads
                                                                                          - - **⚙️ Settings** - Configure automation preferences
                                                                                           
                                                                                            - ### API Endpoints
                                                                                           
                                                                                            - ```bash
                                                                                              # Get dashboard data
                                                                                              curl http://localhost:3000/api/dashboard

                                                                                              # Get channel statistics
                                                                                              curl http://localhost:3000/api/stats

                                                                                              # Get trending topics
                                                                                              curl http://localhost:3000/api/trends

                                                                                              # Generate video (POST)
                                                                                              curl -X POST http://localhost:3000/api/generate \
                                                                                                -H "Content-Type: application/json" \
                                                                                                -d '{"topic": "Best AI tools 2024", "contentType": "short"}'
                                                                                              ```

                                                                                              ## Troubleshooting

                                                                                              ### Problem: "Module not found"

                                                                                              **Solution:**
                                                                                              ```bash
                                                                                              npm install
                                                                                              npm install --save-dev
                                                                                              ```

                                                                                              ### Problem: "FFmpeg not found"

                                                                                              **Solution:**
                                                                                              ```bash
                                                                                              # macOS
                                                                                              brew install ffmpeg

                                                                                              # Windows - Add FFmpeg to PATH after downloading
                                                                                              # Or install via chocolatey
                                                                                              choco install ffmpeg

                                                                                              # Linux
                                                                                              sudo apt-get install ffmpeg
                                                                                              ```

                                                                                              ### Problem: "YouTube authentication failed"

                                                                                              **Solution:**
                                                                                              1. Check your .env file has correct YouTube credentials
                                                                                              2. 2. Refresh your YouTube OAuth token at https://myaccount.google.com/permissions
                                                                                              3. Re-authenticate: Delete refresh_token and run auth flow again
                                                                                             
                                                                                              4. ### Problem: "OpenAI API Error"
                                                                                             
                                                                                              5. **Solution:**
                                                                                              6. 1. Check API key is correct in .env
                                                                                                 2. 2. Verify you have API credits at https://platform.openai.com/account/usage/overview
                                                                                                    3. 3. Check rate limits - wait a few minutes before retry
                                                                                                      
                                                                                                       4. ### Problem: "Videos are low quality"
                                                                                                      
                                                                                                       5. **Solution:**
                                                                                                       6. ```env
                                                                                                          # In .env, increase quality settings
                                                                                                          QUALITY_PRESET=high
                                                                                                          VIDEO_BITRATE=8000k  # Higher bitrate = better quality
                                                                                                          ```
                                                                                                          
                                                                                                          ## Next Steps
                                                                                                          
                                                                                                          1. **Generate 5-10 test videos** to understand the quality
                                                                                                          2. 2. **Review YouTube requirements** - make sure content follows guidelines
                                                                                                             3. 3. **Set up automation schedule** - configure daily/weekly uploads
                                                                                                                4. 4. **Monitor analytics** - track which topics perform best
                                                                                                                   5. 5. **Refine preferences** - adjust templates based on performance
                                                                                                                     
                                                                                                                      6. ## Pricing Summary
                                                                                                                     
                                                                                                                      7. | Component | Free Option | Premium Option | Monthly Cost |
                                                                                                                      8. |-----------|------------|----------------|--------------|
                                                                                                                      9. | AI Content | Google Gemini (limited) | OpenAI GPT-4 | $5-50 |
                                                                                                                      10. | Video Generation | FFmpeg (local) | FFmpeg (local) | $0 |
                                                                                                                      11. | YouTube API | YouTube Data API v3 | Same | $0 |
                                                                                                                      12. | Hosting | Local PC | Cloud Server (optional) | $0-20 |
                                                                                                                      13. | **Total** | **$0** | **$5-70** | varies |
                                                                                                                     
                                                                                                                      14. ## Quick Commands Reference
                                                                                                                      
                                                                                                                      ```bash
                                                                                                                      # Install dependencies
                                                                                                                      npm install

                                                                                                                      # Start web dashboard
                                                                                                                      npm start

                                                                                                                      # Start automation
                                                                                                                      npm run automation

                                                                                                                      # Development with hot reload
                                                                                                                      npm run dev
                                                                                                                      
                                                                                                                      # Run tests
                                                                                                                      npm test

                                                                                                                      # Clean up old videos
                                                                                                                      npm run cleanup

                                                                                                                      # Check system requirements
                                                                                                                      npm run check-system
                                                                                                                      ```
                                                                                                                      
                                                                                                                      ## Support & Resources
                                                                                                                      
                                                                                                                      - 📖 **Documentation**: README.md
                                                                                                                      - - 🐛 **Issues**: https://github.com/everworldlife-netizen/youtube-automation-hub/issues
                                                                                                                      - 💬 **Discussions**: https://github.com/everworldlife-netizen/youtube-automation-hub/discussions
                                                                                                                      - - 📧 **Email Support**: support@example.com
                                                                                                                       
                                                                                                                        - ## Security Notes
                                                                                                                        
                                                                                                                        ⚠️ **Important:**
                                                                                                                        - Never commit .env file to Git
                                                                                                                        - Keep API keys secret
                                                                                                                        - - Use strong passwords for YouTube accounts
                                                                                                                        - Enable 2FA on all API provider accounts
                                                                                                                        - Regularly rotate refresh tokens
                                                                                                                        
                                                                                                                        ## Next: Advanced Configuration
                                                                                                                        
                                                                                                                        After getting the basics working, check out:
                                                                                                                        - `IMPLEMENTATION.md` - Full source code documentation
                                                                                                                        - `CONFIG.md` - Advanced configuration options
                                                                                                                        - - `PERFORMANCE.md` - Optimization tips
                                                                                                                          - - `API.md` - Complete API reference
                                                                                                                           
                                                                                                                            - ---
                                                                                                                            
                                                                                                                            **Congratulations! You're ready to automate your YouTube channel! 🚀**
