import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CommentForm from '../../CommentForm/CommentForm'
import CommentList from '../../CommentList/CommentList'

function BoardDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const navigate = useNavigate();

  const [comments, setComments]=useState([]);

  useEffect(() => {
    axios.get(`/api/board/${id}`)
      .then(res => {
        if (res.data.success) {
          setPost(res.data.post);
          setFileUrl(res.data.post.fileUrl);
        } else {
          alert("게시글 불러오기 실패");
        }
      })
      .catch(err => console.error(err));
  }, [id]);

  //댓글 불러오기
  const fetchComments = async()=>{
    try{
      const res = await axios.get(`/api/comments/${id}`);
      if (res.data.success) setComments(res.data.comments);
    }catch(err){ console.error(err) }
  };

  useEffect(()=>{
    if(post){
      fetchComments()
    }
  }, [post]);

  if (!post) return <div>로딩중...</div>;

  // 첨부파일 절대경로 처리
  const HOST = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '';
  //absUrl : 첨부파일의 "절대 경로"를 만들어주는 변수 
  const absUrl = post.fileUrl
    ? (post.fileUrl.startsWith('http') ? post.fileUrl : HOST + post.fileUrl)
    : null;

  const onDelete = async () => {
    const ok = window.confirm('정말 삭제하시겠습니까?');
    if (!ok) return;

    try {
      const res = await axios.delete(`/api/board/${id}`);
      if (res.data.success) {
        alert('삭제 되었습니다.');
        navigate('/board');
      } else {
        alert('삭제 실패하였습니다.');
      }
    } catch (err) {
      //console.error(err);
      alert('삭제 중 오류가 발생하였습니다.');
    }
  };

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
      {/* 제목 */}
      <h2
        style={{
          marginTop: 0,
          marginBottom: 12,
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: 8
        }}
      >
        {post.title}
      </h2>

      {/* 작성일 */}
      <p
        style={{
          color: '#6b7280',
          fontSize: 14,
          margin: '0 0 20px'
        }}
      >
        {post.createdAt ? new Date(post.createdAt).toLocaleString('ko-KR') : ''}
      </p>

      {/* 본문 */}
      <div
        style={{
          whiteSpace: 'pre-wrap',
          lineHeight: 1.6,
          marginBottom: 20
        }}
      >
        {post.content}
      </div>

      {/* 첨부 파일 표시 */}
      {absUrl && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>첨부파일</div>
          <a
            href={`${HOST}${post.fileUrl}`}//항상 절대경로를 사용 
            target="_blank"//새탭으로 열기 
            rel="noreferrer" // 새탭 열기의 보안 속성. (새탭에서 어떤 페이지에서 왔는지 서버 로그에 남지 않음)
            style={{ marginRight: 12, color: '#002169ff' }}
          >
            새 탭에서 열기
          </a>
          <a
            href={`${HOST}/download/${encodeURIComponent(post.fileName)}`} //항상 절대경로를 사용
            download
            style={{ color: '#002169ff' }}
          >
            다운로드
          </a>
        </div>
      )}

      {/*댓글영역*/}
      <div style={{ marginTop:24}}>
        <h3 style={{ marginBottom:12 }}>댓글</h3>
        {/*댓글 작성폼 */}
        <CommentForm postId={id} onPosted={fetchComments}/>
        {/*댓글목록*/}
        <div style = {{ marginTop:12 }}>
          <CommentList comments = {comments}/>
        </div>
      </div>

      {/* 버튼 영역 */}
      <div style={{ display: 'flex', gap: 10 }}>
        <Link to={`/board/edit/${post._id}`} style={{ textDecoration: 'none' }}>
          <button
            style={{
              padding: '8px 16px',
              background: '#374151',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            수정
          </button>
        </Link>

        <button
          onClick={onDelete}
          style={{
            padding: '8px 16px',
            background: '#6B7280',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          삭제
        </button>

        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '8px 16px',
            background: '#e5e7eb',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          뒤로가기
        </button>
      </div>
    </div>
  );
}

export default BoardDetailPage;
