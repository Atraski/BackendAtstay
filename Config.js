const mongoose = require('mongoose')
const db = "mongodb+srv://atstay:scsc9654%4021@cluster0.wp3ie99.mongodb.net/atstay?retryWrites=true&w=majority"
module.exports=mongoose.connect(db,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then((then)=>{
    console.log("Connected to database")
}).catch((e)=>{
    console.log(e)
})
