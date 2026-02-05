const { createClient } = require('@supabase/supabase-js');

/**
 * Usage Logs API
 * - POST: 사용 로그 기록
 * - GET: 사용 로그 조회 (관리자용)
 */

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // POST: 사용 로그 기록
        if (req.method === 'POST') {
            const {
                user_id,
                action,
                resource_type,
                resource_id,
                metadata = {},
                duration_ms,
                tokens_consumed,
                status = 'success',
                error_message
            } = req.body;

            if (!action || !resource_type) {
                return res.status(400).json({ error: 'action and resource_type are required' });
            }

            const { data, error } = await supabase
                .from('usage_logs')
                .insert({
                    user_id,
                    action,
                    resource_type,
                    resource_id,
                    metadata,
                    duration_ms,
                    tokens_consumed,
                    status,
                    error_message
                })
                .select()
                .single();

            if (error) throw error;

            return res.status(201).json({
                success: true,
                log: data
            });
        }

        // GET: 사용 로그 조회
        if (req.method === 'GET') {
            const {
                user_id,
                action,
                resource_type,
                status,
                start_date,
                end_date,
                limit = 100,
                offset = 0
            } = req.query;

            let query = supabase
                .from('usage_logs')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false });

            if (user_id) query = query.eq('user_id', user_id);
            if (action) query = query.eq('action', action);
            if (resource_type) query = query.eq('resource_type', resource_type);
            if (status) query = query.eq('status', status);
            if (start_date) query = query.gte('created_at', start_date);
            if (end_date) query = query.lte('created_at', end_date);

            query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

            const { data, error, count } = await query;

            if (error) throw error;

            return res.status(200).json({
                logs: data,
                total: count,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Usage Logs API Error:', error);
        return res.status(500).json({ error: error.message });
    }
};
