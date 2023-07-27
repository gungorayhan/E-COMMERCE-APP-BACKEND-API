const mongoose = require('mongoose'); 

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    slug:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    description:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    category:{
        // type:mongoose.Schema.Types.ObjectId,
        // ref:"Category"
        type:String,
        require:true
    },
    brand:{
        type:String,
        // enum:["Apple","Samsung","Lenovo"]
        require:true
    },
    quantity:{
        type:Number,
        require:true
    },
    sold:{
        type:Number,
        default:0,
        // select:false
    },
    images:[{
        public_id:String,
        url:String
    }],
    // color:{
    //     type:String,
    //     // enum:["Black","Brown","Red"]
    //     require:true
    // },
    color:[],
    tags:String,
    ratings:[
        {
            star:Number,
            comment:String,
            postedby:{type:mongoose.Schema.Types.ObjectId, ref:"User"}
        }
    ],
    totalrating:{
        type:String,
        default:0
    }
}
,
{timestamps:true}
);


module.exports = mongoose.model('Product', productSchema);