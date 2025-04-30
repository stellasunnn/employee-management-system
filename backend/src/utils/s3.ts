import {
  S3Client,
  PutObjectCommand,
  S3ServiceException,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export const uploadToS3 = async (
  file: Express.Multer.File
): Promise<string> => {
  try {
    if (!process.env.AWS_S3_BUCKET_NAME) {
      throw new Error("AWS_S3_BUCKET_NAME environment variable is not defined");
    }

    if (!file.buffer || !file.originalname) {
      throw new Error("Invalid file data");
    }

    const fileExtension = file.originalname.split(".").pop();
    const key = `visa-documents/${Date.now()}-${file.originalname}.${fileExtension}`;
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    await s3Client.send(new PutObjectCommand(uploadParams));
    const fileUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
      }),
      { expiresIn: 3600 }
    );
    return fileUrl;
  } catch (error) {
    if (error instanceof S3ServiceException) {
      console.error("S3 Upload Error:", error.message);
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
    throw error;
  }
};
