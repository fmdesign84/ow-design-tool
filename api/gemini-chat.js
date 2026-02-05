/**
 * Gemini 3 Flash 텍스트 대화 API
 * Claude ↔ Gemini 협업용
 */

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt, systemPrompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'prompt is required' });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error('GEMINI_API_KEY not configured');
        }

        // Gemini 3 Flash (2024.12.17 출시)
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

        const requestBody = {
            contents: [{
                parts: [{
                    text: systemPrompt
                        ? `${systemPrompt}\n\n${prompt}`
                        : prompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 8192
            }
        };

        console.log('[Gemini Chat] Calling Gemini 2.5 Flash...');

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Gemini API failed (${response.status}): ${errText}`);
        }

        const data = await response.json();
        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        console.log('[Gemini Chat] Response received:', answer.substring(0, 100) + '...');

        res.status(200).json({
            response: answer,
            model: 'gemini-3-flash-preview',
            usage: data.usageMetadata || null
        });

    } catch (error) {
        console.error('[Gemini Chat] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
};
