//server config info
const bodyParser= require("body-parser")
const express=require("express")

//middlewares
const {notFound, errorHandler}=require("./middlewares/errorHandler")
//dbConnect
const dbConnect =require("./config/dbConnect")

//cookie parser
const cookieParser=require("cookie-parser")

//morgan
const morgan = require("morgan")

//routes
const authRouter=require("./routes/authRoute")
const productRouter = require("./routes/productRoute")
const blogRouter = require("./routes/blogRoute")
const categoryRouter=require("./routes/prodcategoryRoute")
const blogcategoryRouter=require("./routes/blogCatRoute")
const brandRouter=require("./routes/brandRoute")
const couponRouter=require("./routes/couponRoute")
const colorRouter=require("./routes/colorRoute")
const enqRouter=require("./routes/enqRoute")
const uploadRoute=require("./routes/uploadRoute")

//corsOprions
const corsOptions = require("./utils/corsOptions")


//express
const app=express()

//dotenv
const dotenv=require("dotenv").config()

//port info
const PORT = process.env.PORT || 4000

//cors
const cors = require("cors")
dbConnect()

app.use(morgan("dev"))

//app.use(cors())
app.use(cors(corsOptions))
//app.use(cors({ origin: "http://localhost:5173", credentials: true }));

//convert json
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(cookieParser())

//routes
app.use("/api/user",authRouter)
app.use("/api/product",productRouter)
app.use("/api/blog",blogRouter)
app.use("/api/category",categoryRouter)
app.use("/api/blogcategory", blogcategoryRouter)
app.use("/api/brand", brandRouter)
app.use("/api/coupon", couponRouter)
app.use("/api/color", colorRouter)
app.use("/api/enquiry", enqRouter)
app.use("/api/upload", uploadRoute)

//errorHandler
app.use(notFound)
app.use(errorHandler)

app.listen(PORT,()=>{
    console.log(`server is runing at PORT ${PORT}`)
})