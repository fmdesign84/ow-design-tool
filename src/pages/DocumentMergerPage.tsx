// 문서 스타일 통합기 페이지
import React from 'react';

export function DocumentMergerPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
      padding: '40px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        textAlign: 'center',
        color: '#6B7280',
      }}>
        <p style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</p>
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px', color: '#1F2937' }}>
          문서 스타일 통합기
        </h2>
        <p>Swimming 위자드에서 사용해주세요</p>
      </div>
    </div>
  );
}
