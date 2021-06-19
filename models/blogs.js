const mongoose = require("mongoose")

const blogsSchema= new mongoose.Schema({
    userId:{
        type: String,
        required: true,
    },
    content:{
        type: String,
        required: true,
    }
})

module.exports = mongoose.model("Blogs",blogsSchema)