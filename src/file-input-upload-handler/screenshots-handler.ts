import { toast } from "react-toastify";
import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { FileRejection } from "react-dropzone";
import { FileType } from "@/components/post/upload-post-form";

export async function removeScreenshotFile(
  files: FileType[],
  setFiles: React.Dispatch<React.SetStateAction<FileType[]>>,
  fileId: string
) {
  try {
    const fileToRemove = files.find((f) => f.id === fileId);

    if (fileToRemove) {
      if (fileToRemove.objectUrl) {
        URL.revokeObjectURL(fileToRemove.objectUrl);
      }
    }

    setFiles((prevFile) =>
      prevFile.map((f) => (f.id === fileId ? { ...f, isDeleting: true } : f))
    );

    const response = await fetch("/api/s3/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: fileToRemove?.key }),
    });

    if (!response.ok) {
      toast.error("Failed to remove file from storage");
      setFiles((prevFile) =>
        prevFile.map((f) =>
          f.id === fileId ? { ...f, isDeleting: false, error: true } : f
        )
      );
      return;
    }

    setFiles((prevFile) => prevFile.filter((f) => f.id !== fileId));
    toast.success("File remove successfully");
  } catch (error) {
    toast.error("Failed to remove file from storage");
    setFiles((prevFile) =>
      prevFile.map((f) =>
        f.id === fileId ? { ...f, isDeleting: false, error: true } : f
      )
    );
  }
}

export async function uploadScreenshotsFile(
  setFiles: React.Dispatch<React.SetStateAction<FileType[]>>,
  file: File,
) {
  setFiles((prevFiles) =>
    prevFiles.map((f) => (f.file === file ? { ...f, uploading: true } : f))
  );

  try {
    const uniqueKey = `screenshots/${file.name}-${uuidv4()}`;
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
      setFiles((prevFile) =>
        prevFile.map((f) =>
          f.file === file
            ? { ...f, uploading: false, progress: 0, error: true }
            : f
        )
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
          setFiles((prevFile) =>
            prevFile.map((f) =>
              f.file === file
                ? { ...f, progress: Math.round(percentComplete), key: key }
                : f
            )
          );
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 204) {
          // file fully uploaded - set progress to 100
          setFiles((prevFile) =>
            prevFile.map((f) =>
              f.file === file
                ? { ...f, progress: 100, uploading: false, error: false }
                : f
            )
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

    setFiles((prevFile) =>
      prevFile.map((f) =>
        f.file === file
          ? { ...f, uploading: false, progress: 0, error: true }
          : f
      )
    );
  }
}

export const onScreenshotsFileDrop = (
  acceptedFiles: File[],
  setFiles: React.Dispatch<React.SetStateAction<FileType[]>>
) => {
  if (acceptedFiles.length) {
    setFiles((prevFiles) => [
      ...prevFiles,
      ...acceptedFiles.map((file) => ({
        id: uuidv4(),
        file,
        uploading: false,
        progress: 0,
        isDeleting: false,
        error: false,
        objectUrl: URL.createObjectURL(file),
        isSubmmited: false,
      })),
    ]);
  }

  // acceptedFiles.forEach((file) =>
  //   uploadScreenshotsFile(setFiles, file, "vidme-screenshots-images")
  // );
};

export const rejectedScreenshotsFiles =(fileRejection: FileRejection[]) => {
  if (fileRejection.length) {
    const tooManyFiles = fileRejection.find(
      (rejection) => rejection.errors[0].code === "too-many-files"
    );

    const fileSizeTooBig = fileRejection.find(
      (rejection) => rejection.errors[0].code === "file-too-large"
    );

    if (tooManyFiles) {
      toast.error("Too many files selected, max is 5");
    }

    if (fileSizeTooBig) {
      toast.error("File size exceeds 10mb limit");
    }
  }
};
