"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import z, { boolean, success } from "zod";
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
import { Loader2, Trash2, X } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import Dropzone from "react-dropzone";
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
import { Checkbox } from "../ui/checkbox";
import { addNewPost, updatePostAction } from "@/actions/admin-actions";
import { useRouter } from "next/navigation";
import VideoPlayer from "@/components/post/videoPlayer";

export const postSchema = (isEditing: boolean) =>
  z.object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters long")
      .max(200, "Title must be under 100 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters long")
      .max(600, "Description must be under 500 characters"),
    categoryIds: z
      .array(z.string().nonempty("Please select a category"))
      .min(1, "Please select at least one category"),
    thumbnailImage: isEditing
      ? z.instanceof(File).optional()
      : z
          .instanceof(File, { message: "File is required" })
          .refine(
            (file) => file.type.startsWith("image/"),
            "Only image files are allowed"
          ),
    screenshotImages: z.array(
      z
        .instanceof(File)
        .refine((file: File) => file.type.startsWith("image/"), {
          message: "Only image files are allowed",
        })
        .refine((file: File) => file.size <= 10 * 1024 * 1024, {
          message: "Each file must be less than (10Mb)",
        })
    ),
    videoFile: z
      .instanceof(File, { message: "File is required" })
      .refine(
        (file) => file.type.startsWith("video/"),
        "Only image files are allowed"
      ),
    // videoUrl: z.string().min(1, "You must provide video url to submit."),
    // videoKey: z.string().min(1, "You must provide video key to submit."),

    isPublic: z.boolean().optional(),
  });

export type PostValues = z.infer<ReturnType<typeof postSchema>>;

export interface FileType {
  id: string;
  file?: File;
  uploading: boolean;
  progress: number;
  key?: string;
  isDeleting: boolean;
  error: boolean;
  objectUrl?: string;
  isFromPost: boolean;
  isDeleted: boolean;
}

