/**
 * Vercel Serverless Function - Wave Showcase API
 * 추천 웨이브 쇼케이스 CRUD
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // GET - 쇼케이스 목록 또는 단일 조회
        if (req.method === 'GET') {
            const { workflowId, active } = req.query;

            // 단일 쇼케이스 조회 (워크플로우 ID로)
            if (workflowId) {
                const { data: showcase, error } = await supabase
                    .from('wave_showcase')
                    .select(`
                        *,
                        workflow:workflows(*)
                    `)
                    .eq('workflow_id', workflowId)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    throw error;
                }

                return res.status(200).json({
                    success: true,
                    showcase: showcase || null
                });
            }

            // 전체 목록 조회 (활성화된 것만 또는 전체)
            let query = supabase
                .from('wave_showcase')
                .select(`
                    *,
                    workflow:workflows(id, name, image_url, node_count)
                `)
                .order('display_order', { ascending: true });

            // active 필터 (기본: 활성화된 것만)
            if (active !== 'all') {
                query = query.eq('is_active', true);
            }

            const { data: showcases, error } = await query;

            if (error) throw error;

            return res.status(200).json({
                success: true,
                showcases: showcases || []
            });
        }

        // POST - 쇼케이스 생성
        if (req.method === 'POST') {
            const {
                workflowId,
                title,
                description,
                resultImages,
                combinedImageUrl,
                category,
                tags,
                displayOrder
            } = req.body;

            if (!workflowId || !title || !resultImages || resultImages.length === 0) {
                return res.status(400).json({
                    error: 'workflowId, title, resultImages는 필수입니다'
                });
            }

            // 중복 체크
            const { data: existing } = await supabase
                .from('wave_showcase')
                .select('id')
                .eq('workflow_id', workflowId)
                .single();

            if (existing) {
                return res.status(400).json({
                    error: '이미 해당 워크플로우의 쇼케이스가 존재합니다'
                });
            }

            // 쇼케이스 생성
            const { data: showcase, error } = await supabase
                .from('wave_showcase')
                .insert({
                    workflow_id: workflowId,
                    title,
                    description: description || null,
                    result_images: resultImages,
                    combined_image_url: combinedImageUrl || null,
                    category: category || 'workflow',
                    tags: tags || [],
                    display_order: displayOrder || 0,
                    is_active: true
                })
                .select()
                .single();

            if (error) throw error;

            // workflows 테이블의 is_featured도 true로 설정
            await supabase
                .from('workflows')
                .update({ is_featured: true })
                .eq('id', workflowId);

            return res.status(201).json({
                success: true,
                showcase
            });
        }

        // PATCH - 쇼케이스 수정
        if (req.method === 'PATCH') {
            const {
                id,
                title,
                description,
                resultImages,
                combinedImageUrl,
                category,
                tags,
                displayOrder,
                isActive
            } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'id는 필수입니다' });
            }

            const updateData = {};
            if (title !== undefined) updateData.title = title;
            if (description !== undefined) updateData.description = description;
            if (resultImages !== undefined) updateData.result_images = resultImages;
            if (combinedImageUrl !== undefined) updateData.combined_image_url = combinedImageUrl;
            if (category !== undefined) updateData.category = category;
            if (tags !== undefined) updateData.tags = tags;
            if (displayOrder !== undefined) updateData.display_order = displayOrder;
            if (isActive !== undefined) updateData.is_active = isActive;
            updateData.updated_at = new Date().toISOString();

            const { data: showcase, error } = await supabase
                .from('wave_showcase')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            return res.status(200).json({
                success: true,
                showcase
            });
        }

        // DELETE - 쇼케이스 삭제
        if (req.method === 'DELETE') {
            const { id } = req.query;

            if (!id) {
                return res.status(400).json({ error: 'id는 필수입니다' });
            }

            // 워크플로우 ID 먼저 조회
            const { data: showcase } = await supabase
                .from('wave_showcase')
                .select('workflow_id')
                .eq('id', id)
                .single();

            // 쇼케이스 삭제
            const { error } = await supabase
                .from('wave_showcase')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // workflows 테이블의 is_featured도 false로 설정
            if (showcase?.workflow_id) {
                await supabase
                    .from('workflows')
                    .update({ is_featured: false })
                    .eq('id', showcase.workflow_id);
            }

            return res.status(200).json({
                success: true,
                message: '쇼케이스가 삭제되었습니다'
            });
        }

        return res.status(405).json({ error: 'Method Not Allowed' });

    } catch (err) {
        console.error('[wave-showcase] Error:', err);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: err.message
        });
    }
};
