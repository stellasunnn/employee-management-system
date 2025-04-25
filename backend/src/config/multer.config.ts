import multer from "multer";

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// Create multer instance with configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export default upload;
