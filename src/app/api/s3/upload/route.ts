

import { NextResponse } from "next/server";
import z from "zod";
import { v4 as uuidv4 } from "uuid";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/config/aws-config";

const uploadedRequestSchema = z.object({
  key: z.string(),
  contentType: z.string(),
  size: z.number(),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = uploadedRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid reques body" },
        { status: 400 }
      );
    }

    const { key, contentType, size } = validation.data;
    console.log("The value of the content type is : ", contentType)

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType || "application/octet-stream",
        ContentLength: size,
    });

    const presignedUrl = await getSignedUrl(s3, command, {
      expiresIn: 6 * 60, // url expires in 6 minutes
    });

    const response = {
      presignedUrl,
      key,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in generation presigned URL : ", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
