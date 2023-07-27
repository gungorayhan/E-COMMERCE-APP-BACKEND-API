const Color = require("../models/colorModel")

const asyncHandler=require("express-async-handler")

const validateMongoDbId=require("../utils/validateMongodbId")

//create 
const createColor = asyncHandler(async(req,res)=>{
    try {
        const newColor= await Color.create(req.body)
        res.json(newColor)
    } catch (error) {
        throw new Error(error)
    }
})

//update
const updateColor=asyncHandler(async(req,res)=>{
    const {id} = req.params;
    validateMongoDbId(id)
    try {
        const updatedColor=await Color.findByIdAndUpdate(id,req.body,{
            new:true
        })
        res.json(updatedColor)
    } catch (error) {
        throw new Error(error)
    }

})

//delete
const deleteColor=asyncHandler(async(req,res)=>{
    const {id} =  req.params
    validateMongoDbId(id)
    try {
        const deletedColor=await Color.findByIdAndDelete(id)
        res.json(deletedColor)
    } catch (error) {
        throw new Error(error)
    }

})

//get 
const getColor= asyncHandler(async(req,res)=>{
    const {id} =req.params;
    validateMongoDbId(id)
    try {
        const getColor= await Color.findById(id)
        res.json(getColor)
    } catch (error) {
        throw new Error(error)
    }
    
})

//getAll
const getAllColor=asyncHandler(async(req,res)=>{
    try {
        const getAllColor= await Color.find();
        res.json(getAllColor)
    } catch (error) {
        throw new Error(error)
    }
})

module.exports={createColor,
    updateColor,
    deleteColor,
    getColor,
    getAllColor}
