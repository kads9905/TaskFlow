import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    // where to save the file
    destination: function(reqq, file, cb){
        cb(null, "./public/temp");
    },
    // what to name it 
    filename: function(req, file, cb){
        const uniqueName =
            Date.now() + path.extname(file.originalname);

        cb(null, uniqueName);
    },
})

export const upload = multer({ storage });