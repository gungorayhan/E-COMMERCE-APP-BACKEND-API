const express=require("express")
const router = express.Router()

//middleware
const {authMiddleware,isAdmin} = require("../middlewares/authMiddleware")

//controller
const {createEnquiry, updateEnquiry, deleteEnquiry, getEnquiry, getAllEnquiry} = require("../controller/enqCtrl")



//routes
router.post("/",authMiddleware,isAdmin, createEnquiry)
router.put("/:id",authMiddleware,isAdmin, updateEnquiry)
router.delete("/:id",authMiddleware,isAdmin, deleteEnquiry)

router.get("/:id", getEnquiry)
router.get("/", getAllEnquiry)

module.exports=router