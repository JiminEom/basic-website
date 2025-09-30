// server/seedMembershipCodes.js
const mongoose = require('mongoose');
const path = require('path');
const MembershipCode = require('./models/MembershipCode');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const codes = [
      { code: 'WELCOME123', tier: 2 },
      { code: 'PREMIUM999', tier: 3 },
      { code: 'TRIAL30', tier: 2, expiresAt: new Date(Date.now() + 30*24*60*60*1000) },
      { code: 'TESTMEMBER', tier:2, maxUses:100 },
      { code: 'TESTPREMIUM999', tier:3, maxUses:100}
    ];

    await MembershipCode.insertMany(codes);
    console.log('✅ 기본 멤버십 코드 삽입 완료');
    process.exit(0);
  } catch (err) {
    console.error('❌ 에러:', err);
    process.exit(1);
  }
}

seed();
