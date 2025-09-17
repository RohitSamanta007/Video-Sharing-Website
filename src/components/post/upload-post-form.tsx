"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { v4 as uuidv4 } from "uuid";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "../ui/select";
import {
  Cross,
  CrossIcon,
  FileSignature,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { Progress } from "../ui/progress";
import { toast } from "react-toastify";
import Dropzone, { FileRejection } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

import {
  removeScreenshotFile,
  uploadScreenshotsFile,
  onScreenshotsFileDrop,
  rejectedScreenshotsFiles,
} from "@/file-input-upload-handler/screenshots-handler";
import {
  removeThumbnailFile,
  uploadThumbnailFile,
  onThumbnailFileDrop,
  rejectedThumbnailFiles,
} from "@/file-input-upload-handler/thumbnail-handler";
import {
  removeVideoFile,
  uploadVideoFile,
  onVideoFileDrop,
  rejectedVideoFiles,
} from "@/file-input-upload-handler/video-handler";

export const postSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(100, "Title must be under 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(500, "Description must be under 500 characters"),
  categoryIds: z
    .array(z.string().nonempty("Please select a category"))
    .min(1, "Please select at least one category"),
  thumbnailImage: z
    .instanceof(File, { message: "File is required" })
    .refine(
      (file) => file.type.startsWith("image/"),
      "Only image files are allowed"
    )
    .refine((file: File) => file.size <= 10 * 1024 * 1024, {
      message: "Each file must be less than (10Mb)",
    }),
  screenshotImages: z
    .array(
      z
        .instanceof(File)
        .refine((file: File) => file.type.startsWith("image/"), {
          message: "Only image files are allowed",
        })
        .refine((file: File) => file.size <= 10 * 1024 * 1024, {
          message: "Each file must be less than (10Mb)",
        })
    )
    .optional(),
  videoFile: z
    .instanceof(File, { message: "File is required" })
    .refine(
      (file) => file.type.startsWith("video/"),
      "Only image files are allowed"
    )
    .refine(
      (file) => file.size <= 100 * 1024 * 1024, // 5MB limit
      "File size must be less than 5MB"
    ),
  isPublic: z.boolean().optional(),
});

type PostValues = z.infer<typeof postSchema>;

export interface FileType {
  id?: string;
  file: File | null;
  uploading: boolean;
  progress: number;
  key?: string;
  isDeleting: boolean;
  error: boolean;
  objectUrl?: string;
  isSubmmited: boolean;
}

