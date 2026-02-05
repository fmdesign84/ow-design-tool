const { createClient } = require('@supabase/supabase-js');

/**
 * Workflows API
 * Wave 워크플로우 저장/관리
 *
 * Supabase 테이블 생성 SQL:
 *
 * CREATE TABLE workflows (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id TEXT NOT NULL DEFAULT 'default',
 *   name TEXT NOT NULL,
 *   description TEXT,
 *   image_url TEXT NOT NULL,
 *   node_count INTEGER DEFAULT 0,
 *   template_id TEXT,
 *   last_run_at TIMESTAMPTZ,
 *   is_featured BOOLEAN DEFAULT false,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * CREATE INDEX idx_workflows_user ON workflows(user_id);
 * CREATE INDEX idx_workflows_featured ON workflows(is_featured) WHERE is_featured = true;
 * CREATE INDEX idx_workflows_updated ON workflows(updated_at DESC);
 *
 * -- Storage bucket 생성 (Supabase 대시보드에서)
 * -- 이름: workflow-images
 * -- Public: true
 */

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // GET: 워크플로우 목록 조회
        if (req.method === 'GET') {
            const { id, featured, userId, offset = '0', limit = '20' } = req.query;
            const offsetNum = parseInt(offset, 10);
            const limitNum = parseInt(limit, 10);

            // 단일 조회
            if (id) {
                const { data, error } = await supabase
                    .from('workflows')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    if (error.code === 'PGRST116') {
                        return res.status(404).json({ error: 'Workflow not found' });
                    }
                    throw error;
                }

                return res.status(200).json({ success: true, workflow: data });
            }

            // 목록 조회
            let query = supabase
                .from('workflows')
                .select('id, name, description, image_url, node_count, is_featured, template_id, created_at, updated_at', { count: 'exact' })
                .order('updated_at', { ascending: false });

            // 추천만
            if (featured === 'true') {
                query = query.eq('is_featured', true);
            }

            // 사용자별
            if (userId) {
                query = query.eq('user_id', userId);
            }

            // 페이지네이션
            const { data, error, count } = await query.range(offsetNum, offsetNum + limitNum - 1);

            if (error) throw error;

            const hasMore = count != null
                ? offsetNum + limitNum < count
                : data && data.length === limitNum;

            return res.status(200).json({
                success: true,
                workflows: data,
                total: count || 0,
                hasMore
            });
        }

        // POST: 워크플로우 저장 (PNG 이미지 업로드)
        if (req.method === 'POST') {
            const {
                id,  // 기존 ID (업데이트 시)
                name,
                description,
                imageBase64,  // PNG 이미지 (워크플로우 JSON 임베딩됨)
                nodeCount,
                templateId,
                userId = 'default'
            } = req.body;

            if (!name || !imageBase64) {
                return res.status(400).json({ error: 'name and imageBase64 are required' });
            }

            // Base64 → Buffer
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');

            // 파일명 생성
            const fileName = `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`;

            // Storage 업로드
            const { error: uploadError } = await supabase.storage
                .from('workflow-images')
                .upload(fileName, buffer, {
                    contentType: 'image/png',
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('Storage upload error:', uploadError);
                throw new Error(`Storage upload failed: ${uploadError.message}`);
            }

            // Public URL 획득
            const { data: urlData } = supabase.storage
                .from('workflow-images')
                .getPublicUrl(fileName);

            const imageUrl = urlData.publicUrl;

            // DB 저장/업데이트
            const workflowData = {
                name,
                description: description || null,
                image_url: imageUrl,
                node_count: nodeCount || 0,
                template_id: templateId || null,
                updated_at: new Date().toISOString()
            };

            let result;

            if (id) {
                // 기존 워크플로우 업데이트
                // 이전 이미지 삭제
                const { data: oldWorkflow } = await supabase
                    .from('workflows')
                    .select('image_url')
                    .eq('id', id)
                    .single();

                if (oldWorkflow?.image_url) {
                    const oldFileName = oldWorkflow.image_url.split('/').pop();
                    await supabase.storage
                        .from('workflow-images')
                        .remove([oldFileName]);
                }

                // 업데이트
                const { data, error } = await supabase
                    .from('workflows')
                    .update(workflowData)
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;
                result = data;
            } else {
                // 신규 생성
                const { data, error } = await supabase
                    .from('workflows')
                    .insert({
                        ...workflowData,
                        user_id: userId,
                        created_at: new Date().toISOString()
                    })
                    .select()
                    .single();

                if (error) throw error;
                result = data;
            }

            return res.status(200).json({ success: true, workflow: result });
        }

        // PATCH: 워크플로우 수정 (이름, 추천 토글)
        if (req.method === 'PATCH') {
            const { id, name, is_featured, last_run_at } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'id is required' });
            }

            const updates = {
                updated_at: new Date().toISOString()
            };

            if (name !== undefined) {
                updates.name = name;
            }

            if (is_featured !== undefined) {
                updates.is_featured = is_featured;
            }

            if (last_run_at !== undefined) {
                updates.last_run_at = last_run_at;
            }

            const { data, error } = await supabase
                .from('workflows')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            return res.status(200).json({ success: true, workflow: data });
        }

        // DELETE: 워크플로우 삭제
        if (req.method === 'DELETE') {
            const { id } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'id is required' });
            }

            // 이미지 URL 조회
            const { data: workflow } = await supabase
                .from('workflows')
                .select('image_url')
                .eq('id', id)
                .single();

            // Storage에서 이미지 삭제
            if (workflow?.image_url) {
                const fileName = workflow.image_url.split('/').pop();
                await supabase.storage
                    .from('workflow-images')
                    .remove([fileName]);
            }

            // DB에서 삭제
            const { error } = await supabase
                .from('workflows')
                .delete()
                .eq('id', id);

            if (error) throw error;

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Workflow API Error:', error);
        return res.status(500).json({ error: error.message });
    }
};
