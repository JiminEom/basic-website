import './App.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import LandingPage from './components/views/LandingPage/LandingPage';
import LoginPage from './components/views/LoginPage/LoginPage';
import RegisterPage from './components/views/RegisterPage/RegisterPage';
import auth from './hoc/auth';
//추가
import NavBar from './components/views/NavBar/NavBar';
import BoardListPage from './components/views/BoardListPage/BoardListPage';
import BoardWritePage from './components/views/BoardWritePage/BoardWritePage';
import BoardDetailPage from './components/views/BoardDetailPage/BoardDetailPage'
import BoardEditPage from './components/views/BoardEditPage/BoardEditPage'
import MyPage from './components/views/MyPage/MyPage'

// function App() {
//   return (
//     <Router>
//       <div>
//         <Routes>
//           <Route exact path="/" element ={auth(LandingPage,null)}/>
//           <Route exact path="/login" element={auth(LoginPage, false)}/>
//           <Route exactpath="/register" element={auth(RegisterPage, false)}/>
//         </Routes>
//       </div>
//   </Router>
//   );
// }

function App() {
  const AuthLandingPage = auth(LandingPage, null);
  const AuthLoginPage = auth(LoginPage, false);
  const AuthRegisterPage = auth(RegisterPage, false);
  const AuthBoardListPage = auth(BoardListPage, true);
  const AuthBoardWritePage = auth(BoardWritePage, true);
  const AuthBoardDetailPage = auth(BoardDetailPage, true);
  const AuthBoardEditPage = auth(BoardEditPage, true);
  const AuthMyPage = auth(MyPage,true);



  return (
    <Router>
      <div>
        <NavBar />
        <Routes>
          <Route path="/" element={<AuthLandingPage />} />
          <Route path="/login" element={<AuthLoginPage />} />
          <Route path="/register" element={<AuthRegisterPage />} />
          <Route path="/board" element={<AuthBoardListPage/>} />
          <Route path="/board/write" element={<AuthBoardWritePage/>} />
          <Route path="/board/:id" element={<AuthBoardDetailPage />} />
          <Route path="/board/edit/:id" element={<AuthBoardEditPage />} />
          <Route path="/me" element={<AuthMyPage />} />


          
        </Routes>
      </div>
    </Router>
  )
}


export default App;