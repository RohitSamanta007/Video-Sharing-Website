import { toast } from "react-toastify";
import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { FileRejection } from "react-dropzone";
import { FileType } from "@/components/post/upload-post-form";

export async function removeVideoFile(
  fileToRemove: FileType,
  setFile: React.Dispatch<React.SetStateAction<FileType | null>>
) {
  try {
    if (fileToRemove) {
      if (fileToRemove.objectUrl) {
        URL.revokeObjectURL(fileToRemove.objectUrl);
      }
    }

    setFile((prevFile) => prevFile && { ...prevFile, isDeleting: true });

    const response = await fetch("/api/s3/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: fileToRemove?.key }),
    });

    if (!response.ok) {
      toast.error("Failed to remove file from storage");
      setFile(
        (prevFile) =>
          prevFile && { ...prevFile, isDeleting: false, error: true }
      );
      return;
    }

    setFile(null);
    toast.success("File remove successfully");
  } catch (error) {
    toast.error("Failed to remove file from storage");
    setFile(
      (prevFile) => prevFile && { ...prevFile, isDeleting: false, error: true }
    );
  }
}

export async function uploadVideoFile(
  setFile: React.Dispatch<React.SetStateAction<FileType | null>>,
  file: File
) {
  setFile((prevFile) => prevFile && { ...prevFile, uploading: true });

  try {
    const uniqueKey = `videos/${file.name}-${uuidv4()}`;
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
      setFile(
        (prevFile) =>
          prevFile && {
            ...prevFile,
            uploading: false,
            progress: 0,
            error: true,
          }
      );
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
          setFile(
            (prevFile) =>
              prevFile && {
                ...prevFile,
                progress: Math.round(percentComplete),
                key: key,
              }
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
              prevFile && {
                ...prevFile,
                uploading: false,
                progress: 100,
                error: false,
              }
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
        prevFile && { ...prevFile, uploading: false, progress: 0, error: true }
    );
  }
}

export const onVideoFileDrop = (
  acceptedFiles: File[],
  setFile: React.Dispatch<React.SetStateAction<FileType | null>>
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
      isSubmmited: false,
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
