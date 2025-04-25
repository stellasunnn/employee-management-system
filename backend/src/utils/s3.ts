import {
  S3Client,
  PutObjectCommand,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export const uploadToS3 = async (
  file: Express.Multer.File
): Promise<string> => {
  console.log(process.env.AWS_REGION, process.env.AWS_BUCKET_NAME);
  try {
    if (!process.env.AWS_BUCKET_NAME) {
      throw new Error("AWS_BUCKET_NAME environment variable is not defined");
    }

    if (!file.buffer || !file.originalname) {
      throw new Error("Invalid file data");
    }

    const key = `visa-documents/${Date.now()}-${file.originalname}`;
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    });

    await s3Client.send(command);
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${
      process.env.AWS_REGION || "us-east-1"
    }.amazonaws.com/${key}`;
  } catch (error) {
    if (error instanceof S3ServiceException) {
      console.error("S3 Upload Error:", error.message);
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
    throw error;
  }
};
