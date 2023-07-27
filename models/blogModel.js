const mongoose = require('mongoose');


var blogSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    numViews:{
        type:Number,
        default:0
    },
    isLiked:{
        type:Boolean,
        default:false
    },
    isDisliked:{
        type:Boolean,
        default:false,
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    dislikes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    // image:{
    //     type:String,
    //     default:"https://www.google.com/url?sa=i&url=https%3A%2F%2Ffurkandanis.com%2Fblog-nedir-nasil-kullanilir%2F&psig=AOvVaw0i48X9NSjdQaJYvR1gW4DH&ust=1680476498617000&source=images&cd=vfe&ved=0CA0QjRxqFwoTCLCIr_jkif4CFQAAAAAdAAAAABAD"
    // },
    author:{
        type:String,
        default:"Admin"
    },
    images:[]
},
{
    toJSON:{
        virtuals:true
    },
    toObject:{
        virtuals:true
    },
    timestamps:true,
});


module.exports = mongoose.model('Blog', blogSchema);