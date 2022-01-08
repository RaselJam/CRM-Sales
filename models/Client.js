const mongoose = require('mongoose')

const clientSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  tel: {
    type: String,
    trim: true,
  },

  createdAt: {
    type: Date,
    default: Date.now()
  },
  salesMan: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
})



module.exports = mongoose.model('Client', clientSchema);