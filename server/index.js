const path = require('path')
require('dotenv').config({path:path.join(__dirname,'.env')});
const axios = require('axios');


const express = require('express'); //express모듈 불러옴
const { mongo } = require('mongoose');
const app = express(); // function을 통해 express 앱 생성
const port = 5000; //5000번 포트 백엔드
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { auth } = require('./middleware/auth');
const{ User } = require("./models/User");
const config = require('./config/key');

const { Post } = require('./models/Post');
const { Types: { ObjectId } } = require('mongoose');

const commentsRouter = require('./routes/comments');

const mongoose = require('mongoose');
const e = require('express');

//fileupload
const multer = require('multer');
const fs = require('fs');


mongoose.connect(process.env.MONGODB_URI,{}).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err)); //mongoose로 에러가 있으면 에러 로그를 띄운다. 

app.use(express.json());
app.use(express.urlencoded({extended: true})); 
app.use(bodyParser.json());
app.use(cookieParser());
// 업로드 폴더 보장
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// 정적 제공: 브라우저에서 /uploads/... 로 접근 가능
app.use('/uploads', express.static(UPLOAD_DIR));



// multer 스토리지 + 파일명
// 파일명을 저장할 때, 날짜+파일명
// 디스크에 저장 
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    //ext = 원본 파일명의 확장자
    const ext = path.extname(file.originalname);
    //base = 확장자를 뺀 파일명 본체 
    const base = path.basename(file.originalname, ext);
    cb(null, `${Date.now()}-${base}${ext}`);
  }
});
//multer 인스턴스 생성, 파일 업로드 미들웨어의 "객체 생성"부분
const upload = multer ({storage});
//application/x-www-form-urlencoded 이런 형태로 된 데이터를 분석해서 가져올 수 있게 해줌

//uploads 하는데에 있어 에러를 일관되게 JSON응답으로 돌려줄 수 있음 
const safeSingle = (field) => (req, res, next) => {
  upload.single(field)(req, res, (err) => {
    if (err) {
      console.error('[multer err]', err);
      return res.status(400).json({ success: false, message: `업로드 실패: ${err.message}` });
    }
    next();
  });
};



app.get('/', (req, res) => {res.send('Hello World!');});

app.get('/api/hello', (req, res) => {
    res.send("안녕하세요 ~")
});

//권한 확인
async function ownerOnly(req, res, next){
  const { id } = req.params;
  if(!ObjectId.isValid(id)){
    return res.status(400).json({success:false, message:"잘못된 ID형식"})
  }
  try{
    const post = await Post.findById(id).select('writer')
    if(!post) return res.status(404).json({success:false,message:'게시글 없음'})

    const me = req.user
    const isOwner = post.writer?.toString()===me._id.toString();
    const isAdmin = !!me.isAdmin;
    if(!isOwner&& !isAdmin){
      return res.status(403).json({success:false, message:'권한 없음'})
    }
    next()
  }catch(err){
    console.error(err);
    res.status(500).json({success:false, message:'서버 에러'})
  }
}


//회원가입 route
app.post('/api/users/register', async(req, res) => {
    //회원가입할 때 필요한 정보들을 client에서 가져오면 그것들을 데이터베이스에 넣어준다.
    //정보가 user 모델에 저장됨 
    const user = new User(req.body)
    user.save().then((userInfo) => res.status(200).json({success: true}))
    .catch((err) => res.json({success: false, err}))
});


//로그인 route 
app.post("/api/users/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다.",
      });
    }

    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch) {
      return res.json({
        loginSuccess: false,
        message: "비밀번호가 틀렸습니다.",
      });
    }

    const userWithToken = await user.generateToken();
    res
      .cookie("x_auth", userWithToken.token)
      .status(200)
      .json({ loginSuccess: true, userId: userWithToken._id, name:user.name, });
  } catch (err) {
    return res.status(400).send(err);
  }
});
        
//인증(auth) route
app.get("/api/users/auth",auth, (req, res)=>{
    //여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 true라는 말
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})

// 로그아웃 route
app.get("/api/users/logout", auth, async (req, res) => {
  try {
    await User.findOneAndUpdate(
      { _id: req.user._id },
      { token: "" } // 토큰을 지워줌
    );
    return res.status(200).send({ success: true });
  } catch (err) {
    return res.json({ success: false, err });
  }
});

