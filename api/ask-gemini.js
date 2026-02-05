const { GoogleAuth } = require('google-auth-library');

/**
 * Gemini 3 Pro에게 질문하는 API
 */
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ error: 'Question is required' });
    }

    try {
        const projectId = process.env.GOOGLE_PROJECT_ID;
        const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

        const auth = new GoogleAuth({
            credentials: JSON.parse(credentialsJson),
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();
        const token = accessToken.token;

        // Gemini 3 Pro API 호출
        const geminiUrl = `https://aiplatform.googleapis.com/v1/projects/${projectId}/locations/global/publishers/google/models/gemini-3-pro-preview:generateContent`;

        const body = {
            contents: [{
                role: 'user',
                parts: [{ text: question }]
            }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
        };

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Gemini API failed: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

        res.status(200).json({
            question: question,
            answer: answer,
            model: 'gemini-3-pro-preview'
        });

    } catch (error) {
        console.error('Ask Gemini Error:', error);
        res.status(500).json({ error: error.message });
    }
};
