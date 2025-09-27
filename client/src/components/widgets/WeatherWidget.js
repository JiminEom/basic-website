import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function WeatherWidget({ city = 'Seoul' }) {
  const [w, setW] = useState(null);

  useEffect(() => {
    axios.get('/api/weather', { params: { city } })
      .then(res => {
        if (res.data.success) setW(res.data.weather);
      })
      .catch(err => console.error(err))
  }, [city]);

  if (!w) return <div style={boxStyle}>날씨 정보를 가져오지 못했습니다.</div>;

  const iconUrl = w.icon ? `https://openweathermap.org/img/wn/${w.icon}@2x.png` : '';

  return (
    <div style={boxStyle}>
      <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '6px' }}>
        {w.name} 현재 날씨
      </div>
      {/*<div style={{ fontSize: '14px', marginBottom: '4px' }}>{w.description}</div>*/}
      <div style={{ fontSize: '14px', marginBottom: '2px' }}>
        온도: {Math.round(w.temp)}°C (체감 {Math.round(w.feelsLike)}°C)
      </div>
      <div style={{ fontSize: '14px', marginBottom: '6px' }}>
        습도: {w.humidity}%
      </div>
      {iconUrl && (
        <img
          src={iconUrl}
          alt="날씨 아이콘"
          style={{ display: 'block', margin: '0 auto', width: 50, height: 50 }}
        />
      )}
    </div>
  );
}

const boxStyle = {
  display: 'inline-block',
  padding: '12px 16px',
  border: '1px solid #ddd',
  borderRadius: '12px',
  background: '#fff',
  boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
  lineHeight: 1.4,
};