function UploadPostFrom({
  categories,
  post,
  isEditing,
}: {
  categories: CategoryProps[];
  post?: EditPagePostsProps;
  isEditing?: boolean;
}) {
  const router = useRouter();
  const postCategoriesWithName: { id: number; name: string }[] =
    isEditing && post
      ? (post.categories as { id: number; name: string }[])
      : [];

  const postCategory = postCategoriesWithName.map((cat) => String(cat.id));

  // console.log("the value of the post in update post form : ", post)

  const [thumbnailFile, setThumbnailFile] = useState<FileType>(
    isEditing && post
      ? {
          id: uuidv4(),
          uploading: false,
          progress: 100,
          isDeleting: false,
          error: false,
          isFromPost: true,
          isDeleted: false,
          objectUrl: post.thumbnailUrl,
          key: post.thumbnailKey,
        }
      : {
          id: "",
          uploading: false,
          progress: 0,
          isDeleting: false,
          error: false,
          isFromPost: false,
          isDeleted: false,
        }
  );
  const [videoFile, setVideoFile] = useState<FileType>(
    isEditing && post
      ? {
          id: uuidv4(),
          uploading: false,
          progress: 100,
          isDeleting: false,
          error: false,
          isFromPost: true,
          isDeleted: false,
          objectUrl: post.videoUrl,
          key: post.videoKey,
        }
      : {
          id: "",
          uploading: false,
          progress: 0,
          isDeleting: false,
          error: false,
          isFromPost: false,
          isDeleted: false,
        }
  );
  const postScreenshotsFiles =
    isEditing && post
      ? post.screenshotUrls.map((url, index) => {
          return {
            id: uuidv4(),
            uploading: false,
            progress: 100,
            isDeleting: false,
            error: false,
            isFromPost: true,
            isDeleted: false,
            objectUrl: url,
            key: post.screenshotKeys[index],
          };
        })
      : [];
  const [screenShotsFile, setScreenshotsFile] =
    useState<FileType[]>(postScreenshotsFiles);

  const form = useForm<z.infer<ReturnType<typeof postSchema>>>({
    resolver: zodResolver(postSchema(!!isEditing)),
    defaultValues: {
      title: isEditing && post ? post.title : "",
      description: isEditing && post ? post.description : "",
      categoryIds: postCategory,
      thumbnailImage: undefined,
      videoFile: undefined,
      isPublic: isEditing && post ? post.isPublic! : true,
      screenshotImages: [],
      // videoUrl: isEditing && post ? post.videoUrl : "",
      // videoKey: isEditing && post ? post.videoKey : "",
    },
  });

  const onSubmitHandler = async (
    values: z.infer<ReturnType<typeof postSchema>>
  ) => {
    console.log("The value of the submitted form is : ", values);

    try {
      const thumbnailkey: string = thumbnailFile.key
        ? thumbnailFile.key
        : await uploadThumbnailFile(setThumbnailFile, values.thumbnailImage!);
      console.log("The value of thumbnailKey is : ", thumbnailkey);

      const existingScreenshostsKey = screenShotsFile
        .map((item) => item.key)
        .filter((key) => key !== undefined);
      const screenshotsKeysOfSelectedFiles = await Promise.all(
        values.screenshotImages.map((file) =>
          uploadScreenshotsFile(setScreenshotsFile, file)
        )
      );
      const screenshotsKeys = [
        ...existingScreenshostsKey,
        ...screenshotsKeysOfSelectedFiles,
      ];

      console.log("All uploaded Screenshotes keys:", screenshotsKeys);

      // const videokey = await uploadVideoFile(setVideoFile, values.videoFile);
      // console.log("The value of videokey is : ", videokey)

      console.log("all file uploaded successfully");

      const payload = {
        title: values.title,
        description: values.description,
        categoryIds: values.categoryIds,
        // videoKey: values.videoKey.trim(),
        // videoUrl: values.videoUrl.trim(),
        thumbnailKey: thumbnailkey,
        screenshotKeys: screenshotsKeys,
        isPublic: values.isPublic,
      };

      // console.log("the value of the paylod is : ", payload);
      console.log("The value of the videoFile is : ", videoFile)

      let result;
      if (isEditing && post) {
        result = await updatePostAction({...payload, isPending: videoFile.isDeleted}, post.slug);
        if(Boolean(result.postId) && videoFile.file){
          console.log("Uploading video file for update")
          const videokey: string = await uploadVideoFile(setVideoFile, values.videoFile!, result.postId!)
        }
      } else {
        // for new post
        result = await addNewPost(payload);
        if(result.postId){
           const videokey: string = await uploadVideoFile(setVideoFile, values.videoFile!, result.postId)
        }
      }
      if (result.success) {
        toast("Post Added Successfully");
        router.push(`/post/${result.slug}`);
      } else {
        toast.error(result.message);

        // delete uploaded file if there is an error
        !thumbnailFile.isFromPost &&
          (await fetch("/api/s3/delete", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: thumbnailFile.key }),
          }));
        await Promise.all(
          screenShotsFile.map(
            (file) =>
              !file.isFromPost &&
              fetch("/api/s3/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: file.key }),
              })
          )
        );
        return;
      }

      // console.log("The vlaue of result is : ", result);
    } catch (error) {
      console.log("Error in Form Submit : ", error);
      toast.error("Something went wrong");

      // delete uploaded files
      !thumbnailFile.isFromPost &&
        (await fetch("/api/s3/delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: thumbnailFile.key }),
        }));
      await Promise.all(
        screenShotsFile.map(
          (file) =>
            !file.isFromPost &&
            fetch("/api/s3/delete", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ key: file.key }),
            })
        )
      );
    } finally {
      form.reset();
      setThumbnailFile({
        id: "",
        uploading: false,
        progress: 0,
        isDeleting: false,
        error: false,
        isFromPost: false,
        isDeleted: false,
      });
      setVideoFile({
        id: "",
        uploading: false,
        progress: 0,
        isDeleting: false,
        error: false,
        isFromPost: false,
        isDeleted: false,
      });
      setScreenshotsFile([]);
    }
  };

  const loading = form.formState.isSubmitting;
  // const disabledButton =
  //   thumbnailFile?.uploading ||
  //   videoFile?.uploading ||
  //   screenShotsFile.some((file) => file.uploading);

  const disabledButton =
    thumbnailFile?.uploading || screenShotsFile.some((file) => file.uploading);

  return (
    <div className="relative">
      {loading && (
        <div className="absolute w-full flex items-center top-0 right-0 bottom-0 left-0 justify-center bg-background/50 z-10 ">
          <div className=" flex flex-col items-center justify-center gap-3">
            <Loader2 className="size-20 animate-spin " />
            <h1 className="font-bold text-xl md:text-2xl lg:text-3xl">
              Uploading... Please wait
            </h1>
          </div>
        </div>
      )}

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
                    disabled={loading || isEditing}
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

          {/* Categories selection  */}
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
            render={({ field }) => (
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
                    disabled={
                      Boolean(thumbnailFile.file) || Boolean(thumbnailFile.key)
                    }
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
                            disabled={
                              Boolean(thumbnailFile.file) ||
                              Boolean(thumbnailFile.key)
                            }
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

                {thumbnailFile.objectUrl && (
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
                          onClick={() => {
                            removeThumbnailFile(
                              thumbnailFile!,
                              setThumbnailFile,
                              form
                            );
                          }}
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
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Screenshots Image Files :{" "}
                  <span className="text-xs text-muted-foreground">
                    (Image must be under 10 Mb)
                  </span>{" "}
                </FormLabel>
                <FormControl>
                  <Dropzone
                    onDrop={(acceptedFiles) => {
                      onScreenshotsFileDrop(acceptedFiles, setScreenshotsFile);
                      // form.setValue("screenshotImages", acceptedFiles);
                      const prevFiles =
                        form.getValues("screenshotImages") || [];
                      form.setValue("screenshotImages", [
                        ...prevFiles,
                        ...acceptedFiles,
                      ]);
                    }}
                    onDropRejected={rejectedScreenshotsFiles}
                    maxFiles={10 - screenShotsFile.length}
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
                                  id!,
                                  form
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

          {/* upload raw video  */}
          <FormField
            control={form.control}
            name="videoFile"
            render={() => (
              <FormItem>
                <FormLabel>
                  Select Video File :{" "}
                  <span className="text-xs text-muted-foreground">
                    (Video must be under 200mb)
                  </span>{" "}
                </FormLabel>
                <FormControl>
                  <Dropzone
                    onDrop={(acceptedFiles) => {
                      onVideoFileDrop(acceptedFiles, setVideoFile);
                      form.setValue("videoFile", acceptedFiles[0]);
                    }}
                    onDropRejected={rejectedVideoFiles}
                    maxFiles={1}
                    maxSize={200 * 1024 * 1024}
                    accept={{ "video/*": [] }}
                    disabled={Boolean(videoFile.file) || Boolean(videoFile.key)}
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
                            disabled={
                              Boolean(videoFile.file) || Boolean(videoFile.key)
                            }
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

                {videoFile.objectUrl && (
                  <div className="mt-2 grid grid-cols-1 mb-3">
                    <div className="flex flex-col gap-1">
                      <div className="relative aspect-video rounded-md overflow-hidden w-full">
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
                            removeVideoFile(videoFile!, setVideoFile, form)
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

          {/* Input video Url  */}
          {/* <FormField
            control={form.control}
            name="videoUrl"
            render={({ field }) => (
              <FormItem>
                {form.getValues("videoUrl").length > 0 && (
                  <div>
                    <VideoPlayer videoUrl={field.value} />
                  </div>
                )}

                <FormLabel className="font-semibold">Video URL : </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter Video url"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          {/* video key  */}
          {/* <FormField
            control={form.control}
            name="videoKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">
                  AWS Video Key :{" "}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter Video Key"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          {/* Ispublic checkbox input  */}
          <FormField
            control={form.control}
            name="isPublic"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700 border-blue-500"
                  />
                </FormControl>
                <FormLabel>Is Public</FormLabel>
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
            ) : isEditing ? (
              "Update Post"
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
