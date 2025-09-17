import { s3 } from "@/config/aws-config";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {

    const body = await request.json();
    const key = body.key;

    if(!key || typeof key !== "string"){
        return NextResponse.json(
            {error: "Missing or invalid object key"},
            {status: 400},
        )
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    });

    await s3.send(command);

    return NextResponse.json(
        {error: "File deleted successfully"},
        {status: 200},
    )

  } 
  catch (error) {
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
