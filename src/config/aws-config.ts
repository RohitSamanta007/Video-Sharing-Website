import {S3Client} from "@aws-sdk/client-s3"

export const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: "AKIAXEMMI7VI2BSBD6HB",
    secretAccessKey: "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",
  },
});