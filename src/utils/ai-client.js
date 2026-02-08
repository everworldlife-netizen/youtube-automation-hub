/**
 * AI Client Factory
 * Creates the correct AI client based on configured provider
 * Supports: OpenAI, Gemini, OpenRouter
 * All use OpenAI-compatible endpoints so we can use the same SDK
 */

const OpenAI = require('openai');

const PROVIDERS = {
  gemini: {
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    defaultModel: 'gemini-2.0-flash',
    getKey: (config) => config.googleApiKey || process.env.GOOGLE_API_KEY
  },
  openrouter: {
    baseURL: 'https://openrouter.ai/api/v1',
    defaultModel: 'google/gemini-2.0-flash-001',
    getKey: (config) => config.openrouterKey || process.env.OPENROUTER_API_KEY
  },
  openai: {
    baseURL: undefined,
    defaultModel: 'gpt-4',
    getKey: (config) => config.openaiKey || process.env.OPENAI_API_KEY
  }
};

function createAIClient(config) {
  const provider = config.aiProvider || 'openai';
  const providerConfig = PROVIDERS[provider] || PROVIDERS.openai;

  const apiKey = providerConfig.getKey(config);
  if (!apiKey) return null;

  const clientOptions = { apiKey };
  if (providerConfig.baseURL) {
    clientOptions.baseURL = providerConfig.baseURL;
  }

  return new OpenAI(clientOptions);
}

function getModel(config) {
  const provider = config.aiProvider || 'openai';

  // Allow user to override the model in config
  if (config.model) return config.model;

  const providerConfig = PROVIDERS[provider] || PROVIDERS.openai;
  return providerConfig.defaultModel;
}

module.exports = { createAIClient, getModel };
