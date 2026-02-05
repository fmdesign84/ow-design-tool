const { createClient } = require('@supabase/supabase-js');

/**
 * Debug Logs API
 * 원격 디버그 로그 저장/조회
 *
 * Supabase 테이블:
 * CREATE TABLE debug_logs (
 *   id SERIAL PRIMARY KEY,
 *   tag TEXT,
 *   message TEXT,
 *   data JSONB,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * CREATE INDEX idx_debug_logs_created ON debug_logs(created_at DESC);
 */

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // POST: 로그 저장
    if (req.method === 'POST') {
      const { tag, message, data } = req.body;

      const { error } = await supabase
        .from('debug_logs')
        .insert({ tag, message, data });

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    // GET: 로그 조회 (최근 50개)
    if (req.method === 'GET') {
      const { limit = 50, tag } = req.query;

      let query = supabase
        .from('debug_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(parseInt(limit));

      if (tag) {
        query = query.eq('tag', tag);
      }

      const { data, error } = await query;
      if (error) throw error;

      return res.status(200).json({ success: true, logs: data });
    }

    // DELETE: 로그 전체 삭제
    if (req.method === 'DELETE') {
      const { error } = await supabase
        .from('debug_logs')
        .delete()
        .neq('id', 0); // 전체 삭제

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Debug Logs API Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
