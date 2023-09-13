const express = require("express");
const app = express()
const mongoSanitize = require("express-mongo-sanitize");
const path = require("path");
const connectDb = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const xss = require("xss")
let morgan;
require("dotenv").config({path: "./.env"});
if(process.env.NODE_ENV == "development") {
    require("colors");
    morgan = require("morgan");

    app.use(morgan())
}

app.use(express.json());
app.use(express.urlencoded({extended: true}));


//prevent from no sql injection
app.use(mongoSanitize({replaceWith: "_"}))
// //prevent xss attacks
// app.use(xss())
//allows cors
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accenp, Authorization");

    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, PUT");
    next()
})

//static folder and files
app.use("/ArticleImages", express.static(path.join(__dirname, "ArticleImages")))



app.use("/", express.static(path.join(__dirname, '/dist/WDJ/browser')));
//mount routers

app.use("/api/v1/articles", require("./routes/Article"));
app.use("/api/v1/auth", require("./routes/Auth"));


// app.set('view')


connectDb();

//errorHandler middleware
app.use(errorHandler)

app.use("*", (req, res) => {
    res.sendFile(path.join(__dirname, "/dist/WDJ/browser", "index.html"))
})

app.listen(process.env.PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`.bgYellow)
})