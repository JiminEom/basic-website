const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    postId: {type: Schema.Types.ObjectId, ref: 'Post', required:true},
    writer:{ type:Schema.Types.ObjectId, ref :'User', required:true},
    text: { type:String, required: true },
    createdAt : { type:Date, default:Date.now }
})

module.exports = mongoose.model('Comment', CommentSchema)