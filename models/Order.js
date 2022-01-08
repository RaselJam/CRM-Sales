const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
  orderProducts: {
    type: Array,
    required: true,

  },
  total: {
    type: Number,
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Client'
  },
  salesMan: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  state: {
    type: String,
    default: "PENDING"
  },
  createdAt: {
    type: Date,
    default : Date.now()
}

})


module.exports = mongoose.model('Order', orderSchema);