import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function VideoListPage() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    axios.get('/api/video/uploads')
      .then(res => {
        if (res.data.success) setFiles(res.data.files);
      })
      .catch(console.error);
  }, []);

  if (!files.length) return <div style={{ padding: 16 }}>동영상이 없습니다.</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>업로드 동영상</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {files.map(f => (
          <div key={f.name} style={{
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            overflow: 'hidden',
            background: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            {/* 썸네일 */}
            <Link to={`/videos/${encodeURIComponent(f.name)}`}>
              <video
                src={f.url}
                style={{width:'100%', height:120, objectFit:'cover'}}
                muted
                playsInline
              />
            </Link>

            {/* 정보 */}
            <div style={{ padding: '8px 12px' }}>
              <div style={{
                fontWeight: 600,
                fontSize: 14,
                marginBottom: 4,
                color: '#1e293b'
              }}>
                {f.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}