
const asyncHandler=require("express-async-handler")

//cloudinary
const {cloudinaryUploadImg,
    cloudinaryDeleteImg
    } = require("../utils/cloudinary")

//fs
const fs=require("fs")




const uploadImages=asyncHandler(async(req,res)=>{
    // const {id} =req.params
    // console.log(id)
    // validateMongoDbId(id)

    //note:another images with try controller in postman because throw  error
    try {
        const uploader=(path)=>cloudinaryUploadImg(path,"images")

        const urls=[]
        const files=req.files

      //console.log(req.files)

        for(const file of files){
            const {path} = file
            const newpath= await uploader(path)
            //console.log(newpath)
            urls.push(newpath)
            fs.unlinkSync(path)
        }

        const images = urls.map((file)=>{
            return file;
        })

        // const findProduct = await Product.findByIdAndUpdate(
        //     id,
        //     {
        //         images:urls.map((file)=>{
        //             return file;
        //         })
        //     },
        //     {
        //         new : true
        //     }
        // )
        //res.json(findProduct)
        res.json(images)
    } catch (error) {
        throw new Error(error)
    }
})


//delete images
const deleteImages =asyncHandler(async(req,res)=>{
    const {id}=req.params
    try {
        const deleted = await  cloudinaryDeleteImg(id,"images");
        res.json({
            message:"Deleted"
        })
    } catch (error) {
        throw new Error(error)
    }
})


module.exports={
    uploadImages,
    deleteImages
}