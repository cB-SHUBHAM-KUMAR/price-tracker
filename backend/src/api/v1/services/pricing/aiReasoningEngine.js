/**
 * @fileoverview AI reasoning engine.
 * Tries OpenAI first, then Gemini, then falls back to heuristic summary.
 */

const axios = require('axios');
const logger = require('../../../../config/logger.config');

let OpenAI;
try {
  OpenAI = require('openai');
} catch {
  OpenAI = null;
}

const buildPrompt = (analysisData) => {
  const input = analysisData.input || {};
  const metadata = input.metadata || {};

  return {
    system: [
      'You are a pricing analyst assistant.',
      'Write a concise 4-6 sentence explanation using plain text only.',
      'Mention fairness verdict, risk signals, recommendation, and one savings tip.',
    ].join(' '),
    user: [
      `Item: ${metadata.title || 'Unknown item'}`,
      `Type: ${input.type || 'unknown'}`,
      `Current price: ${input.currency || 'INR'} ${analysisData.currentPrice}`,
      `Estimated fair price: ${input.currency || 'INR'} ${analysisData.fairPrice}`,
      `Position: ${analysisData.pricePosition}`,
      `Deviation: ${analysisData.priceDeviation}%`,
      `Demand level: ${analysisData.demandLevel || 'unknown'}`,
      `Surge detected: ${analysisData.surgeDetected ? 'yes' : 'no'}`,
      `Confidence score: ${analysisData.confidenceScore}%`,
      `Base recommendation: ${analysisData.buyRecommendation}`,
    ].join('\n'),
  };
};

const generateFromOpenAI = async (analysisData, apiKey) => {
  if (!apiKey || !OpenAI) return null;

  const prompt = buildPrompt(analysisData);
  const client = new OpenAI({ apiKey, timeout: 10000 });

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: prompt.system },
      { role: 'user', content: prompt.user },
    ],
    max_tokens: 320,
    temperature: 0.4,
  });

  return response.choices?.[0]?.message?.content?.trim() || null;
};

const generateFromGemini = async (analysisData, apiKey) => {
  if (!apiKey) return null;

  const prompt = buildPrompt(analysisData);

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: `${prompt.system}\n\n${prompt.user}` }] }],
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    }
  );

  return response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
};

const generateAIReasoning = async (analysisData, fallbackSummary) => {
  try {
    const openAiSummary = await generateFromOpenAI(analysisData, process.env.OPENAI_API_KEY || '');
    if (openAiSummary) {
      logger.info('AI reasoning generated via OpenAI');
      return openAiSummary;
    }
  } catch (error) {
    logger.warn('OpenAI reasoning generation failed', { error: error.message });
  }

  try {
    const geminiSummary = await generateFromGemini(analysisData, process.env.GEMINI_API_KEY || '');
    if (geminiSummary) {
      logger.info('AI reasoning generated via Gemini');
      return geminiSummary;
    }
  } catch (error) {
    logger.warn('Gemini reasoning generation failed', {
      error: error.response?.data?.error?.message || error.message,
    });
  }

  return fallbackSummary;
};

module.exports = { generateAIReasoning };
