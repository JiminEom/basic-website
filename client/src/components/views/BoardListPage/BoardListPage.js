import React,{useEffect, useState} from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import './BoardListPage.css'; // ← 추가

function BoardListPage() {
  const [posts, setPosts] = useState([]);
  // ✅ 오타 주의: totals → total
  const [meta, setMeta] = useState({ page:1, limit:10, total:0, totalPages:1 });

  const [searchParams, setSearchParams] = useSearchParams();
  const qInit = searchParams.get('q') || '';
  const rawField = searchParams.get('field') || 'all';
  const fieldInit = rawField; // (작성자 검색 제거 상태)
  const pageInit = parseInt(searchParams.get('page') || '1', 10);

  const [q, setQ] = useState(qInit);
  const [field, setField] = useState(fieldInit);
  const [page, setPage] = useState(pageInit);
  const limit = 10;

  const fetchList = async () => {
    const params = { q, field, page, limit, sort:'recent' };
    const res = await axios.get('/api/board', { params });
    if (res.data.success) {
      setPosts(res.data.posts);
      setMeta({
        page: res.data.page,
        limit: res.data.limit,
        total: res.data.total,
        totalPages: res.data.totalPages
      });
    } else {
      alert('게시글 불러오기 실패');
    }
  };

  useEffect(() => {
    fetchList().catch(console.error);
    setSearchParams({ q, field, page: String(page) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, field, page]);

  const onSubmit = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const goPage = (p) => {
    if (p < 1 || p > meta.totalPages) return;
    setPage(p);
  };

  return (
    <div className="board-wrap">
      {/* 상단 */}
      <div className="board-header">
        <h2 className="board-title">게시판</h2>
        <Link to="/board/write" className="btn btn-primary">글쓰기</Link>
      </div>

      {/* 검색 폼 */}
      <form onSubmit={onSubmit} className="search">
        <select value={field} onChange={(e)=>setField(e.target.value)}>
          <option value="all">제목+내용</option>
          <option value="title">제목</option>
          <option value="content">내용</option>
        </select>
        <input
          type="text"
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          placeholder="검색어를 입력하세요"
        />
        <button type="submit" className="btn">검색</button>
      </form>

      {/* 총 건수 */}
      <div className="meta">총 {meta.total}건 · {meta.page}/{meta.totalPages} 페이지</div>

      {/* 목록 */}
      <table className="table">
        <thead>
          <tr>
            <th>번호</th>
            <th width="50%">제목</th>
            <th>작성자</th>
            <th>작성일</th>
          </tr>
        </thead>
        <tbody>
          {posts.length === 0 ? (
            <tr><td colSpan={4} style={{padding:20, textAlign:'center', color:'var(--muted)'}}>검색 결과가 없습니다.</td></tr>
          ) : posts.map((p,i)=>(
            <tr key={p._id}>
              <td>{(meta.page-1)*meta.limit + (i+1)}</td>
              <td>
                <Link to={`/board/${p._id}`} className="link">
                  <strong>{p.title}</strong>
                </Link>
              </td>
              <td>{p.writer?.name ?? p.author ?? '-'}</td>
              <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString('ko-KR') : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 페이지네이션 */}
      <div className="pagination">
        <button onClick={()=>goPage(meta.page-1)} disabled={meta.page<=1}>이전</button>
        {Array.from({length: meta.totalPages}, (_,idx)=>idx+1).slice(0,10).map((p)=>
          <button
            key={p}
            onClick={()=>goPage(p)}
            disabled={p===meta.page}
            style={{ fontWeight: p===meta.page ? 700 : 400 }}
          >
            {p}
          </button>
        )}
        <button onClick={()=>goPage(meta.page+1)} disabled={meta.page>=meta.totalPages}>다음</button>
      </div>
    </div>
  );
}

export default BoardListPage;
