const express = require("express")

//controller
const {
     uploadImages,
     deleteImages}=require("../controller/uploadCtrl")

//middleware
const {isAdmin,authMiddleware} =require("../middlewares/authMiddleware")

const {uploadPhoto,productImgResize} = require("../middlewares/uploadImages")

//router
const router = express.Router();


router.post(
     "/",
     authMiddleware,
     isAdmin,
     uploadPhoto.array("images",10),
     productImgResize,
     uploadImages)

router.delete("/delete-img/:id",authMiddleware,isAdmin,deleteImages)

module.exports=router