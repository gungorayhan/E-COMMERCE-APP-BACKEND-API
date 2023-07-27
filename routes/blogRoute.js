const express=require("express")
const router=express.Router();

//controller
const {createBlog, 
       updateBlog,
       getBlog,
       deleteBlog,
       getAllBlogs,
       liketheBlog,
       disliketheBlog,
       uploadImages
       } =  require("../controller/blogCtrl")

//auth and isadmin  middleware
const {authMiddleware,isAdmin}=require("../middlewares/authMiddleware")

const {uploadPhoto,blogImgResize} = require("../middlewares/uploadImages")

router.post("/",authMiddleware,isAdmin,createBlog)
router.put("/:id",authMiddleware,isAdmin,updateBlog)
router.post("/likes",authMiddleware, isAdmin, liketheBlog)
router.post("/dislikes",authMiddleware, isAdmin, disliketheBlog)

router.put(
       "/upload/:id",
       authMiddleware,
       isAdmin,
       uploadPhoto.array("images",2),
       blogImgResize,
       uploadImages)

router.get("/:id",getBlog)
router.get("/",getAllBlogs)


router.delete("/:id",authMiddleware,isAdmin, deleteBlog)



module.exports=router