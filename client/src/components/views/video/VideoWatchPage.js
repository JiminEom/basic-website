// client/src/pages/VideoWatchPage.jsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function VideoWatchPage() {
  const { name } = useParams(); // encodeURIComponent 된 파일명
  // 개발모드에선 백엔드 호스트를 붙여 절대경로로 만들어주면 덜 헷갈림
  const HOST = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '';
  const src = `${HOST}/uploads/${name}`;

  // 다운로드 파일명
  const fileName = decodeURIComponent(name);

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      {/* 상단 네비게이션 */}
      <div style={{ marginBottom: 16 }}>
        <Link
          to="/video"
          style={{
            display: 'inline-block',
            padding: '6px 12px',
            backgroundColor: '#f3f4f6', // 연한 회색
            border: '1px solid #d1d5db',
            borderRadius: 6,
            color: '#374151',
            fontSize: 14,
            fontWeight: 500,
            textDecoration: 'none'
          }}
        >
          ← 목록으로
        </Link>
      </div>

      {/* 파일명 */}
      <h2 style={{ marginBottom: 16, fontSize: 22, fontWeight: 600, color: '#111827' }}>
        {fileName}
      </h2>

      {/* 비디오 플레이어 */}
      <video
        src={src}
        controls
        preload="metadata"
        style={{
          width: '100%',
          maxWidth: '100%',
          borderRadius: 8,
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          background: '#000'
        }}
      />

      {/* 버튼 영역 */}
      <div style={{ marginTop: 20 }}>
        <a
          href={`${HOST}/download/${encodeURIComponent(fileName)}`}
          style={{
            display: 'inline-block',
            padding: '10px 18px',
            backgroundColor: '#2563eb',
            color: '#fff',
            borderRadius: 6,
            textDecoration: 'none',
            fontSize: 15,
            fontWeight: 500
          }}
        >
          ⬇ 다운로드
        </a>
      </div>
    </div>
  );
}