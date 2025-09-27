const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = mongoose.Schema({
    title: {
        type:String,
        maxlength:50
    },
    content:{
        type:String,
        maxlength:1000
    },
    writer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },fileUrl:{type:String, default:null}
},{
    timestamps: true
})


const Post = mongoose.model('Post', postSchema);
module.exports = { Post }