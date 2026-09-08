// OpenAI API Service for Text Streaming & DALL-E Image Generation

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';

export const getApiKey = () => {
  return localStorage.getItem('openai_api_key') || '';
};

export const setApiKey = (key) => {
  localStorage.setItem('openai_api_key', key.trim());
};

export const getApiBaseUrl = () => {
  return localStorage.getItem('openai_base_url') || DEFAULT_BASE_URL;
};

export const setApiBaseUrl = (url) => {
  localStorage.setItem('openai_base_url', url.trim() || DEFAULT_BASE_URL);
};

export async function generateTextStream({
  messages,
  model = 'gpt-4o-mini',
  temperature = 0.7,
  onChunk,
  onFinish,
  onError,
  signal,
}) {
  const apiKey = getApiKey();
  const baseUrl = getApiBaseUrl();

  if (!apiKey) {
    // Provide a helpful simulated demo response if no key is entered yet
    let demoText = `⚠️ **OpenAI API Key সেট করা হয়নি!**\n\nউপরে থাকা **Settings (⚙️)** বাটন অথবা চ্যাট বক্সের পাশের কী আইকনে ক্লিক করে আপনার **OpenAI API Key** প্রবেশ করান।\n\n**ডেমো রেসপন্স:**\nআপনি বলছেন: "${messages[messages.length - 1]?.content || ''}"\n\nAPI Key যুক্ত করলে সরাসরি **${model}** এবং **DALL-E 3** কাজ করবে!`;
    
    let words = demoText.split(' ');
    let current = '';
    for (let i = 0; i < words.length; i++) {
      if (signal?.aborted) return;
      current += (i === 0 ? '' : ' ') + words[i];
      onChunk(current);
      await new Promise((r) => setTimeout(r, 40));
    }
    if (onFinish) onFinish(current);
    return;
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: temperature,
        stream: true,
      }),
      signal: signal,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `API Error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // keep incomplete last line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;
        if (trimmed === 'data: [DONE]') continue;

        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.slice(6);
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              fullText += content;
              onChunk(fullText);
            }
          } catch (e) {
            console.warn('Error parsing SSE JSON:', e);
          }
        }
      }
    }

    if (onFinish) onFinish(fullText);
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('Stream aborted by user');
      return;
    }
    console.error('OpenAI Stream Error:', err);
    if (onError) onError(err);
  }
}

export async function generateImage({ prompt, size = '1024x1024', style = 'vivid' }) {
  const apiKey = getApiKey();
  const baseUrl = getApiBaseUrl();

  if (!apiKey) {
    // Return a dummy generated image placeholder if no API key set
    await new Promise((r) => setTimeout(r, 1500));
    return {
      url: `https://picsum.photos/seed/${encodeURIComponent(prompt)}/1024/1024`,
      revised_prompt: `[Demo Mode - Add API Key for real DALL-E 3] ${prompt}`,
    };
  }

  const response = await fetch(`${baseUrl}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: size,
      style: style,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Image API Error: ${response.status}`);
  }

  const data = await response.json();
  return {
    url: data.data[0]?.url,
    revised_prompt: data.data[0]?.revised_prompt || prompt,
  };
}
