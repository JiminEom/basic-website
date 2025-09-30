const mongoose = require('mongoose');
const { Schema } = mongoose;

const MembershipCodeSchema = new Schema({
  code:      { type: String, unique: true, required: true, index: true },
  tier:      { type: Number, enum: [2,3 ], default: 2 },

  //다회 사용 설정
  maxUses: {type:Number, default:1, min:1 },
  usedCount:{ type:Number, default:0, min:0 },

  // 사용/만료 정보 (참고용)
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30*24*60*60*1000) }, //30일
  lastUsedAt:{ type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('MembershipCode', MembershipCodeSchema);
