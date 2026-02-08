#!/bin/bash
# SessionStart hook: Validate environment setup for YouTube Automation Hub

echo "Checking YouTube Automation Hub setup..."

cd /home/user/youtube-automation-hub

# Check node_modules exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Check .env exists
if [ ! -f ".env" ]; then
  echo "WARNING: No .env file found. Creating from template..."
  cp .env.example .env
  echo "IMPORTANT: Edit .env and add your API keys before running the app."
fi

# Validate API keys are configured (not placeholder values)
if grep -q "your_" .env 2>/dev/null; then
  echo "WARNING: .env still contains placeholder values. Update your API keys."
fi

# Check which provider is configured
AI_PROVIDER=$(grep "^AI_PROVIDER=" .env 2>/dev/null | cut -d= -f2 | tr -d ' ')
if [ -z "$AI_PROVIDER" ]; then
  echo "WARNING: AI_PROVIDER not set in .env. Defaulting to openai."
fi

case "$AI_PROVIDER" in
  gemini)
    KEY=$(grep "^GOOGLE_API_KEY=" .env 2>/dev/null | cut -d= -f2)
    if [ -z "$KEY" ] || echo "$KEY" | grep -q "your_"; then
      echo "ERROR: GOOGLE_API_KEY not set. Add your Gemini key to .env"
    else
      echo "OK: Gemini provider configured"
    fi
    ;;
  openrouter)
    KEY=$(grep "^OPENROUTER_API_KEY=" .env 2>/dev/null | cut -d= -f2)
    if [ -z "$KEY" ] || echo "$KEY" | grep -q "your_"; then
      echo "ERROR: OPENROUTER_API_KEY not set. Add your OpenRouter key to .env"
    else
      echo "OK: OpenRouter provider configured"
    fi
    ;;
  openai|*)
    KEY=$(grep "^OPENAI_API_KEY=" .env 2>/dev/null | cut -d= -f2)
    if [ -z "$KEY" ] || echo "$KEY" | grep -q "your_"; then
      echo "ERROR: OPENAI_API_KEY not set. Add your OpenAI key to .env"
    else
      echo "OK: OpenAI provider configured"
    fi
    ;;
esac

# Quick syntax check on main entry point
node -e "require('./src/core/YouTubeAutomationHub')" 2>/dev/null
if [ $? -eq 0 ]; then
  echo "OK: All modules load correctly"
else
  echo "WARNING: Module loading failed. Run 'npm install' to fix."
fi

echo "Setup check complete."
