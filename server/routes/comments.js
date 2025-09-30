// server/routes/comments.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const { auth } = require('../middleware/auth'); // 기존 auth 미들웨어 사용 가정
const sanitizeHtml = require('sanitize-html');

// 서버에서 sanitize 여부 : 기본 true (안전)
// 재현용으로 XSS 실습 할 땐 환경변수로 false 설정 가능
const SERVER_SANITIZE = (process.env.SERVER_SANITIZE || 'true') !== 'false';

// sanitize options (허용 태그/속성은 최소로)
// 필터링을 위한거라, 안 할거면 빼버려도 됨.
const SANITIZE_OPTIONS = {
  allowedTags: ['b','i','em','strong','a','p','ul','ol','li'],
  allowedAttributes: {
    'a': ['href', 'target', 'rel']
  },
  transformTags: {
    'a': (tagName, attribs) => {
      const href = attribs.href || '';
      return {
        tagName: 'a',
        attribs: {
          ...attribs,
          rel: 'nofollow noopener noreferrer',
          target: '_blank',
          href
        }
      };
    }
  }
};

// ObjectId 유효성 검사 헬퍼
const isValidObjectId = (v) => mongoose.Types.ObjectId.isValid(v);

// 1) 댓글 작성
router.post('/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    // 디버깅 로그: 잘못된 값 들어오는지 확인용 (운영에선 레벨 조정)
    console.log('[POST /api/comments] params=', req.params, 'body_sample=', typeof text === 'string' ? text.slice(0,80) : text);

    // 1) postId 유효성 검사
    if (!isValidObjectId(postId)) {
      return res.status(400).json({ success: false, message: '잘못된 postId' });
    }

    // 2) text 검증
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: '댓글 내용 필요' });
    }

    let cleanText = text;
    if (SERVER_SANITIZE) {
      cleanText = sanitizeHtml(text, SANITIZE_OPTIONS);
    }

    // 3) 저장 — 절대 하드코딩 하지 말 것
    const comment = new Comment({
      postId,                // <- 변수 사용
      writer: req.user._id,  // 작성자 아이디 (auth 미들웨어가 req.user 세팅 가정)
      text: cleanText
    });

    await comment.save();
    return res.status(201).json({ success: true, comment });
  } catch (err) {
    console.error('[POST /api/comments] err=', err);
    return res.status(500).json({ success: false, message: '서버 에러' });
  }
});

// 2) 특정 게시글의 댓글 목록 조회 (페이징 간단히)
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    console.log('[GET /api/comments] params=', req.params);

    if (!isValidObjectId(postId)) {
      return res.status(400).json({ success: false, message: '잘못된 postId' });
    }

    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ postId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate('writer', 'name') // 작성자 이름만 불러오기
      .lean();

    return res.json({ success: true, comments });
  } catch (err) {
    console.error('[GET /api/comments] err=', err);
    return res.status(500).json({ success: false, message: '서버 에러' });
  }
});

module.exports = router;
