const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  stock: {
    type: Number,
    required: true,
    trim : true
  },
  price :{
    type : Number,
    required : true,
    trim : true
  },
   createdAt: {
    type: Date,
    default: Date.now()
  },

})

productSchema.index({name:"text"})
module.exports = mongoose.model('Product', productSchema);