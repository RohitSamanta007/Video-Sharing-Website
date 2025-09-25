import {DeleteObjectCommand, ListObjectsV2Command, S3Client} from "@aws-sdk/client-s3"

export const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: "AKIAXEMMI7VI2BSBD6HB",
    secretAccessKey: "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",
  },
});


// aws folder delte code
const videoBucketName = "vidme-video-sharing-website-private";

export async function deleteAwsFolder(folderName: string){
  const command = new ListObjectsV2Command({
    Bucket: "vidme-video-sharing-website-private",
    Prefix: folderName,
  });

  const {Contents} = await s3.send(command)

  Contents?.map(async(item) => {
    const command = new DeleteObjectCommand({
      Bucket: "vidme-video-sharing-website-private",
      Key: item.Key,
    });

    await s3.send(command)
  })
  console.log("Video files with folder deleted successfully")
}

export async function deleteAwsFiles(key:string){
  const command = new DeleteObjectCommand({
    Bucket: "vidme-video-sharing-website-private",
    Key: key,
  });
  await s3.send(command)
  console.log("Thumbnail and screenshots images are deleted successfully");
}