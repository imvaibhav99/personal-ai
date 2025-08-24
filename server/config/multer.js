import multer from "multer";

const storage = multer.memoryStorage(); // store files in memory, not disk
export const upload = multer({ storage });
