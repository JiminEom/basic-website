const router = require('express').Router();
const MembershipCode = require('../models/MembershipCode');
const { User } = require('../models/User');
const { auth } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

router.post('/redeem', auth, async (req, res) => {
  try {
    const raw = (req.body.code || '').trim().toUpperCase();
    if (!raw) {
      return res.status(400).json({ success: false, status: 'missing', message: '코드를 입력하세요.' });
    }

    const doc = await MembershipCode.findOne({ code: raw });
    if (!doc) {
      return res.status(404).json({ success: false, status: 'invalid', message: '존재하지 않는 코드입니다.' });
    }

    if (doc.expiresAt && doc.expiresAt < new Date()) {
      return res.status(400).json({ success: false, status: 'expired', message: '만료된 코드입니다.' });
    }

    const updated = await MembershipCode.findOneAndUpdate(
        {_id: doc._id, usedCount:{$lt: doc.maxUses}},
        {$inc :{usedCount:1}, $set:{lastUsedAt:new Date()}},
        {new : true}
    )
    if (!updated) {
      return res.status(400).json({ success:false, status:'used', message:'이미 사용된 코드입니다.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ success: false, status: 'unauth', message: '로그인이 필요합니다.' });
    }

    const oldRole = typeof user.role === 'number' ? user.role : 0; // 숫자 롤 유지 가정(0,1,2,3)
    user.role = doc.tier; // doc.tier는 2(멤버) 또는 3(프리미엄)이어야 합니다.
    await user.save();

    return res.json({
      success: true,
      status: 'applied',
      message: '멤버십 적용 성공',
      oldRole,
      newRole: user.role
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, status: 'error', message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;