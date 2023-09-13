const { JSDOM } = require('jsdom')
const mongoose = require("mongoose");
const marked = require("marked");
const {mangle} = require("marked-mangle");
const createDomPurify = require("dompurify")
const {window} = new JSDOM();
const DOMPurify = createDomPurify(window);
const Comment = require("./Comment");


marked.use(mangle())


const {Schema} = mongoose;


const articleSchema = new Schema({
    title: {
        type: String,
        required: [true, 'title is required'],
        minLength: [5, 'title must be at least 5 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxLength: [75, 'Description must have less than 75 chars'],
        minLength: [5, 'Description must be atleast 5 characters']
    },
    body: {
        type: String,
        required: [true, 'Body is required'],
        minLength: [30, 'Body must be atleast 30 characters']
    },
    articleImage: {
        type: String
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Author is required"]
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tags: {
        type: Array,
        required: [true, "Tags are required"]
    },
    category: {
        type: String,
        required: [true, "Category is required"]
    },
    slug: {
        type: String,
        required: [true, 'Slug is required'],
        unique: [true, 'Slug must be unique']
    },
    likes: {
        type: Number,
        default: 0
    },
    viewed: {
        type: Number,
        default: 0
    },
    articleImage: {
        type: String,
        required: [true, "Article is required"]
    },
    articleImages: {
        type:Array
    },
    lastUpdated: {
        type: Date
    }
}, {toJSON: {virtuals: true}, toObject: {virtuals: true}})

articleSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "article",
    justOne: false
})

articleSchema.pre("save", async function(next) {
    //purify marked body

    this.body = DOMPurify.sanitize(marked.parse(this.body));
   
    next()
})



articleSchema.pre("findOneAndRemove", async function(next) {
    console.log(this.models);
    await Comment.deleteMany({article: this._id})
    next();
})

articleSchema.methods.parseBody = function(markdown) {
    return DOMPurify.sanitize(marked.parse(markdown));
}

module.exports = mongoose.model("Article", articleSchema);