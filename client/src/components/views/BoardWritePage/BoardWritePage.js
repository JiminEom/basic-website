import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function BoardWritePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const[file, setFile]=useState(null); //첨부파일 상태 

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      return alert('제목과 내용을 입력해주세요.');
    }

    const fd = new FormData();
    fd.append('title',title);
    fd.append('content',content)
    if(file) fd.append('file',file)

    try {
      const res = await axios.post('/api/board/write', fd,{
        headers:{'Content-Type':'multipart/form-data'}
      });
      if (res.data.success) {
        alert('게시글 등록 성공');
        navigate('/board'); // 등록 후 목록으로 이동
      } else {
        alert('등록 실패: ' + res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert('서버 에러');
    }
  };

  return (
    <div style={{width:'70%',maxWidth:800,margin:'32px auto'}}>
      <h2 style={{marginTop:0}}>글쓰기</h2>
      <form onSubmit={onSubmit} style={{display:'flex',flexDirection:'column',gap:10}}>
        <input style={ipt} placeholder="제목" value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea style={{...ipt,minHeight:200,resize:'vertical'}} placeholder="내용" value={content} onChange={e=>setContent(e.target.value)} />

        {/* 파일 첨부 버튼 */}
        <input
          type="file"
          onChange={(e)=>setFile(e.target.files?.[0] || null)}
          //accept=".png,.jpg,.jpeg,.gif,.pdf,.zip" // 확장자 화이트리스트
          style={{ marginBottom:12 }}
        />

        <div style={{display:'flex',gap:8}}>
          <button type="submit" style={btnPrimary}>등록</button>
          <button type="button" style={btnGhost} onClick={()=>navigate('/board')}>취소</button>
        </div>
      </form>
    </div>
  );
}
const ipt = {padding:'10px 12px',border:'1px solid #e5e7eb',borderRadius:6,fontSize:16};
const btnPrimary = {padding:'10px 16px',background:'#2563eb',color:'#fff',border:'none',borderRadius:6,cursor:'pointer'};
const btnGhost = {padding:'10px 16px',background:'#f3f4f6',border:'1px solid #e5e7eb',borderRadius:6,cursor:'pointer'};
export default BoardWritePage;