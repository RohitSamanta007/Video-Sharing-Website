"use client";
import React, { useState } from "react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useFormStatus } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { authClient, signIn, signUp } from "@/lib/auth-client";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import PasswordInput from "./password-input";
import { Checkbox } from "../ui/checkbox";
import { GoogleIcon } from "../icons/GoogleIcon";
import { GitHubIcon } from "../icons/GithubIcon";
import { sendVerificationEmail } from "@/lib/email/send-email";

const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(30, "Password must be below 30 characters long")
    .regex(/[^A-Za-z0-9]/, {
      message: "Password must contain at least one special character",
    }),
  rememberMe: z.boolean().optional(),
});

type loginValues = z.infer<typeof loginSchema>;

function LoingForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSendVerificationButton, setShowSendVerificationButton] =
    useState(false);
  const [sendEmailSuccess, setSendEmailSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const fromEmail = searchParams.get("from");

  // console.log("The value of fromEmail is : ", fromEmail)

  const form = useForm<loginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmitHandler = async (values: loginValues) => {
    setIsLoading(true);

    try {
      const { error } = await signIn.email(
        {
          email: values.email,
          password: values.password,
          rememberMe: values.rememberMe,
        },
        {
          onError: (ctx) => {
            // Handle the error
            if (ctx.error.status === 403 && fromEmail === "email") {
              setShowSendVerificationButton(true);
            }
          },
        }
      );

      if (error) {
        toast.error(error.message);
        setError(error.message || "Something went wrong");
      } else {
        toast.success(
          "Login successful"
        );
        const redirectTo = searchParams.get("redirect") || "/";
        router.replace(redirectTo);
      }
    } catch (error) {
      console.log("Error in Register From : ", error);
      toast.error(`Error in Restration! Plase try again sometine later : ${error} `);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: "google" | "github") => {
    setError(null);
    setIsLoading(true);
    const redirectTo = searchParams.get("redirect") || "/";

    const { error } = await signIn.social({
      provider,
      callbackURL: redirectTo,
    });

    setIsLoading(false);
    if (error) {
      setError(error.message || "Something went wrong");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6 shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold mb-2 text-center">
          LogIn Your Account
        </CardTitle>
        <CardDescription className="">
          <div className="text-gray-500">
            Login your account by filling out the form below.
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent>
        {showSendVerificationButton ? (
          <Button
            className="w-full mb-6 border border-green-600 dark:border-green-50 bg-green-50 dark:bg-green-600"
            variant={"secondary"}
            asChild
          >
            <Link href={"/verify-email"}>Resend Verificaion Email</Link>
          </Button>
        ) : (
          <Button
            className="w-full mb-6 border border-amber-600 dark:border-amber-50 bg-amber-50 dark:bg-amber-600"
            variant={"secondary"}
            asChild
          >
            <Link href={"/register"}>Create a New Account</Link>
          </Button>
        )}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitHandler)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="johndoe@gmail.com"
                      type="email"
                      autoComplete="email"
                      className="focus:ring-2 focus:ring-blue-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center">
                    <FormLabel className="font-semibold">Password</FormLabel>
                    <Link
                      href={"/forgot-password"}
                      className="ml-auto inline-block text-sm underline"
                    >
                      Forgot your password
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700 border-blue-500"
                    />
                  </FormControl>
                  <FormLabel>Remember me</FormLabel>
                </FormItem>
              )}
            />

            {error && (
              <div className="text-sm text-red-600 my-3" role="alert">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-2 rounded-lg cursor-pointer disabled:bg-yellow-600"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "LogIn"}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter>
        <div className="w-full flex flex-col items-center justify-around gap-3">
          <Button
            type="button"
            variant={"outline"}
            className="w-full gap-2 cursor-pointer"
            disabled={isLoading}
            onClick={() => handleSocialSignIn("google")}
          >
            <GoogleIcon width={"0.98em"} height={"1em"} />
            Sign in with Google
          </Button>

          <Button
            type="button"
            variant={"outline"}
            className="w-full gap-2 cursor-pointer"
            disabled={isLoading}
            onClick={() => handleSocialSignIn("github")}
          >
            <GitHubIcon />
            Sign in with GitHub
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default LoingForm;
