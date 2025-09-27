const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10; //10자리의 salt를 만들어줌
const jwt = require('jsonwebtoken');


const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true, // 스페이스 없애줌
        unique: 1 //중복되지 않게
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        // 0: 일반유저, 1: 관리자, 2: 멤버십
        type: Number,
        default: 0
    },
    image: String,
    token: {
        //유효성 관리
        type: String
    },
    tokenExp: {
        //토큰 유효기간
        type: Number
    }
})

//next하면 user.save로 넘어감
userSchema.pre('save', function(next) {
    var user = this; //this는 userSchema를 가리킴
    //비밀번호 암호화
    if(user.isModified('password')) { //비밀번호가 바뀔 때만 암호화 시켜줌
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if(err) return next(err)
            bcrypt.hash(user.password, salt, function(err, hash) {
                if(err) return next(err)
                user.password = hash //hash된 비밀번호로 바꿔줌
                next();
            })
        })
    }else{
        next();
    }
})

// 비밀번호 비교
userSchema.methods.comparePassword = async function (plainPassword) {
  const isMatch = await bcrypt.compare(plainPassword, this.password);
  return isMatch;
};

// 토큰 생성
userSchema.methods.generateToken = async function () {
  const token = jwt.sign(this._id.toHexString(), 'secretToken');
  this.token = token;
  await this.save();
  return this;
};

userSchema.statics.findByToken = async function (token) {
  const userModel = this;
  // 토큰 decode
  const decoded = await new Promise((resolve, reject) => {
    jwt.verify(token, 'secretToken', (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
  // 유저 아이디로 찾고, 토큰이 DB와 일치하는지 확인
  const user = await userModel.findOne({ _id: decoded, token: token });
  return user;
};

const User = mongoose.model('User', userSchema) //모델로 감싸줌
module.exports = { User } //다른 곳에서도 쓸 수 있게 export해줌
