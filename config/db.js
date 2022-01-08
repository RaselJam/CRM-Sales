const mongoose = require('mongoose')
require('dotenv').config()

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.DB_MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      
    })
    console.log("DB Connected")
  } catch (error) {
    console.log("Some error happend on connecting ...", error)
    process.exit(1)
  }
}
module.exports = connectDb;