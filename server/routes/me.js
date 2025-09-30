// server/routes/me.js
const router = require('express').Router();
const bcrypt = require('bcrypt');
const { auth } = require('../middleware/auth'); // 기존 인증 미들웨어
const User = require('../models/User');

// 1) 내 정보 조회 (이메일/이름)
//auth를 먼저 실행하여 토큰 검증. 실패시 여기까지 못 들어옴
router.get('/me', auth, async (req, res) => {
  const { email, name, _id,role } = req.user; // auth 미들웨어가 req.user 셋팅
  return res.json({ success: true, me: { _id, email, name,role } });
});

// 2) 비밀번호 변경
// auth로 로그인 사용자만 변경 가능하게 함 
router.put('/me/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: '필드 누락' });
    }
    if (newPassword.length < 5) {
      return res.status(400).json({ success: false, message: '새 비밀번호는 5자 이상' });
    }

    //현재 비밀번호가 맞는지 확인
    const ok = await bcrypt.compare(currentPassword, req.user.password);
    if (!ok) {
      return res.status(400).json({ success: false, message: '현재 비밀번호가 올바르지 않습니다.' });
    }

    // 해시는 User 스키마의 pre('save')가 처리하도록(이미 있다면 유지)
    req.user.password = newPassword;
    await req.user.save();

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: '서버 오류' });
  }
});

module.exports = router;
