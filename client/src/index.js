import React from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import App from './App';
//import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import 'antd/dist/reset.css'; //antd 디자인 import, 버전 업 되면서 바뀜
import { applyMiddleware, createStore } from 'redux';
import promiseMiddleware from 'redux-promise';
import {thunk} from 'redux-thunk';
import Reducer from './_reducer';

//권한
import axios from 'axios';
//axios.defaults.withCredentials = true; // 쿠키 자동 포함

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    const s = err?.response?.status;
    if (s === 401) {
      alert('로그인이 필요합니다.');
      window.location.href = '/login';
    } else if (s === 403) {
      alert('권한이 없습니다.');
      window.history.back(); // or 원하는 경로로 이동
    }
    return Promise.reject(err);
  }
);

const createStoreWithMiddleware = applyMiddleware(promiseMiddleware, thunk)(createStore);

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <Provider
    store={createStoreWithMiddleware(
      Reducer,
      window.__REDUX_DEVTOOLS_EXTENSION__ &&
      window.__REDUX_DEVTOOLS_EXTENSION__()
    )}
  >
    <App />
  </Provider>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//ServiceWorker.unregister();
