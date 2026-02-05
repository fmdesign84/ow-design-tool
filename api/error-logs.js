const { createClient } = require('@supabase/supabase-js');

/**
 * Error Logs API
 * GET: 에러 조회 (필터링 지원)
 * POST: 에러 해결 처리
 * PATCH: 에러 상태 업데이트
 */

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    );

    // GET: 에러 조회
    if (req.method === 'GET') {
        try {
            const {
                service,      // 서비스 필터 (generate-image, generate-video 등)
                error_type,   // 에러 타입 필터
                resolved,     // 해결 여부 (true/false)
                limit = 20,   // 조회 개수
                offset = 0,   // 페이지네이션
                since         // 특정 시간 이후 (ISO string)
            } = req.query;

            let query = supabase
                .from('error_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (service) query = query.eq('service', service);
            if (error_type) query = query.eq('error_type', error_type);
            if (resolved !== undefined) query = query.eq('resolved', resolved === 'true');
            if (since) query = query.gte('created_at', since);

            const { data, error } = await query;

            if (error) throw error;

            // 통계 추가
            const { data: stats } = await supabase
                .from('error_logs')
                .select('error_type, resolved')
                .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

            const summary = {
                total: stats?.length || 0,
                unresolved: stats?.filter(e => !e.resolved).length || 0,
                byType: stats?.reduce((acc, e) => {
                    acc[e.error_type] = (acc[e.error_type] || 0) + 1;
                    return acc;
                }, {}) || {}
            };

            return res.status(200).json({
                errors: data,
                summary,
                pagination: { limit: parseInt(limit), offset: parseInt(offset) }
            });

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // POST: 에러 해결 처리
    if (req.method === 'POST') {
        try {
            const { id, resolution, resolved = true } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'Error ID required' });
            }

            const { data, error } = await supabase
                .from('error_logs')
                .update({
                    resolved,
                    resolved_at: resolved ? new Date().toISOString() : null,
                    resolution
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            return res.status(200).json({ success: true, error: data });

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // PATCH: 일괄 해결 처리
    if (req.method === 'PATCH') {
        try {
            const { ids, resolution, error_type } = req.body;

            let query = supabase
                .from('error_logs')
                .update({
                    resolved: true,
                    resolved_at: new Date().toISOString(),
                    resolution: resolution || 'Bulk resolved'
                });

            if (ids && ids.length > 0) {
                query = query.in('id', ids);
            } else if (error_type) {
                query = query.eq('error_type', error_type).eq('resolved', false);
            } else {
                return res.status(400).json({ error: 'Provide ids array or error_type' });
            }

            const { data, error } = await query.select();

            if (error) throw error;

            return res.status(200).json({
                success: true,
                resolved_count: data?.length || 0
            });

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
};
