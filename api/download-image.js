/**
 * 이미지 다운로드 프록시 API
 * CORS 우회를 위한 서버사이드 이미지 fetch
 */

module.exports = async (req, res) => {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, filename } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // URL 유효성 검사 (Supabase URL만 허용)
    const allowedDomains = [
      'supabase.co',
      'supabase.in',
      'googleapis.com',
      'googleusercontent.com'
    ];

    const urlObj = new URL(url);
    const isAllowed = allowedDomains.some(domain => urlObj.hostname.includes(domain));

    if (!isAllowed) {
      return res.status(403).json({ error: 'Domain not allowed' });
    }

    // 이미지 fetch
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Failed to fetch image: ${response.statusText}`
      });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const buffer = await response.arrayBuffer();

    // 다운로드 헤더 설정
    const downloadFilename = filename || 'download';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
    res.setHeader('Content-Length', buffer.byteLength);

    return res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('[Download Error]:', error);
    return res.status(500).json({
      error: 'Failed to download image',
      message: error.message
    });
  }
};
