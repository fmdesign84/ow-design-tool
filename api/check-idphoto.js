/**
 * Vercel Serverless Function - Check ID Photo Generation Status
 *
 * Replicate prediction 상태 확인용 API
 * 클라이언트에서 폴링으로 호출
 */

module.exports = async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Prediction ID is required' });
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
        return res.status(500).json({ error: 'REPLICATE_API_TOKEN not configured' });
    }

    try {
        const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
            headers: { 'Authorization': `Bearer ${apiToken}` }
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ error: errorText });
        }

        const prediction = await response.json();

        return res.status(200).json({
            id: prediction.id,
            status: prediction.status,
            output: prediction.output,
            error: prediction.error,
            metrics: prediction.metrics
        });

    } catch (error) {
        console.error('[CheckIDPhoto] Error:', error.message);
        return res.status(500).json({ error: error.message });
    }
};
