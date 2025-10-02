import { RunTaskCommand } from "@aws-sdk/client-ecs";
import { ecsClient } from "@/config/aws-config";
import z, { success } from "zod";
import { NextResponse } from "next/server";

const transcodeSchema = z.object({
  key: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = transcodeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body" , success: false},
        { status: 400 }
      );
    }

    const { key } = validation.data;

    const runTaskCommand = new RunTaskCommand({
      taskDefinition:
        "arn:aws:ecs:ap-south-1:490457333073:task-definition/video-transcoder",
      cluster: "arn:aws:ecs:ap-south-1:490457333073:cluster/rohit-dev",
      launchType: "FARGATE",
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: [
            "subnet-01f9cd277829bbc48",
            "subnet-096d9bef3f2a94935",
            "subnet-075e2623536004245",
          ],
          securityGroups: ["sg-093ee527eb7db45ee"],
          assignPublicIp: "ENABLED",
        },
      },
      overrides: {
        containerOverrides: [
          {
            name: "video-transcoder",
            environment: [
              {
                name: "BUCKET_NAME",
                value: process.env.AWS_S3_BUCKET_NAME,
              },
              { name: "KEY", value: key },
              { name: "DATABASE_URL", value: process.env.DATABASE_URL! },
              {
                name: "AWS_SECRET_ACCESS_KEY",
                value: process.env.AWS_SECRET_ACCESS_KEY!,
              },
              {
                name: "AWS_ACCESS_KEY_ID",
                value: process.env.AWS_ACCESS_KEY_ID!,
              },
            ],
          },
        ],
      },
    });

    await ecsClient.send(runTaskCommand);

    return NextResponse.json({
        success: true,
        message: "Strat transcoding..."
    }, {status: 200})
  } catch (error) {
     console.error("Error in Ecs start transcoding : ", error);
     return NextResponse.json(
       { error: "Failed to start ecs task for video transcoding", success: false },
       { status: 500 }
     );
  }
}
