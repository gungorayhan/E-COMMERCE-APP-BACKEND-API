const express=require("express")
const router = express.Router()

//middleware
const {authMiddleware,isAdmin} = require("../middlewares/authMiddleware")

//controller
const {createCategory, updateCategory, deleteCategory, getCategory, getAllCategory} = require("../controller/prodcategoryCtrl")



//routes
router.post("/",authMiddleware,isAdmin, createCategory)
router.put("/:id",authMiddleware,isAdmin, updateCategory)
router.delete("/:id",authMiddleware,isAdmin, deleteCategory)

router.get("/:id", getCategory)
router.get("/", getAllCategory)

module.exports=router
