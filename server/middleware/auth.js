const { User } = require("../models/User");

let auth = async (req, res, next) => {
  try {
    // 클라이언트 쿠키에서 토큰을 가져옴
    let token = req.cookies.x_auth;

    // 토큰을 복호화한 후 유저를 찾음
    const user = await User.findByToken(token);
    if (!user) {
      return res.json.status(401)({ isAuth: false, error: true,message:"인증 필요" });
    }
    req.token = token;
    req.user = user;
    req.user.isAdmin = user.role ===1; //권한확인
    next(); // next 없으면 미들웨어에 갇힘
  } catch (err) {
    return res.status(400).send(err);
  }
};

module.exports = { auth };
