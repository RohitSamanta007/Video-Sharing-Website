import { toast } from "react-toastify";
import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { FileRejection } from "react-dropzone";
import { FileType, PostValues } from "@/components/post/upload-post-form";
import { UseFormReturn } from "react-hook-form";

export async function removeVideoFile(
  fileToRemove: FileType,
  setFile: React.Dispatch<React.SetStateAction<FileType>>,
  form: UseFormReturn<PostValues>
) {
  try {
    console.log("the value of videofile in remove file : ", fileToRemove);
    setFile((prevFile) => ({ ...prevFile, isDeleting: true }));

    if (fileToRemove.key) {
      const response = await fetch("/api/s3/delete-folder", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: fileToRemove.key }),
      });

      if (!response.ok) {
        toast.error("Failed to remove file from storage");
        setFile((prevFile) => ({
          ...prevFile,
          isDeleting: false,
          error: true,
        }));
        return;
      }
    }

    if (fileToRemove.objectUrl) {
      URL.revokeObjectURL(fileToRemove.objectUrl);
    }

    setFile({
      id: "",
      file: undefined,
      uploading: false,
      progress: 0,
      isDeleting: false,
      error: false,
      isFromPost: false,
      isDeleted: true,
      key: undefined,
    });

    form.resetField("videoFile");
    toast.success("File remove successfully");
  } catch (error) {
    toast.error("Failed to remove file from storage");
     setFile((prevFile) => ({ ...prevFile, isDeleting: false, error: true }));
  }
}

export async function uploadVideoFile(
  setFile: React.Dispatch<React.SetStateAction<FileType>>,
  file: File,
  postId: string
) {
  setFile((prevFile) => ({ ...prevFile, uploading: true }));

  try {
    console.log("Uploading new video file ...")
    const uniqueKey = `TempVideos/${postId}/${file.name}-${uuidv4()}`;
    console.log("Uploading new video file key is : ", uniqueKey)
    // get presigned url
    const presignedResponse = await fetch("/api/s3/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: uniqueKey,
        contentType: file.type,
        size: file.size,
      }),
    });

    if (!presignedResponse.ok) {
      toast.error("Failed to get presigned URL");
      setFile((prevFile) => ({
        ...prevFile,
        uploading: false,
        progress: 0,
        error: true,
      }));
      return;
    }

    const { presignedUrl, key } = await presignedResponse.json();

    // console.log("The value of presigned url is : ", presignedUrl);
    // console.log("The value of aws key is : ", key);

    // 2. upload file to s3
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          // setFiles((prevFile) =>
          //   prevFile.map((f) =>
          //     f.file === file
          //       ? { ...f, progress: Math.round(percentComplete), key: key }
          //       : f
          //   )
          // );
          setFile((prevFile) => ({
            ...prevFile,
            key: uniqueKey,
            progress: Math.round(percentComplete),
          })
          );
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 204) {
          // file fully uploaded - set progress to 100
          // setFiles((prevFile) =>
          //   prevFile.map((f) =>
          //     f.file === file
          //       ? { ...f, progress: 100, uploading: false, error: false }
          //       : f
          //   )
          // );

          setFile(
            (prevFile) =>
               ({
                ...prevFile,
                uploading: false,
                progress: 100,
                error: false,
                key: uniqueKey,
              })
          );

          toast.success("File uploaded successfully");
          resolve();
        } else {
          reject(new Error(`Upload failed with status : ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Upload Failed"));
      };

      xhr.open("PUT", presignedUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    });

    return key;
  } catch (error) {
    console.log("Error in upload file : ", error);
    toast.error("Something went wrong");

    // setFiles((prevFile) =>
    //   prevFile.map((f) =>
    //     f.file === file
    //       ? { ...f, uploading: false, progress: 0, error: true }
    //       : f
    //   )
    // );

    setFile(
      (prevFile) =>
         ({ ...prevFile, uploading: false, progress: 0, error: true })
    );
    throw error;
  }
}

export const onVideoFileDrop = (
  acceptedFiles: File[],
  setFile: React.Dispatch<React.SetStateAction<FileType>>
) => {
  if (acceptedFiles.length) {
    setFile({
      id: uuidv4(),
      file: acceptedFiles[0],
      uploading: false,
      progress: 0,
      isDeleting: false,
      error: false,
      objectUrl: URL.createObjectURL(acceptedFiles[0]),
      isFromPost: false,
      isDeleted: false,
    });
  }
  // uploadVideoFile(setFile, acceptedFiles[0]);
};

export const rejectedVideoFiles = (fileRejection: FileRejection[]) => {
  if (fileRejection.length) {
    const tooManyFiles = fileRejection.find(
      (rejection) => rejection.errors[0].code === "too-many-files"
    );

    const fileSizeTooBig = fileRejection.find(
      (rejection) => rejection.errors[0].code === "file-too-large"
    );

    if (tooManyFiles) {
      toast.error("Too many files selected, max is 1");
    }

    if (fileSizeTooBig) {
      toast.error("File size exceeds 10mb limit");
    }
  }
};
