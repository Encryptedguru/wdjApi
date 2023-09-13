const multer = require("multer");
const slugify = require("slugify");
const slugOptions = {
    strict: true,
    trim: true,
    lower: true}


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./ArticleImages")
    },

    filename: function (req, file, cb) {
        const mimeType = file.mimetype.split("/")[1];
        const protocol = req.protocol;
        const host = req.get("host");
        let fileName;

        
    
        if(file.fieldname == "articleImage") {
            fileName = `${slug(req)}-${file.fieldname}-${randoms(4)}.${mimeType}`
        } else if (file.fieldname == "articleImages") {
           fileName = `${slug(req)}-${file.fieldname}-${req.count}.${mimeType}`
           req.count += 1;
        } else if( file.fieldname == "avatar") {
            fileName = `avatar-${Date.now()}-${randoms(3)}.${mimeType}`
        }
        
        
        const fileUrl = `${protocol}://${host}/ArticleImages/${fileName}`;

        if(file.fieldname == "articleImages") {
            
            //update article images if updating
            if(req.article && req.article.articleImages) req.article.articleImages.push(fileUrl)

            if(req.body.articleImages && typeof req.body.articleImages == "object" && req.body.articleImages.length > 0) {
                req.body.articleImages.push(fileUrl);
                console.log("pushing", req.body.articleImages);
            } else {
                req.body.articleImages = req.article && req.article.articleImages ? [...req.article.articleImages] : [fileUrl];
                console.log(req.body.articleImages, "start")
            }
        }

        
        if(file.fieldname == "articleImage") req.body.articleImage = fileUrl;
        else if (file.fieldname == "avatar") req.body.avatar = fileUrl;
        cb(null, fileName);
    },
    fileFilter: function(req, file, cb) {
        const acceptedMimeTypes = ["image/jpg", "image/png", "image/webp", "image/jpeg", "image/gif"];

        if(acceptedMimeTypes.includes(file.mimeType)) cb(null, true);
        else cb(null, false)
    }
})


module.exports = storage;


function randoms(n) {
    const alpha = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    let str = "";
   for(let i = 0; i <= n; i++) {
     str += alpha[Math.floor(Math.random() * (alpha.length - 1))]
   }
   return str;
}

function slug(req) {
    let sl;
    if(req.body.title && req.body.title.trim().length > 0) {
        sl = slugify(req.body.title, slugOptions);
    } else if( req.article && req.article.title) {
        sl = slugify(req.article.title, slugOptions)
    }
    return sl;
}