//게시판 
app.get('/api/board', async (req, res) => {
  try {
    const {
      q = '',                 // 검색어 (없으면 전체)
      field = 'all',          // 'title' | 'content' | 'author' | 'all'
      page = 1,
      limit = 10,
      sort = 'recent'         // 'recent' | 'old' | 'popular' 등 확장 여지
    } = req.query;

    // 1) 필터 만들기 (빈 검색어면 전체 조회)
    const filter = {};
    if (q && q.trim()) {
      const kw = q.trim();

      // (A) 간단한 정규식 검색 (한글 포함, 대소문자 무시)
      const rx = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

      if (field === 'title') filter.title = rx;
      else if (field === 'content') filter.content = rx;
      else {
        // 제목/내용 OR 검색
        filter.$or = [{ title: rx }, { content: rx }];
      }
      //console.log('[board filter]=', JSON.stringify(filter));
    }

    // 2) 정렬 옵션
    let sortOpt = { _id: -1 }; // recent
    if (sort === 'old') sortOpt = { _id: 1 };
    // if (sort === 'popular') sortOpt = { views: -1 }; // 뷰 카운트 있을 때

    // 3) 페이지네이션
    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.min(Math.max(parseInt(limit), 1), 50);

    const [total, posts] = await Promise.all([
      Post.countDocuments(filter),
      Post.find(filter)
        .sort(sortOpt)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('writer','name')
        .lean()
    ]);

    return res.status(200).json({
      success: true,
      posts,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "서버에러" });
  }
});



//게시글 작성 
app.post('/api/board/write', auth,safeSingle('file'), async (req, res)=>{
  try{
    const user = req.user;
    const { title, content } = req.body;
    if(!title||!content){
      return res.status(400).json({success:false, message:"모든 값을 입력해주세요."})
    }

    // OK
    const fileName = req.file? req.file.filename:null;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    
    const post = await Post.create({ title, content, writer:req.user._id, fileUrl, authorName:user.name, fileName})

    return res.status(200).json({success:true, message:"게시글 등록 성공",post});
  }catch(err){
    console.error('[WRITE ERROR]', err); //
    return res.status(500).json({success:false, message:"서버에러"})
  }
})

// 특정 게시글 가져오기
app.get('/api/board/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "게시글 없음" });
    res.status(200).json({ success: true, post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "서버 에러" });
  }
});

// 게시글 수정하기
app.put('/api/board/:id', auth,ownerOnly,upload.single('file'), async (req, res) => {
  try {
    const { title, content } = req.body;
    const updates = {title,content}

    if (req.file) { // 새 파일 선택했을 때만 교체
      updates.fileUrl = `/uploads/${req.file.filename}`;
    }
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $set:updates },
      { new: true }
    );
    if (!updatedPost) return res.status(404).json({ success: false, message: "게시글 없음" });
    res.status(200).json({ success: true, post: updatedPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "서버 에러" });
  }
});

//게시글 삭제
app.delete('/api/board/:id',auth, ownerOnly, async(req,res)=>{
  const {id} =req.params;
  
  if (!ObjectId.isValid(id)) {
  return res.status(400).json({ success: false, message: '잘못된 ID 형식' });
}

  try{
    const deletedPost = await Post.findByIdAndDelete(id);
    if(!deletedPost){
      return res.status(404).json({success:false, message:"게시글 없음"})
    }return res.status(200).json({success:true, message:"게시글 삭제 성공"})
  }catch(err){
    console.error(err);
    return res.status(500).json({success:false, message:"서버 에러"})
  }
})


// 다운로드 강제
app.get('/download/:filename', (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: '파일 없음' });
  }

  res.download(filePath, req.params.filename, (err) => {
    if (err) {
      console.error('파일 다운로드 오류:', err);
      res.status(500).send('파일 다운로드 실패');
    }
  });
});

//날씨 가져오기 
app.get('/api/weather',async(req,res)=>{
  try{
    const city = ('Seoul');
    const apiKey = process.env.OWM_API_KEY;
    //console.log("OWM_API_KEY:", process.env.OWM_API_KEY);


    const url = 'https://api.openweathermap.org/data/2.5/weather';
    const { data } = await axios.get(url, {
      params: { q: city, appid: apiKey, units: 'metric', lang: 'kr' }
  })
    const payload = {
      name: data.name,
      temp: data.main?.temp,
      feelsLike: data.main?.feels_like,
      humidity: data.main?.humidity,
      description: data.weather?.[0]?.description,
      icon: data.weather?.[0]?.icon
    };
    res.json({ success: true, weather: payload });
  } catch (err) {
    console.error('[WEATHER]', err?.response?.data || err.message);
    res.status(500).json({ success: false, message: '날씨 가져오기 실패' });
  }
});

//mypage연결
app.use('/api/users', require('./routes/me'));

//댓글
app.use('/api/comments', commentsRouter);

//멤버십
app.use('/api/membership', require('./routes/membersip'))

//동영상
//uploads 아래 파일을 정적으로 서빙 
app.use('/api/video', require('./routes/video'));
// JSON 파싱

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});