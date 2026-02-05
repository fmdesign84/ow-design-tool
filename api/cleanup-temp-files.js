/**
 * 임시 파일 정리 API
 * Vercel Cron으로 매일 자정(UTC) 실행
 *
 * 기능:
 * 1. temp/ 폴더의 7일 이상 된 파일 삭제
 * 2. 통계 반환
 */
import { createClient } from '@supabase/supabase-js';
import { logError } from './lib/errorLogger.js';

export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST만 허용 (Vercel Cron은 POST로 호출)
  // GET도 허용 (수동 테스트용)
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // temp/ 폴더 파일 목록 조회
    const { data: tempFiles, error: listError } = await supabase.storage
      .from('generated-images')
      .list('temp', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'asc' }
      });

    // temp 폴더가 없으면 빈 배열 처리
    if (listError && listError.message.includes('not found')) {
      console.log('[Cleanup] temp/ folder does not exist yet');
      return res.status(200).json({
        success: true,
        message: 'temp/ folder does not exist yet',
        stats: {
          totalFiles: 0,
          deletedCount: 0,
          duration: Date.now() - startTime
        }
      });
    }

    if (listError) throw listError;

    const totalFiles = tempFiles?.length || 0;

    // 7일 이상 된 파일 필터링
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const oldFiles = (tempFiles || []).filter(file => {
      // .emptyFolderPlaceholder 같은 시스템 파일 제외
      if (file.name.startsWith('.')) return false;

      const createdAt = new Date(file.created_at);
      return createdAt < sevenDaysAgo;
    });

    let deletedCount = 0;

    if (oldFiles.length > 0) {
      const fileNames = oldFiles.map(f => `temp/${f.name}`);

      console.log(`[Cleanup] Deleting ${fileNames.length} old temp files...`);

      const { error: deleteError } = await supabase.storage
        .from('generated-images')
        .remove(fileNames);

      if (deleteError) throw deleteError;

      deletedCount = oldFiles.length;
    }

    const duration = Date.now() - startTime;

    console.log(`[Cleanup] Completed: ${deletedCount}/${totalFiles} files deleted in ${duration}ms`);

    return res.status(200).json({
      success: true,
      stats: {
        totalFiles,
        deletedCount,
        remainingFiles: totalFiles - deletedCount,
        duration,
        threshold: '7 days'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Cleanup Error]:', error);

    // 에러 로깅
    await logError(
      'cleanup-temp-files',
      'CLEANUP_ERROR',
      error.message,
      { method: req.method },
      { stack: error.stack }
    );

    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
