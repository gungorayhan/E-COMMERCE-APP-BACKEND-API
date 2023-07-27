const express = require("express")

//controller
const {createProduct,
     getaProduct,
     getAllProduct,
     updateProduct,
     deleteProduct,
     addToWishList,
     rating}=require("../controller/productCtrl")

//middleware
const {isAdmin,authMiddleware} =require("../middlewares/authMiddleware")

//router
const router = express.Router();

router.post("/",authMiddleware, isAdmin, createProduct)

router.get("/:id",getaProduct)
router.patch("/wishlist", authMiddleware, addToWishList)
router.patch("/rating",authMiddleware, rating)

router.put("/:id",authMiddleware, isAdmin, updateProduct)
router.delete("/:id",authMiddleware, isAdmin, deleteProduct)
router.get("/",getAllProduct)

module.exports=router