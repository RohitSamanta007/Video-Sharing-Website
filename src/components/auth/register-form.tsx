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
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { signUp } from "@/lib/auth-client";
import Link from "next/link";
import PasswordInput from "./password-input";

const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters long")
      .max(60, "Name must be under 60 characters"),
    email: z.email("Invalid email"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .max(30, "Password must be below 30 characters long")
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must contain at least one special character",
      }),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password do not match",
    path: ["confirmPassword"],
  });

  type RegisterValues = z.infer<typeof registerSchema>;

function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmitHandler = async (values:RegisterValues) => {
    setIsLoading(true);

    try {
      const { error } = await signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        callbackURL: "http://localhost:3000/login?from=email",
      });

      if (error) {
        toast.error(error.message);
        setError(error.message || "Something went wrong")
      } else {
        toast.success(
          "Registration successful! Please check your email confirmation."
        );
        setIsSuccess(true);
      }
    } catch (error) {
      console.log("Error in Register From : ", error);
      toast.error("Error in Restration! Plase try again sometine later");
    } finally {
      setIsLoading(false);
      form.reset();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6 shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold mb-2 text-center">
          Register
        </CardTitle>
        <CardDescription className="text-gray-500 text-center">
          Create a new account by filling out the form below.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitHandler)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your name..."
                      type="text"
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
                  <FormLabel className="font-semibold">Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      placeholder="Enter Password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      placeholder="Confirm Password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

              {error && (
                <div className="text-sm text-red-600 my-3" role="alert">{error}</div>
              )}

            <Button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-2 rounded-lg cursor-pointer disabled:bg-yellow-600"
              disabled={isLoading || isSuccess}
            >
              {isLoading ? "Creating..." : "Create An Account"}
            </Button>
            {isSuccess && (
              <div className="mt-1 flex flex-col justify-center text-center">
                <span className="mb-2 px-4 py-2 rounded-lg bg-green-100 text-green-700 font-medium shadow-sm border border-green-300">
                  Registration successful! Please check your email for
                  confirmation.
                </span>
                <Button
                  asChild
                  className="w-full bg-amber-500 py-3 hover:bg-amber-600"
                >
                  <Link href={"/login"}>Go To LogIn</Link>
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
      
      <CardFooter>
        <div className="flex w-full justify-center items-center border-t pt-4">
          <p className="text-muted-foreground text-center text-xs">Already have an account? {" "} 
            <Link href={"/login"} className="underline hover:text-blue-500 hover:font-medium">LogIn</Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}

export default RegisterForm;
