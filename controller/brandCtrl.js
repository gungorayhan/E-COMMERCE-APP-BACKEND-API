const Brand = require("../models/brandModel")

const asyncHandler=require("express-async-handler")

const validateMongoDbId=require("../utils/validateMongodbId")

//create 
const createBrand = asyncHandler(async(req,res)=>{
    try {
        const newBrand= await Brand.create(req.body)
        res.json(newBrand)
    } catch (error) {
        throw new Error(error)
    }
})

//update
const updateBrand=asyncHandler(async(req,res)=>{
    const {id} = req.params;
    validateMongoDbId(id)
    try {
        const updatedBrand=await Brand.findByIdAndUpdate(id,req.body,{
            new:true
        })
        res.json(updatedBrand)
    } catch (error) {
        throw new Error(error)
    }

})

//delete
const deleteBrand=asyncHandler(async(req,res)=>{
    const {id} =  req.params
    validateMongoDbId(id)
    try {
        const deletedBrand=await Brand.findByIdAndDelete(id)
        res.json(deletedBrand)
    } catch (error) {
        throw new Error(error)
    }

})

//get 
const getBrand= asyncHandler(async(req,res)=>{
    const {id} =req.params;
    validateMongoDbId(id)
    try {
        const getBrand= await Brand.findById(id)
        res.json(getBrand)
    } catch (error) {
        throw new Error(error)
    }
    
})

//getAll
const getAllBrand=asyncHandler(async(req,res)=>{
    try {
        const getAllBrand= await Brand.find();
        res.json(getAllBrand)
    } catch (error) {
        throw new Error(error)
    }
})

module.exports={createBrand,
    updateBrand,
    deleteBrand,
    getBrand,
    getAllBrand}
