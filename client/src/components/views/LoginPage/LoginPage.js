import React,{useState} from 'react'
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../../_actions/user_action';
import { useNavigate } from 'react-router-dom';

function LoginPage(props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [Email, setEmail] = useState("")
  const [Password, setPassword] = useState("")
  const onEmailHandler = (event) => {
    setEmail(event.currentTarget.value)
  }

  const onPasswordHandler = (event) => {
    setPassword(event.currentTarget.value)
  }
  const onSubmitHandler = (event) => {
    event.preventDefault(); //페이지 리프레쉬 방지
    
    let body = {
      email: Email,
      password: Password
    }

    dispatch(loginUser(body))
    .then(response =>{
      if(response.payload.loginSuccess){
        //props.histroy.push('/')
        navigate('/')
      }else{
        alert(response.payload.message||"로그인에 실패했습니다.")
      }
    }).catch(error=> {
      console.error('로그인 중 오류 발생: ', error);
      alert('로그인 중 오류 발생')
    });
  };

  return (
    <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center'
            , width: '100%', height: '100vh'
    }}>
        <form style={{ display: 'flex', flexDirection: 'column' }}
        onSubmit={onSubmitHandler}>
            <label>Email</label>
            <input type="email" value={Email} onChange={onEmailHandler} />
            <label>Password</label>
            <input type="password" value={Password} onChange={onPasswordHandler} />
            <br/>
            <button type="submit">
                Login
            </button>
        </form>
    </div>
  )
}

export default LoginPage
