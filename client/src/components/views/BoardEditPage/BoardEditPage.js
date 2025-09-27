import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function BoardEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [newFile, setNewFile] = useState(null);
  const [origin, setOrigin] = useState(null); // 기존 게시글(첨부 확인용)

  useEffect(() => {
    axios.get(`/api/board/${id}`)
      .then(res => {
        if (res.data.success) {
          setOrigin(res.data.post);
          setTitle(res.data.post.title);
          setContent(res.data.post.content);
        } else {
          alert("게시글 불러오기 실패");
        }
      })
      .catch(err => console.error(err));
  }, [id]);

  const onSubmit = async (err) => {
    err.preventDefault();

    const fd = new FormData();
    fd.append('title', title);
    fd.append('content', content);
    if (newFile) fd.append('file', newFile);

    await axios.put(`/api/board/${id}`, fd)
      .then(res => {
        if (res.data.success) {
          alert("수정 완료");
          navigate(`/board/${id}`);
        } else {
          alert("수정 실패");
        }
      })
      .catch(err => console.error(err));
  };

  // absUrl=절대경로
  const isDev = (typeof window !== 'undefined' && window.location && window.location.port === '3000');
  const HOST = isDev ? 'http://localhost:5000' : '';
  const fileUrl = (origin && origin.fileUrl) ? origin.fileUrl : null;
  const absUrl = fileUrl
    ? (fileUrl.indexOf('http') === 0 ? fileUrl : HOST + fileUrl)
    : null;

  return (
    <div
      style={{
        width: '80%',
        maxWidth: 800,
        margin: '32px auto',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 20
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: 20,
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: 8
        }}
      >
        게시글 수정
      </h2>

      <form
        onSubmit={onSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        {/* 제목 입력 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontWeight: 'bold' }}>제목</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: 6
            }}
          />
        </div>

        {/* 내용 입력 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontWeight: 'bold' }}>내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            style={{
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              resize: 'vertical'
            }}
          />
        </div>

        {/* 현재 첨부 */}
        {/* 기존 파일이 있으면 링크로 확익 가능 */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>현재 첨부</div>
          {absUrl ? (
            <>
              <a
                href={absUrl}
                target="_blank"
                rel="noreferrer"
                style={{ marginRight: 12, color: '#2563eb' }}
              >
                새 탭에서 열기
              </a>
            </>
          ) : (
            <div style={{ fontSize: 14, color: '#6b7280' }}>첨부 없음</div>
          )}
        </div>

        {/* 새 파일 선택(있으면 교체) */}
        <input
          type="file"
          onChange={(e) => setNewFile(e.target.files?.[0] || null)}
          //accept=".png,.jpg,.jpeg,.gif,.pdf,.zip"
          style={{ marginBottom: 12 }}
        />

        {/* 버튼 */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="submit"
            style={{
              padding: '8px 16px',
              background: '#002169ff',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            저장
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              padding: '8px 16px',
              background: '#e5e7eb',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default BoardEditPage;
