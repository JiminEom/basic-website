import React from 'react';
import DOMPurify from 'dompurify';//XSS 방지 라이브러리, HTML sanitize하여 악의적인 코드나 속성 제거 

//XSS공격을 방지하기 위해 허용 태그, 전역 허용 속성 목록을 선언
function CommentItem({ c }) {
  const clean = DOMPurify.sanitize(c.text, {
    ALLOWED_TAGS: ['b','i','em','strong','a','p','ul','ol','li'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });

  return (
    <div style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
      <div style={{ fontSize: 12, color: '#666' }}>
        {c.writer?.name || '익명'} · {new Date(c.createdAt).toLocaleString()} {/*writer가 없을 때 익명으로 처리, 날짜 추가*/},
      </div>
      <div className="comment-body" dangerouslySetInnerHTML={{ __html: clean }} /> {/*정제된 HTML을 실제 DOM에 주입 */}
    </div>
  );
}

export default function CommentList({ comments }) {
  if (!comments || comments.length === 0) return <div>댓글이 없습니다.</div>;
  return (
    <div>
      {/*배열을 순회하며 CommentItem 생성 */}
      {comments.map(c => <CommentItem key={c._id} c={c} />)}
    </div>
  );
}
