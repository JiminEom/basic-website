import React,{useEffect} from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import WeatherWidget from '../../widgets/WeatherWidget'; 
import './LandingPage.css';  

function LandingPage(props) {
  const navigate = useNavigate();
  
  useEffect(() => {
    axios.get('/api/hello')
    .then(response => console.log(response.data))
  }, [])
  
  const onClickHandler = () => {
      axios.get(`/api/users/logout`)
          .then(response => {
              if (response.data.success) {
                  navigate('/login')
              } else {
                  alert('로그아웃 하는데 실패 했습니다.')
              }
          })
  }

  return (
    <div className="landing">
      <h2 className="welcome">안녕하세요 👾</h2>

      <button className="primaryBtn" onClick={onClickHandler}>
        로그아웃
      </button>

      <div className="glass-card">
        <WeatherWidget city="Seoul" />
      </div>
    </div>
  );
}
export default LandingPage
