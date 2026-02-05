const { createClient } = require('@supabase/supabase-js');

/**
 * Supabase Images API
 * - GET: 이미지 목록 조회 (?featured=true로 추천만 필터)
 * - POST: 이미지 저장 (base64 → Storage → DB)
 * - PATCH: 추천 상태 토글
 * - DELETE: 이미지 삭제
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
        // GET: 이미지 목록 조회
        // - ?featured=true: 추천만
        // - ?contentType=mockup: 목업만
        // - ?contentType=general: 일반 이미지/영상만 (목업 제외)
        if (req.method === 'GET') {
            const { featured, contentType, offset = '0', limit = '30' } = req.query;
            const offsetNum = parseInt(offset, 10);
            const limitNum = parseInt(limit, 10);

            // 목업 스타일 목록
            const MOCKUP_STYLES = [
                'poster-a4', 'magazine-cover', 'business-card', 'brochure',
                'billboard', 'bus-shelter', 'subway-interior', 'subway-psd',
                'storefront', 'building-wrap', 'x-banner', 'bus-wrap', 'taxi-door',
                'popup-store', 'island-booth', 'exhibition-booth', 'kiosk', 'info-desk',
                'iphone-hand', 'iphone-topview', 'macbook-screen', 'ipad-screen',
                'tv-screen', 'watch-face',
                'product-box', 'shopping-bag', 'beverage-can', 'cake-box', 'tshirt-print',
                'ballpoint-pen', 'sticker-sheet', 'wristband', 'pin-button', 'metal-badge', 'keychain',
                'web-banner', 'mobile-banner', 'social-square', 'social-story', 'thumbnail'
            ];

            let query = supabase
                .from('images')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false });

            // 추천 필터
            if (featured === 'true') {
                query = query.eq('is_featured', true);
            }

            // 콘텐츠 타입 필터
            if (contentType === 'mockup') {
                // 목업만
                query = query.in('style', MOCKUP_STYLES);
            } else if (contentType === 'video') {
                // 영상만
                query = query.eq('type', 'video');
            } else if (contentType === 'general') {
                // 목업 제외 (일반 이미지/영상)
                query = query.not('style', 'in', `(${MOCKUP_STYLES.join(',')})`);
            }

            // 페이지네이션
            const { data, error, count } = await query.range(offsetNum, offsetNum + limitNum - 1);

            if (error) throw error;

            // hasMore 계산: count가 null일 경우 데이터 길이로 판단
            const hasMore = count != null
                ? offsetNum + limitNum < count
                : data && data.length === limitNum;

            return res.status(200).json({
                success: true,
                images: data,
                total: count || 0,
                hasMore
            });
        }

        // POST: 이미지/영상 저장
        if (req.method === 'POST') {
            const { image, imageBase64, prompt, model, style, aspectRatio, quality, type, metadata } = req.body;

            // image 또는 imageBase64 둘 다 지원 (호환성)
            const mediaData = image || imageBase64;

            if (!mediaData || !prompt) {
                return res.status(400).json({ error: 'image/imageBase64 and prompt are required' });
            }

            // 미디어 타입 감지
            const isVideo = type === 'video' || mediaData.startsWith('data:video/');
            const mimeMatch = mediaData.match(/^data:([^;]+);base64,/);
            const mimeType = mimeMatch ? mimeMatch[1] : (isVideo ? 'video/mp4' : 'image/png');
            const extension = isVideo ? 'mp4' : 'png';

            // Base64 → Buffer
            const base64Data = mediaData.replace(/^data:[^;]+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');

            // 파일명 생성
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;

            // Storage에 업로드
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('generated-images')
                .upload(fileName, buffer, {
                    contentType: mimeType,
                    cacheControl: '3600'
                });

            if (uploadError) {
                console.error('Storage upload error:', uploadError);
                throw uploadError;
            }

            // Public URL 가져오기
            const { data: { publicUrl } } = supabase.storage
                .from('generated-images')
                .getPublicUrl(fileName);

            // DB에 메타데이터 저장
            const { data: dbData, error: dbError } = await supabase
                .from('images')
                .insert({
                    image_url: publicUrl,
                    prompt,
                    model: model || 'unknown',
                    style: style || 'unknown',
                    aspect_ratio: aspectRatio || metadata?.aspectRatio || '1:1',
                    quality: quality || 'standard',
                    type: isVideo ? 'video' : 'image',
                    metadata: metadata ? JSON.stringify(metadata) : null
                })
                .select()
                .single();

            if (dbError) {
                console.error('DB insert error:', dbError);
                throw dbError;
            }

            return res.status(200).json({
                success: true,
                id: dbData.id,
                image_url: publicUrl,
                image: dbData
            });
        }

        // PATCH: 추천 상태 토글
        if (req.method === 'PATCH') {
            const { id, is_featured } = req.body;

            console.log('[PATCH] Request body:', { id, is_featured });

            if (!id) {
                return res.status(400).json({ error: 'id is required' });
            }

            // 먼저 해당 레코드가 존재하는지 확인
            const { data: existingData, error: selectError } = await supabase
                .from('images')
                .select('id, is_featured')
                .eq('id', id)
                .single();

            if (selectError) {
                console.error('[PATCH] Select error:', selectError);
                return res.status(404).json({
                    error: 'Image not found',
                    details: selectError.message,
                    id
                });
            }

            console.log('[PATCH] Found existing:', existingData);

            const { data, error } = await supabase
                .from('images')
                .update({ is_featured: is_featured })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('[PATCH] Update error:', error);
                return res.status(500).json({
                    error: 'Update failed',
                    details: error.message,
                    code: error.code,
                    hint: error.hint
                });
            }

            return res.status(200).json({
                success: true,
                image: data
            });
        }

        // DELETE: 이미지 삭제
        // - id: 단일 삭제
        // - ids: 배열로 다중 삭제
        // - dateAfter: 특정 날짜 이후 모두 삭제
        if (req.method === 'DELETE') {
            const { id, ids, imageUrl, dateAfter } = req.body;

            // 날짜 기반 일괄 삭제
            if (dateAfter) {
                // 해당 날짜 이후 이미지 조회
                const { data: toDelete, error: selectError } = await supabase
                    .from('images')
                    .select('id, image_url')
                    .gte('created_at', dateAfter);

                if (selectError) throw selectError;

                if (!toDelete || toDelete.length === 0) {
                    return res.status(200).json({ success: true, deleted: 0 });
                }

                // Storage에서 파일 삭제
                const fileNames = toDelete
                    .filter(item => item.image_url)
                    .map(item => item.image_url.split('/').pop());

                if (fileNames.length > 0) {
                    await supabase.storage
                        .from('generated-images')
                        .remove(fileNames);
                }

                // DB에서 삭제
                const idsToDelete = toDelete.map(item => item.id);
                const { error: deleteError } = await supabase
                    .from('images')
                    .delete()
                    .in('id', idsToDelete);

                if (deleteError) throw deleteError;

                return res.status(200).json({ success: true, deleted: toDelete.length });
            }

            // 다중 ID 삭제
            if (ids && Array.isArray(ids) && ids.length > 0) {
                // 이미지 URL 조회
                const { data: toDelete, error: selectError } = await supabase
                    .from('images')
                    .select('id, image_url')
                    .in('id', ids);

                if (selectError) throw selectError;

                // Storage에서 파일 삭제
                const fileNames = toDelete
                    .filter(item => item.image_url)
                    .map(item => item.image_url.split('/').pop());

                if (fileNames.length > 0) {
                    await supabase.storage
                        .from('generated-images')
                        .remove(fileNames);
                }

                // DB에서 삭제
                const { error: deleteError } = await supabase
                    .from('images')
                    .delete()
                    .in('id', ids);

                if (deleteError) throw deleteError;

                return res.status(200).json({ success: true, deleted: ids.length });
            }

            // 단일 삭제
            if (!id) {
                return res.status(400).json({ error: 'id, ids, or dateAfter is required' });
            }

            // Storage에서 파일 삭제
            if (imageUrl) {
                const fileName = imageUrl.split('/').pop();
                await supabase.storage
                    .from('generated-images')
                    .remove([fileName]);
            }

            // DB에서 삭제
            const { error } = await supabase
                .from('images')
                .delete()
                .eq('id', id);

            if (error) throw error;

            return res.status(200).json({ success: true, deleted: 1 });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Supabase API Error:', error);
        return res.status(500).json({ error: error.message });
    }
};
