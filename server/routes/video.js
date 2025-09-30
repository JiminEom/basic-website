const router = require('express').Router();
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '../uploads');
const VIDEO_EXTS = new Set(['.mp4', '.webm', '.ogg', '.mkv', '.mov']);

router.get('/uploads', async (req, res) => {
  try {
    const items = await fs.promises.readdir(UPLOAD_DIR, { withFileTypes: true });

    // 파일만 추려서 확장자 필터
    const files = items
      .filter(d => d.isFile())
      .map(d => d.name)
      .filter(name => VIDEO_EXTS.has(path.extname(name).toLowerCase()))
      .map(name => ({
        name,                                   // 파일명
        url: `/uploads/${encodeURIComponent(name)}` // 정적 경로 (브라우저에서 직접 재생 가능)
      }));

    res.json({ success: true, files });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: '목록 조회 실패' });
  }
});

module.exports = router;
