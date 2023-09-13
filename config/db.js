const mongoose = require("mongoose");


const connectDb = async function() {
    const conn = await mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true});
    
    console.log(`WDJ Database connected on ${conn.connection.host} on port ${conn.connection.port}`.cyan.underline)
}


module.exports = connectDb