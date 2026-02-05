const { createClient } = require('@supabase/supabase-js');

/**
 * Supabase Token Usage API
 * - GET: 현재 월 토큰 사용량 조회
 * - POST: 토큰 사용량 추가
 */

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// 현재 월 키 생성 (예: "2024-12")
function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const userId = req.query.userId || req.body?.userId || 'default';
    const month = getCurrentMonth();

    try {
        // GET: 현재 월 토큰 사용량 조회
        if (req.method === 'GET') {
            const { data, error } = await supabase
                .from('token_usage')
                .select('*')
                .eq('user_id', userId)
                .eq('month', month)
                .single();

            if (error && error.code !== 'PGRST116') {
                // PGRST116 = no rows returned (정상)
                throw error;
            }

            return res.status(200).json({
                userId,
                month,
                tokensUsed: data?.tokens_used || 0,
                limit: 32000
            });
        }

        // POST: 토큰 사용량 추가
        if (req.method === 'POST') {
            const { tokens } = req.body;

            if (!tokens || typeof tokens !== 'number') {
                return res.status(400).json({ error: 'tokens (number) is required' });
            }

            // Upsert: 있으면 업데이트, 없으면 생성
            const { data: existing } = await supabase
                .from('token_usage')
                .select('tokens_used')
                .eq('user_id', userId)
                .eq('month', month)
                .single();

            const newTotal = (existing?.tokens_used || 0) + tokens;

            const { data, error } = await supabase
                .from('token_usage')
                .upsert({
                    user_id: userId,
                    month,
                    tokens_used: newTotal,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id,month'
                })
                .select()
                .single();

            if (error) throw error;

            return res.status(200).json({
                userId,
                month,
                tokensUsed: newTotal,
                tokensAdded: tokens,
                limit: 32000
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Token API Error:', error);
        return res.status(500).json({ error: error.message });
    }
};
