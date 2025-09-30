// src/components/views/MyPage/MyPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { auth as authAction } from '../../../_actions/user_action';
import axios from 'axios';
import './MyPage.css'; // 디자인

export default function MyPage() {
  const dispatch = useDispatch();
  const userData = useSelector(state => state.user?.userData);

  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' });

  //권한을 보여주기 위해 숫자를 문자열로 변환
  const roleMap ={
    0:'일반 사용자',
    1:'관리자',
    2:'멤버십 사용자',
    3:'프리미엄 사용자'
  }

  // 혹시 userData가 비어있을 때 대비해서 한 번 더 불러오기
  useEffect(() => {
    if (!userData) dispatch(authAction());
  }, [dispatch, userData]);

  const onChangePassword = async () => {
    if (!pwd.currentPassword || !pwd.newPassword) {
      alert('현재/새 비밀번호를 입력하세요.');
      return;
    }
    try {
      const { data } = await axios.put('/api/users/me/password', pwd);
      if (data.success) {
        alert('비밀번호가 변경되었습니다.');
        setPwd({ currentPassword: '', newPassword: '' });
      } else {
        alert(data.message || '변경 실패');
      }
    } catch (e) {
      alert(e?.response?.data?.message || '변경 실패');
    }
  };

  if (!userData) return <div>로딩중...</div>;

  return (
    <div className="mypage">
      <h2 className="mypage-title">마이페이지</h2>

      {/* 내 정보 */}
      <div className="mypage-card">
        <h3 className="mypage-card-title">내 정보</h3>
        <div className="mypage-info-row">
          <span className="mypage-label">이메일</span>
          <span>{userData.email}</span>
        </div>
        <div className="mypage-info-row">
          <span className="mypage-label">이름</span>
          <span>{userData.name}</span>
        </div>
        <div className ="mypage-info-row">
            <span className="mypage-label">권한</span>
            <span>{roleMap[userData.role]}</span>
        </div>
      </div>

      {/* 비밀번호 변경 */}
      <div className="mypage-card">
        <h3 className="mypage-card-title">비밀번호 변경</h3>
        <div className="mypage-form-group">
          <label className="mypage-label">현재 비밀번호</label>
          <input
            type="password"
            value={pwd.currentPassword}
            onChange={e => setPwd({ ...pwd, currentPassword: e.target.value })}
            className="mypage-input"
          />
        </div>
        <div className="mypage-form-group">
          <label className="mypage-label">새 비밀번호</label>
          <input
            type="password"
            value={pwd.newPassword}
            onChange={e => setPwd({ ...pwd, newPassword: e.target.value })}
            className="mypage-input"
          />
        </div>
        <button onClick={onChangePassword} className="mypage-button">
          비밀번호 변경
        </button>
      </div>
    </div>
  );
}
