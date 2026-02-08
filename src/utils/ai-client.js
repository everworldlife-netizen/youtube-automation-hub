/**
 * AI Client Factory
 * Creates the correct AI client based on configured provider (OpenAI or Gemini)
 * Gemini uses its OpenAI-compatible endpoint so we can use the same SDK
 */

const OpenAI = require('openai');

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/';

function createAIClient(config) {
  const provider = config.aiProvider || 'openai';

  if (provider === 'gemini') {
    const apiKey = config.googleApiKey || process.env.GOOGLE_API_KEY;
    if (!apiKey) return null;

    return new OpenAI({
      apiKey,
      baseURL: GEMINI_BASE_URL
    });
  }

  // Default: OpenAI
  const apiKey = config.openaiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  return new OpenAI({ apiKey });
}

function getModel(config) {
  const provider = config.aiProvider || 'openai';
  if (provider === 'gemini') {
    return 'gemini-2.0-flash';
  }
  return 'gpt-4';
}

module.exports = { createAIClient, getModel };
