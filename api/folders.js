const { createClient } = require('@supabase/supabase-js');

/**
 * Folders API
 * - GET: 폴더 목록 조회 (user_id 필터)
 * - POST: 폴더 생성
 * - PATCH: 폴더 수정
 * - DELETE: 폴더 삭제
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
        // GET: 폴더 목록 조회
        if (req.method === 'GET') {
            const { user_id, parent_id, include_count } = req.query;

            let query = supabase
                .from('folders')
                .select('*')
                .order('sort_order', { ascending: true })
                .order('created_at', { ascending: true });

            // 사용자 필터
            if (user_id) {
                query = query.eq('user_id', user_id);
            }

            // 상위 폴더 필터 (null이면 루트 폴더만)
            if (parent_id === 'null' || parent_id === 'root') {
                query = query.is('parent_id', null);
            } else if (parent_id) {
                query = query.eq('parent_id', parent_id);
            }

            const { data: folders, error } = await query;

            if (error) throw error;

            // 이미지 개수 포함 옵션
            if (include_count === 'true' && folders.length > 0) {
                const folderIds = folders.map(f => f.id);

                const { data: counts, error: countError } = await supabase
                    .from('images')
                    .select('folder_id')
                    .in('folder_id', folderIds);

                if (!countError && counts) {
                    const countMap = counts.reduce((acc, item) => {
                        acc[item.folder_id] = (acc[item.folder_id] || 0) + 1;
                        return acc;
                    }, {});

                    folders.forEach(folder => {
                        folder.image_count = countMap[folder.id] || 0;
                    });
                }
            }

            return res.status(200).json({ folders });
        }

        // POST: 폴더 생성
        if (req.method === 'POST') {
            const { user_id, name, parent_id, color, icon } = req.body;

            if (!user_id || !name) {
                return res.status(400).json({ error: 'user_id and name are required' });
            }

            // 같은 위치에 중복 이름 체크
            const { data: existing } = await supabase
                .from('folders')
                .select('id')
                .eq('user_id', user_id)
                .eq('name', name)
                .is('parent_id', parent_id || null)
                .single();

            if (existing) {
                return res.status(400).json({ error: '같은 위치에 동일한 이름의 폴더가 있습니다.' });
            }

            // 정렬 순서 계산 (마지막 + 1)
            const { data: lastFolder } = await supabase
                .from('folders')
                .select('sort_order')
                .eq('user_id', user_id)
                .is('parent_id', parent_id || null)
                .order('sort_order', { ascending: false })
                .limit(1)
                .single();

            const sortOrder = lastFolder ? lastFolder.sort_order + 1 : 0;

            const { data, error } = await supabase
                .from('folders')
                .insert({
                    user_id,
                    name,
                    parent_id: parent_id || null,
                    color: color || null,
                    icon: icon || null,
                    sort_order: sortOrder
                })
                .select()
                .single();

            if (error) throw error;

            return res.status(201).json({
                success: true,
                folder: data
            });
        }

        // PATCH: 폴더 수정
        if (req.method === 'PATCH') {
            const { id, name, parent_id, color, icon, sort_order } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'id is required' });
            }

            const updates = { updated_at: new Date().toISOString() };
            if (name !== undefined) updates.name = name;
            if (parent_id !== undefined) updates.parent_id = parent_id || null;
            if (color !== undefined) updates.color = color;
            if (icon !== undefined) updates.icon = icon;
            if (sort_order !== undefined) updates.sort_order = sort_order;

            const { data, error } = await supabase
                .from('folders')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            return res.status(200).json({
                success: true,
                folder: data
            });
        }

        // DELETE: 폴더 삭제
        if (req.method === 'DELETE') {
            const { id, move_images_to } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'id is required' });
            }

            // 하위 폴더가 있는지 확인
            const { data: subfolders } = await supabase
                .from('folders')
                .select('id')
                .eq('parent_id', id);

            if (subfolders && subfolders.length > 0) {
                return res.status(400).json({
                    error: '하위 폴더가 있어 삭제할 수 없습니다. 하위 폴더를 먼저 삭제해주세요.',
                    subfolder_count: subfolders.length
                });
            }

            // 폴더 내 이미지 처리
            if (move_images_to) {
                // 다른 폴더로 이동
                await supabase
                    .from('images')
                    .update({ folder_id: move_images_to })
                    .eq('folder_id', id);
            } else {
                // 폴더 연결만 해제 (이미지는 유지, folder_id = null)
                await supabase
                    .from('images')
                    .update({ folder_id: null })
                    .eq('folder_id', id);
            }

            // 폴더 삭제
            const { error } = await supabase
                .from('folders')
                .delete()
                .eq('id', id);

            if (error) throw error;

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Folders API Error:', error);
        return res.status(500).json({ error: error.message });
    }
};
