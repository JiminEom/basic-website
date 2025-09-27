import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector,useDispatch } from 'react-redux'
import axios from 'axios'
import {logoutUser} from '../../../_actions/user_action'

function NavBar() {
  const user = useSelector((state) => state.user);
  const isAuth = !!user?.isAuth;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = () => {
    axios.get('/api/users/logout', { withCredentials: true })
      .then(res => {
        if (res.data.success) {
          dispatch(logoutUser());   // 리덕스 상태 초기화
        }
      })
      .catch(err => {
        console.error('로그아웃 에러:', err);
      // 여기서는 굳이 alert 안 띄우고 무시
      })
      .finally(() => {
        navigate('/');  // 성공/실패 관계없이 홈으로 이동
      });
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end', // 오른쪽 정렬
        alignItems: 'center',
        backgroundColor: '#1e293b', // 진한 남색
        padding: '10px 20px',
        gap: '15px', // 메뉴 간격
      }}
    >
       {/* Landing 메뉴 */}
      <Link
        to="/"
        style={{
          color: '#e2e8f0',
          textDecoration: 'none',
          padding: '6px 10px',
          borderRadius: '6px',
          backgroundColor: '#334155',
        }}
      >
        🏠홈
      </Link>
      
      {/* Board 메뉴 */}
      <Link
        to="/board"
        style={{
        color: '#e2e8f0',
        textDecoration: 'none',
        padding: '6px 10px',
        borderRadius: '6px',
        backgroundColor: '#334155',
      }}
      >
      📝게시판
      </Link>

      {!isAuth ? (
        <>
        {user.userData && user.userData.isAuth?(
          <span
            onClick={logoutHandler}
            style={{
              color: '#e2e8f0',
              textDecoration: 'none',
              padding: '6px 10px',
              borderRadius: '6px',
              backgroundColor: '#334155',
              cursor: 'pointer'
            }}
          >
            😺로그아웃
          </span>):(<Link
            to="/login"
            style={{
              color: '#e2e8f0',
              textDecoration: 'none',
              padding: '6px 10px',
              borderRadius: '6px',
              backgroundColor: '#334155',
            }}
          >
            😽로그인
          </Link>)}
          
          <Link
            to="/register"
            style={{
              color: '#e2e8f0',
              textDecoration: 'none',
              padding: '6px 10px',
              borderRadius: '6px',
              backgroundColor: '#334155',
            }}
          >
            🐱회원가입
          </Link>

          <Link
            to="/me"
            style={{
              color: '#e2e8f0',
              textDecoration: 'none',
              padding: '6px 10px',
              borderRadius: '6px',
              backgroundColor: '#334155',
            }}
          >
            😎마이페이지
          </Link>

          {user.userData && user.userData.isAuth ? (
          <span style={{color:'white',fontWeigh:'bold'}}>{user.userData.name}님❕</span>
        ) : (
          <span style={{color:'white',fontWeigh:'bold'}}>로그인 해주세요</span>
        )}
        </>
      ) : (
        <Link
          to="/logout"
          style={{
            color: '#e2e8f0',
            textDecoration: 'none',
            padding: '6px 10px',
            borderRadius: '6px',
            backgroundColor: '#334155',
          }}
        >
          Logout
        </Link>

      )}
    </div>
  )
}

export default NavBar