function UploadPostFrom({ categories }: { categories: CategoryProps[] }) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [thumbnailFile, setThumbnailFile] = useState<FileType | null>(null);
  const [videoFile, setVideoFile] = useState<FileType | null>(null);
  const [screenShotsFile, setScreenshotsFile] = useState<FileType[]>([]);

  const form = useForm<PostValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryIds: [],
      thumbnailImage: undefined,
      videoFile: undefined,
      isPublic: true,
      screenshotImages: [],
    },
  });

  const onSubmitHandler = async (values: PostValues) => {
    console.log("The value of the submitted form is : ", values);

    try {
      
      uploadThumbnailFile(setThumbnailFile, thumbnailFile?.file||values.thumbnailImage)
      // screenShotsFile?.map((file) => uploadScreenshotsFile(setScreenshotsFile, file!))
      uploadVideoFile(setVideoFile, values.videoFile)

    } catch (error) {
      console.log("Error in Form Submit : ", error);
      toast.error("Something went wrong")
    }
  };

  const loading = form.formState.isSubmitting;
  const disabledButton =
    thumbnailFile?.uploading ||
    videoFile?.uploading ||
    screenShotsFile.some((file) => file.uploading);

  // useEffect(()=> {
  //   return () =>{
  //     // if(thumbnailFile?.objectUrl){
  //     //   URL.revokeObjectURL(thumbnailFile.objectUrl)
  //     // }

  //     const cleanupImages = async() =>{
  //       if (!thumbnailFile?.isSubmmited && thumbnailFile?.objectUrl) {
  //         console.log("Non Submitted file deleted in useEffect.");
  //         URL.revokeObjectURL(thumbnailFile.objectUrl);
  //         await fetch("/api/s3/delete", {
  //           method: "DELETE",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({ key: thumbnailFile?.key }),
  //         });
  //       }
  //     }
  //     cleanupImages();
  //   }
  // }, [thumbnailFile])

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmitHandler)}
          className="space-y-5"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter post title"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter Post description"
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">
                  Category : (You can select multiple)
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    const notExistingValue = field.value.find(
                      (val) => val === value
                    );
                    if (!notExistingValue) {
                      field.onChange([...field.value, value]);
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.value.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value.map((id) => {
                      const cat = categories.find((c) => c.id === Number(id));
                      return (
                        <div
                          key={id}
                          className="px-2 py-1 text-xs bg-muted rounded-md cursor-pointer"
                          onClick={() =>
                            field.onChange(field.value.filter((v) => v !== id))
                          }
                        >
                          <span className="flex gap-3 items-center">
                            {cat?.name}
                            <X className="text-red-500 size-3" />
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* File Upload with Drag & Drop */}
          {/* Upload Thumbnail Image  */}
          <FormField
            control={form.control}
            name="thumbnailImage"
            render={() => (
              <FormItem>
                <FormLabel>
                  Thumbnail Image File :{" "}
                  <span className="text-xs text-muted-foreground">
                    (Image must be under 10 Mb)
                  </span>{" "}
                </FormLabel>
                <FormControl>
                  <Dropzone
                    onDrop={(acceptedFiles) => {
                      onThumbnailFileDrop(acceptedFiles, setThumbnailFile);
                      form.setValue("thumbnailImage", acceptedFiles[0]);
                    }}
                    onDropRejected={rejectedThumbnailFiles}
                    maxFiles={1}
                    maxSize={10 * 1024 * 1024}
                    accept={{ "image/*": [] }}
                    disabled={Boolean(thumbnailFile)}
                  >
                    {({ getRootProps, getInputProps, isDragActive }) => (
                      <div
                        {...getRootProps()}
                        className={cn(
                          "w-full border text-center cursor-pointer transition rounded-md",
                          isDragActive
                            ? "border-primary bg-primary/10"
                            : "border-muted-foreground"
                        )}
                      >
                        <div className="w-full h-16 flex items-center justify-center">
                          <Input
                            type="file"
                            {...getInputProps()}
                            disabled={Boolean(thumbnailFile)}
                          />
                          {isDragActive ? (
                            <p className="text-center">Drop the files here</p>
                          ) : (
                            <p className="text-center text-muted-foreground">
                              Drag 'n' drop some files here, or click to select
                              files
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </Dropzone>
                </FormControl>

                {thumbnailFile && (
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-3">
                    <div className="flex flex-col gap-1">
                      <div className="relative aspect-square rounded-md overflow-hidden">
                        <img
                          src={thumbnailFile.objectUrl}
                          alt={thumbnailFile.file?.name}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          variant={"destructive"}
                          size={"icon"}
                          className=" absolute top-2 right-2"
                          onClick={() =>{
                            removeThumbnailFile(
                              thumbnailFile!,
                              setThumbnailFile
                            )
                          }
                          }
                          disabled={thumbnailFile.isDeleting}
                        >
                          {thumbnailFile.isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                        {thumbnailFile.uploading &&
                          !thumbnailFile.isDeleting && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <div className="text-white font-medium">
                                {thumbnailFile.progress}%
                              </div>
                            </div>
                          )}

                        {thumbnailFile.error && (
                          <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
                            <div className="text-white font-medium">Error</div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate px-1">
                        {thumbnailFile.file?.name}
                      </p>
                    </div>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Upload screenshots  */}
          <FormField
            control={form.control}
            name="screenshotImages"
            render={() => (
              <FormItem>
                <FormLabel>
                  Screenshots Image Files (optional) :{" "}
                  <span className="text-xs text-muted-foreground">
                    (Image must be under 10 Mb)
                  </span>{" "}
                </FormLabel>
                <FormControl>
                  <Dropzone
                    onDrop={(acceptedFiles) =>{
                      onScreenshotsFileDrop(acceptedFiles, setScreenshotsFile)
                      form.setValue("screenshotImages", acceptedFiles)
                    }
                    }
                    onDropRejected={rejectedScreenshotsFiles}
                    maxFiles={5}
                    maxSize={10 * 1024 * 1024}
                    accept={{ "image/*": [] }}
                  >
                    {({ getRootProps, getInputProps, isDragActive }) => (
                      <div
                        {...getRootProps()}
                        className={cn(
                          "w-full border text-center cursor-pointer transition rounded-md",
                          isDragActive
                            ? "border-primary bg-primary/10"
                            : "border-muted-foreground"
                        )}
                      >
                        <div className="w-full h-16 flex items-center justify-center">
                          <Input {...getInputProps()} type="file" />
                          {isDragActive ? (
                            <p className="text-center">Drop the files here</p>
                          ) : (
                            <p className="text-center text-muted-foreground">
                              Drag 'n' drop some files here, or click to select
                              files
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </Dropzone>
                </FormControl>

                {screenShotsFile.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-3">
                    {screenShotsFile.map(
                      ({
                        id,
                        file,
                        uploading,
                        progress,
                        isDeleting,
                        error,
                        objectUrl,
                      }) => (
                        <div key={id} className="flex flex-col gap-1">
                          <div className="relative aspect-square rounded-md overflow-hidden">
                            <img
                              src={objectUrl}
                              alt={file?.name}
                              className="w-full h-full object-cover"
                            />
                            <Button
                              variant={"destructive"}
                              size={"icon"}
                              className=" absolute top-2 right-2"
                              onClick={() =>
                                removeScreenshotFile(
                                  screenShotsFile,
                                  setScreenshotsFile,
                                  id!
                                )
                              }
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                            {uploading && !isDeleting && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="text-white font-medium">
                                  {progress}%
                                </div>
                              </div>
                            )}

                            {error && (
                              <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
                                <div className="text-white font-medium">
                                  Error
                                </div>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate px-1">
                            {file?.name}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Upload Video  */}
          <FormField
            control={form.control}
            name="videoFile"
            render={() => (
              <FormItem>
                <FormLabel>
                  Select Video File :{" "}
                  <span className="text-xs text-muted-foreground">
                    (Video must be under 200 Mb)
                  </span>{" "}
                </FormLabel>
                <FormControl>
                  <Dropzone
                    onDrop={(acceptedFiles) =>{
                      onVideoFileDrop(acceptedFiles, setVideoFile)
                      form.setValue("videoFile", acceptedFiles[0]);
                    }
                    }
                    onDropRejected={rejectedVideoFiles}
                    maxFiles={1}
                    maxSize={200 * 1024 * 1024}
                    accept={{ "video/*": [] }}
                    disabled={Boolean(videoFile)}
                  >
                    {({ getRootProps, getInputProps, isDragActive }) => (
                      <div
                        {...getRootProps()}
                        className={cn(
                          "w-full border text-center cursor-pointer transition rounded-md",
                          isDragActive
                            ? "border-primary bg-primary/10"
                            : "border-muted-foreground"
                        )}
                      >
                        <div className="w-full h-16 flex items-center justify-center">
                          <Input
                            {...getInputProps()}
                            type="file"
                            disabled={Boolean(videoFile)}
                          />
                          {isDragActive ? (
                            <p className="text-center">Drop the files here</p>
                          ) : (
                            <p className="text-center text-muted-foreground">
                              Drag 'n' drop some files here, or click to select
                              files
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </Dropzone>
                </FormControl>

                {videoFile && (
                  <div className="mt-2 grid grid-cols-1 mb-3">
                    <div className="flex flex-col gap-1">
                      <div className="relative aspect-video rounded-md overflow-hidden w-full">
                        {/* <img
                          src={videoFile.objectUrl}
                          alt={videoFile.file?.name}
                          className="w-full h-full object-cover"
                        /> */}
                        <video className="w-full h-full block" controls>
                          <source
                            src={videoFile.objectUrl}
                            type={videoFile.file?.type}
                          />
                        </video>
                        <Button
                          variant={"destructive"}
                          size={"icon"}
                          className=" absolute top-2 right-2"
                          onClick={() =>
                            removeVideoFile(videoFile!, setVideoFile)
                          }
                          disabled={videoFile.isDeleting}
                        >
                          {videoFile.isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                        {videoFile.uploading && !videoFile.isDeleting && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-white font-medium">
                              {videoFile.progress}%
                            </div>
                          </div>
                        )}

                        {videoFile.error && (
                          <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
                            <div className="text-white font-medium">Error</div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate px-1">
                        {videoFile.file?.name}
                      </p>
                    </div>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full font-bold text-md md:text-lg disabled:bg-muted-foreground"
            disabled={loading || disabledButton}
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Create a new Post"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default UploadPostFrom;
