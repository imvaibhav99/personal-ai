import multer from "multer";

const storage= multer.diskStorage({});

export const upload= multer({storage})


// import multer from "multer";
// import { CloudinaryStorage } from "@fluidjs/multer-cloudinary";
// import cloudinary from "./cloudinary.js";

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: "uploads", // Cloudinary folder name
//     allowed_formats: ["jpg", "jpeg", "png", "pdf", "doc", "docx"],
//     resource_type: "auto",
//   },
// });

// export const upload = multer({ storage });
