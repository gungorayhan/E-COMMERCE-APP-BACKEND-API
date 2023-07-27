const {default:mongoose} =require("mongoose")
const dbConnect =()=>{
  try {
    const conn=mongoose.connect(process.env.DATABASE_URI)
    console.log("Database Connect Seccessfuly")
  } catch (error) {
     console.log("Database error")
  }
}

module.exports = dbConnect