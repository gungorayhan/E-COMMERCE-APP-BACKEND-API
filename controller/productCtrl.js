const Product = require("../models/productModel")
const asyncHandler=require("express-async-handler")

//slugify
const slugify=require("slugify")

//userModel
const User=require("../models/userModel")

//validate
const validateMongoDbId= require("../utils/validateMongodbId")

// create product
const createProduct = asyncHandler(async(req,res)=>{
    try {
        if(req.body.title){
            req.body.slug=slugify(req.body.title)
        }
        const newProduct = await Product.create(req.body)
        res.json(newProduct)
    } catch (error) {
        throw new Error(error)
    }
});

//update product
const updateProduct = asyncHandler(async(req,res)=>{
    const {id} = req.params
    validateMongoDbId(id)
    if(req.body.title){
        req.body.slug=slugify(req.body.title)
    }
    try {
    const updateProduct= await Product.findByIdAndUpdate(
        id,
        req.body,
        {
            new:true
        })

        res.json(updateProduct)
    } catch (error) {
        throw new Error(error)
    }
})

//delete product
const deleteProduct =asyncHandler(async()=>{
    const id=req.params
    validateMongoDbId(id)
    try {
        const deleteProduct = await Product.findByIdAndDelete(id)
        res.json(deleteProduct)
    } catch (error) {
        throw new Error(error)
    }
})

//get a product

const getaProduct = asyncHandler(async(req,res)=>{
    const {id} =req.params
    validateMongoDbId(id)
    try {
        const findProduct =await Product.findById(id)
        res.json(findProduct)
    } catch (error) {
        throw new Error(error)
    }
})

const getAllProduct = asyncHandler(async(req,res)=>{
    try {
        //filtering 
        const queryObj={...req.query}
        const excludeFileds=["page","sort","limit","fields"] // clean in query
        excludeFileds.forEach((el)=> delete queryObj[el])
        console.log(queryObj)

        let queryStr = JSON.stringify(queryObj);
        queryStr=queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match)=>`$${match}`) // read and replace. for true query

        let query = Product.find(JSON.parse(queryStr)) // query okey, maybe we will change. we will add sorting,limiting,fields,pagination

        //sorting
        if(req.query.sort){
            const sortBy=req.query.sort.split(",").join(" ")
            query =query.sort(sortBy)
        }else{
            query=query.sort("-createdAt")
        }

        //limiting the fields
        if(req.query.fields){
            const fields=req.query.fields.split(",").join(" ")
            query=query.select(fields) 
        }
        else{
            query=query.select("-__v")
        }

        //pagination
        const page=req.query.page;
        const limit = req.query.limit;
        const skip=(page-1)*limit
        query = query.skip(skip).limit(limit)

        if(req.query.page){
            const productCount = await Product.countDocuments();
            if(skip >= productCount) throw new Error("This page does not exists")
        }
        console.log(page,limit,skip)

        const getallProducts = await query;
        res.json(getallProducts)
    } catch (error) {
        throw new Error(error)
    }
})

const addToWishList = asyncHandler(async(req,res)=>{
    const { _id}  = req.user;
    const { prodId } = req.body;
    try {
        const user= await User.findById(_id)
        const alreadyadded= user.wishlist.find((id)=>id.toString()===prodId)
        if(alreadyadded){
            let user = await User.findByIdAndUpdate(
                _id,
                {
                    $pull:{wishlist:prodId}
                },
                {
                    new : true
                }
            )
            res.json(user)
        }else{
            let user= await User.findByIdAndUpdate(
                _id,
                {
                    $push:{wishlist:prodId}
                },
                {
                    new:true
                }
            )
            res.json(user)
        }
    } catch (error) {
        throw new Error(error)
    }

})

const rating =asyncHandler(async(req,res)=>{
    
    const {_id} = req.user
    const {star,prodId,comment} = req.body
   
    try {
        const product = await Product.findById(prodId)

        let alreadyRated = product.ratings.find(
            userId=>userId.postedby.toString() === _id.toString()
        )
        
        if(alreadyRated){
            const updateRating = await Product.updateOne(
                {
                    ratings:{ $elemMatch: alreadyRated}
                },
                {
                    $set:{"ratings.$.star":star,
                        "ratings.$.comment":comment}
                },
                {
                    new : true
                }
            )
           // res.json(updateRating)
        }
        else{
            const rateProduct = await Product.findByIdAndUpdate(
                prodId,
                {
                    $push:{
                        ratings:{
                            star:star,
                            comment:comment,
                            postedby:_id,
                        }
                    }
                },
                {
                    new:true
                }
            )
           // res.json(rateProduct)
        }

        const getallratings = await Product.findById(prodId);
        let totalRating = getallratings.ratings.length;
        let ratingsum = getallratings.ratings
        .map((item)=>item.star)
        .reduce((prev,curr)=>prev+curr,0);
        let actualRating=Math.round(ratingsum/totalRating);
        let finalproduct = await Product.findByIdAndUpdate(
            prodId,
            {
                totalrating:actualRating,
            },
            {new:true}
        )
        res.json(finalproduct)
    } catch (error) {
        throw new Error(error)
    }
})



module.exports={
    createProduct,
    getaProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
    addToWishList,
    rating,}