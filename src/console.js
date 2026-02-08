/**
 * Interactive Console for YouTube Automation Hub
 * Run with: npm run console
 */

require('dotenv').config();
const readline = require('readline');
const YouTubeAutomationHub = require('./core/YouTubeAutomationHub');

const hub = new YouTubeAutomationHub();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function printBanner() {
  console.log('');
  console.log('  ============================================');
  console.log('   YouTube Automation Hub - Interactive Console');
  console.log('  ============================================');
  console.log('');
}

function printHelp() {
  console.log('  Available commands:');
  console.log('');
  console.log('  1  Generate Script       - Create a video script from a topic');
  console.log('  2  Trending Topics       - Find trending topics in a niche');
  console.log('  3  Full Pipeline         - Run complete video creation pipeline');
  console.log('  4  Analyze Competitors   - Analyze YouTube channels');
  console.log('  5  Dashboard Stats       - View your stats');
  console.log('  6  Start Automation      - Start 24/7 auto mode');
  console.log('  7  Stop Automation       - Stop 24/7 auto mode');
  console.log('');
  console.log('  help                     - Show this menu');
  console.log('  exit                     - Quit');
  console.log('');
}

function ask(question) {
  return new Promise((resolve) => {
    rl.question('  ' + question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function generateScript() {
  const topic = await ask('Enter topic: ');
  if (!topic) { console.log('  Cancelled.'); return; }

  const type = await ask('Content type (short/medium/long) [short]: ');
  const contentType = type || 'short';

  console.log('');
  console.log('  Generating script... (this may take a minute)');
  console.log('');

  try {
    const script = await hub.generateScriptOnly(topic, contentType);
    console.log('  --- Script Generated ---');
    console.log('');
    if (script.title) console.log('  Title: ' + script.title);
    if (script.hook) console.log('  Hook: ' + script.hook);
    console.log('');
    if (script.voiceoverScript) {
      console.log('  Full Script:');
      console.log('  ' + script.voiceoverScript.substring(0, 1000));
      if (script.voiceoverScript.length > 1000) console.log('  ... (truncated)');
    }
    console.log('');
    if (script.tags) console.log('  Tags: ' + script.tags.join(', '));
    if (script.estimatedDuration) console.log('  Duration: ~' + script.estimatedDuration + 's');
    console.log('');
  } catch (err) {
    console.log('  Error: ' + err.message);
    console.log('');
  }
}

async function trendingTopics() {
  const niche = await ask('Enter niche (or press Enter for general): ');

  console.log('');
  console.log('  Finding trending topics...');
  console.log('');

  try {
    const topics = await hub.getTrendingTopics(niche || 'general');
    if (topics.length === 0) {
      console.log('  No topics found.');
    } else {
      console.log('  --- Trending Topics ---');
      console.log('');
      topics.forEach((t, i) => {
        const title = t.title || t;
        const viral = t.viralPotential ? ` (Viral: ${t.viralPotential})` : '';
        console.log(`  ${i + 1}. ${title}${viral}`);
      });
    }
    console.log('');
  } catch (err) {
    console.log('  Error: ' + err.message);
    console.log('');
  }
}

async function fullPipeline() {
  const topic = await ask('Enter topic: ');
  if (!topic) { console.log('  Cancelled.'); return; }

  const type = await ask('Content type (short/medium/long) [short]: ');
  const contentType = type || 'short';

  const confirm = await ask('This will use API credits. Continue? (y/n) [n]: ');
  if (confirm.toLowerCase() !== 'y') { console.log('  Cancelled.'); return; }

  console.log('');
  console.log('  Running full pipeline... (this may take several minutes)');
  console.log('');

  try {
    const result = await hub.runFullPipeline(topic, contentType);
    console.log('  --- Pipeline Complete ---');
    console.log('');
    if (result.videoUrl) console.log('  Video URL: ' + result.videoUrl);
    if (result.videoId) console.log('  Video ID: ' + result.videoId);
    console.log('  Success: ' + result.success);
    console.log('');
  } catch (err) {
    console.log('  Pipeline failed: ' + err.message);
    console.log('');
  }
}

async function analyzeCompetitors() {
  console.log('  Enter channel URLs (one per line, empty line to finish):');
  const urls = [];
  while (true) {
    const url = await ask('  URL: ');
    if (!url) break;
    urls.push(url);
  }

  if (urls.length === 0) { console.log('  Cancelled.'); return; }

  console.log('');
  console.log('  Analyzing ' + urls.length + ' channel(s)...');
  console.log('');

  try {
    const results = await hub.analyzeCompetitors(urls);
    console.log('  --- Competitor Analysis ---');
    console.log('');
    console.log(JSON.stringify(results, null, 2));
    console.log('');
  } catch (err) {
    console.log('  Error: ' + err.message);
    console.log('');
  }
}

async function showStats() {
  try {
    const stats = await hub.getDashboardStats();
    console.log('');
    console.log('  --- Dashboard Stats ---');
    console.log('');
    console.log('  Videos Generated:   ' + stats.videosGenerated);
    console.log('  Videos Published:   ' + stats.videosPublished);
    console.log('  Total Views:        ' + stats.totalViews);
    console.log('  Avg Engagement:     ' + stats.avgEngagement + '%');
    console.log('  Channels Connected: ' + stats.channelsConnected);
    console.log('  AI Cost (Month):    $' + stats.aiCostThisMonth);
    console.log('  Last Upload:        ' + (stats.lastUpload || 'Never'));
    console.log('');
  } catch (err) {
    console.log('  Error: ' + err.message);
    console.log('');
  }
}

async function main() {
  printBanner();
  printHelp();

  while (true) {
    const input = await ask('> ');
    const cmd = input.toLowerCase();

    switch (cmd) {
      case '1': case 'script':
        await generateScript(); break;
      case '2': case 'trending':
        await trendingTopics(); break;
      case '3': case 'pipeline':
        await fullPipeline(); break;
      case '4': case 'competitors':
        await analyzeCompetitors(); break;
      case '5': case 'stats':
        await showStats(); break;
      case '6': case 'start':
        await hub.startAutomationMode();
        console.log('  Automation mode started.');
        console.log('');
        break;
      case '7': case 'stop':
        hub.stopAutomationMode();
        console.log('  Automation mode stopped.');
        console.log('');
        break;
      case 'help':
        printHelp(); break;
      case 'exit': case 'quit': case 'q':
        console.log('  Goodbye!');
        hub.stopAutomationMode();
        rl.close();
        process.exit(0);
      case '':
        break;
      default:
        console.log('  Unknown command. Type "help" for options.');
        console.log('');
    }
  }
}

main().catch(err => {
  console.error('Console error:', err);
  process.exit(1);
});
