import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check required environment variables
const requiredEnvVars = [
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_S3_BUCKET_NAME'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  throw new Error('Missing required environment variables');
}

// Configure AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

// Debug logs
console.log('AWS Configuration:', {
  region: process.env.AWS_REGION,
  bucketName: BUCKET_NAME,
  hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
  hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
  envFile: process.env.NODE_ENV
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// Upload file
export const uploadFile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log('Uploading file:', {
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    // Upload to S3
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };

    console.log('S3 Upload Parameters:', uploadParams);

    await s3Client.send(new PutObjectCommand(uploadParams));

    // Generate a pre-signed URL for download (valid for 1 hour)
    const fileUrl = await getSignedUrl(s3Client, new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName
    }), { expiresIn: 3600 });

    console.log('File uploaded successfully:', {
      fileName,
      fileUrl
    });

    res.json({
      fileName: req.file.originalname,
      fileUrl,
      uploadDate: new Date()
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// Download file
export const downloadFile = async (req: AuthRequest, res: Response) => {
  try {
    const { filename } = req.params;
    
    // Generate a pre-signed URL for download (valid for 1 hour)
    const fileUrl = await getSignedUrl(s3Client, new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename
    }), { expiresIn: 3600 });

    res.json({ url: fileUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}; 