const express = require("express");
const app = express()
const mongoSanitize = require("express-mongo-sanitize");
const path = require("path");
const connectDb = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const xss = require("xss")
const helmet = require("helmet");


let morgan;
require("dotenv").config({path: "./.env"});
const PORT = process.env.PORT || 3000
require("colors");
if(process.env.NODE_ENV == "development") {
    morgan = require("morgan");

    app.use(morgan())
}

app.use(express.json());
app.use(express.urlencoded({extended: true}));


//prevent from no sql injection
app.use(mongoSanitize({replaceWith: "_"}))

//allows cors
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accenp, Authorization");

    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, PUT");
    next()
})

app.use(
    helmet({
      contentSecurityPolicy: false,
      referrerPolicy: { policy: 'no-referrer' },
      frameguard: { action: 'deny' }, 
      hsts: { maxAge: 31536000, includeSubDomains: true }, 
      noSniff: true,
      xssFilter: true,
    })
  );
//static folder and files
app.use("/ArticleImages", express.static(path.join(__dirname, "ArticleImages")))
app.use("/", express.static(path.join(__dirname, "dist/WDJ/browser")))



//mount routers

app.use("/api/v1/articles", require("./routes/Article"));
app.use("/api/v1/auth", require("./routes/Auth"));


//connect to database
connectDb()

//serve static files
app.use("*", (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/WDJ/browser', 'index.html'))
})
//errorHandler middleware
app.use(errorHandler)



const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT || PORT}`.bgYellow)
})

//Handle unhandled rejection
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: unhandaledrejection ${err.message}`.bgRed.bold)
    //close connection and exit
    server.close(() => process.exit(1))
  })