/**
 * OpenRouter API Client
 * Centralises all calls to the LLM — chat completions and embeddings.
 * Model: nvidia/nemotron-ultra-253b-v1:free
 */

const BASE_URL = 'https://openrouter.ai/api/v1';
const CHAT_MODEL = 'nvidia/llama-3.1-nemotron-70b-instruct';
const EMBED_MODEL = 'openai/text-embedding-ada-002';

/**
 * Send a chat completion request.
 * @param {Array<{role: string, content: string}>} messages
 * @param {number} temperature
 * @param {boolean} jsonMode - if true, instructs the model to return valid JSON
 * @returns {Promise<string>} raw content string from the LLM
 */
async function chat(messages, temperature = 0.2, jsonMode = false) {
  const body = {
    model: CHAT_MODEL,
    messages,
    temperature,
    max_tokens: 4096,
  };

  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
      'X-Title': 'Yellomind TMS',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter chat error ${res.status}: ${err}`);
  }

  const data = await res.json();

  if (!data.choices || !data.choices[0]) {
    throw new Error('OpenRouter returned no choices: ' + JSON.stringify(data));
  }

  return data.choices[0].message.content;
}

/**
 * Generate an embedding vector for a text string.
 * @param {string} text
 * @returns {Promise<number[]>} float array (1536-dim for ada-002)
 */
async function embed(text) {
  const res = await fetch(`${BASE_URL}/embeddings`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
    },
    body: JSON.stringify({
      model: EMBED_MODEL,
      input: text.slice(0, 8000), // ada-002 token limit safety
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter embed error ${res.status}: ${err}`);
  }

  const data = await res.json();

  if (!data.data || !data.data[0]) {
    throw new Error('OpenRouter embedding returned no data: ' + JSON.stringify(data));
  }

  return data.data[0].embedding;
}

module.exports = { chat, embed };
