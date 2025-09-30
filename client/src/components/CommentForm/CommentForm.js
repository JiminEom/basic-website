import React, { useState } from 'react';
import axios from 'axios';

export default function CommentForm({ postId, onPosted }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return alert('댓글을 입력하세요.');
    setLoading(true);
    try {
      await axios.post(`/api/comments/${postId}`, { text });
      setText('');
      if (onPosted) onPosted();
    } catch (err) {
      console.error(err);
      alert('댓글 등록 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ marginTop: 12 }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="댓글을 입력하세요."
        rows={4}
        style={{ width: '100%', padding: '8px' }}
      />
      <div style={{ marginTop: 6 }}>
        <button type="submit" disabled={loading}>
          {loading ? '등록 중...' : '등록'}
        </button>
      </div>
    </form>
  );
}
