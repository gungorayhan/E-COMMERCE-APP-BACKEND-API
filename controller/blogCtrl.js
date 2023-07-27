const Blog = require("../models/blogModel")
const asyncHandler=require("express-async-handler")

//userModel
const User = require("../models/userModel")

//validate
const validateMongoDbId=require("../utils/validateMongodbId")

//uploadImage
const cloudinaryUploadImg = require("../utils/cloudinary")

//fs
const fs=require("fs")

//create Blog
const createBlog=asyncHandler(async(req,res)=>{
try {
    const newBlog= await Blog.create(req.body)
    res.json(newBlog)
} catch (error) {
    throw new Error(error)
}
})


//update Blog
const updateBlog=asyncHandler(async(req,res)=>{
    const {id}= req.params;
    validateMongoDbId(id)
    try {
        const updateBlog= await Blog.findByIdAndUpdate(id,req.body,{
            new :  true
        })
        res.json(newBlog)
    } catch (error) {
        throw new Error(error)
    }
})

//get Blog
const getBlog=asyncHandler(async(req,res)=>{
    const {id}=req.params;
    validateMongoDbId(id)
    try {
        const getBlog = await Blog.findById(id)
        .populate("likes")
        .populate("dislikes")
        const updateViews= await Blog.findByIdAndUpdate(id,
            {
                $inc:{numViews:1}
            },
            {
                new: true
            })
            //res.json(updateViews)
            res.json(getBlog)
    } catch (error) {
        throw new Error(error)
    }
})


//get All Blog 
const getAllBlogs=asyncHandler(async(req,res)=>{
    try {
        const getBlogs= await Blog.find();
        res.json(getBlogs)
    } catch (error) {
        throw new Error(error)
    }
})


const deleteBlog = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    validateMongoDbId(id)
    try {
        const deletedBlog= await Blog.findByIdAndDelete(id)
        res.json(deletedBlog)
    } catch (error) {
        throw new Error(error)
    }
})


const liketheBlog = asyncHandler(async(req,res)=>{
    
    const {blogId}=req.body;
    
    validateMongoDbId(blogId)

    //find the blog which you to be liked
    const blog = await Blog.findById(blogId)
    
    //find the login user and userıd
    const loginUserId= req?.user?._id

    //find if the user has liked the blog
    const isLiked = blog?.isLiked;

    const alreadyDisliked = blog?.dislikes?.find(
        userId => userId?.toString() === loginUserId?.toString());
   
    if(alreadyDisliked){
        const blog= await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull:{dislikes:loginUserId},
                isDisliked:false
            },
            {
                new:true
            }
        )
        res.json(blog);
    }

    if(isLiked){
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull:{likes:loginUserId},
                isLiked:false
            },
            {
                new:true
            }
        );
        res.json(blog);
    }
    else{
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $push:{likes:loginUserId},
                isLiked:true
            },
            {
                new:true
            }
        );
        res.json(blog)
    }
})

const disliketheBlog=asyncHandler(async(req,res)=>{
    
    const { blogId }=req.body;
    
    validateMongoDbId(blogId)

    //find the blog which you to be liked
    const blog = await Blog.findById(blogId)
    
    //find the login user and userıd
    const loginUserId= req?.user?._id

    //find if the user has liked the blog
    const isDisLiked = blog?.isDisliked;

    const alreadyLiked = blog?.likes?.find(
        (userId) => userId?.toString() === loginUserId?.toString()
        );
   

    if(alreadyLiked){
        const blog= await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull:{likes:loginUserId},
                isLiked:false
            },
            {
                new:true
            }
        )
        res.json(blog);
    }

    if(isDisLiked){
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull:{dislikes:loginUserId},
                isDisliked:false
            },
            {
                new:true
            }
        );
        res.json(blog);
    }
    else{
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $push:{dislikes:loginUserId},
                isDisliked:true
            },
            {
                new:true
            }
        );
        res.json(blog)
    }
})


const uploadImages=asyncHandler(async(req,res)=>{
    const {id} =req.params
    console.log(id)
    validateMongoDbId(id)
    
    try {
        const uploader=(path)=>cloudinaryUploadImg(path,"images")

        const urls=[]
        const files=req.files
        for(const file of files){
            const {path} = file
            const newpath= await uploader(path)
            console.log(newpath)
            urls.push(newpath)
            fs.unlinkSync(path)
        }

        const findBlog = await Blog.findByIdAndUpdate(
            id,
            {
                images:urls.map((file)=>{
                    return file;
                })
            },
            {
                new : true
            }
        )
        res.json(findBlog)
    } catch (error) {
        throw new Error(error)
    }
})

module.exports={createBlog,
    updateBlog,
    getBlog,
    getAllBlogs,
    deleteBlog,
    liketheBlog,
    disliketheBlog,
    uploadImages
    }