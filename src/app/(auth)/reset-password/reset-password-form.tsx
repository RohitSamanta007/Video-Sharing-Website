"use client";
import PasswordInput from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import z from "zod";

const resetFormSchema = z.object({
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 character long")
    .max(30, "Password must be below 30 characters long")
    .regex(/[^A-Za-z0-9]/, {
      message: "Password must contain at least one special character",
    }),
});

type ResetPasswordValues = z.infer<typeof resetFormSchema>;

function ResetPasswordForm({ token }: { token: string }) {
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetFormSchema),
    defaultValues: {
      newPassword: "",
    },
  });

  const onSubmit = async ({ newPassword }: ResetPasswordValues) => {
    setSuccess(null)
    setError(null)

    try {
        const {error} = await authClient.resetPassword({
            newPassword,
            token,
        });

        if(error){
            setError(error.message || "Something went wrong");
            toast.error(error.message || "Something went wrong");
        }
        else{
            setSuccess("Password has beent rest. You can now LogIn")
            toast.success("Password has beent rest. You can now LogIn")
            setTimeout(()=> router.push("/login"), 3000);
            form.reset();
        }

    } catch (error) {
        setError("Something went wrong");
        toast.error("Error : Please try again later")
    }
  };

  const loading = form.formState.isSubmitting;

  return (
    <Card className="w-full">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                        autoComplete="new-password"
                        placeholder="Enter new Password"
                        {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div role="alert" className="text-sm text-red-500 text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full cursor-pointer disabled:bg-muted-foreground mt-2"
              disabled={loading || Boolean(success)}
            >
              {loading ? (
                <Loader2 className="animate-spin size-4" />
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      {success && (
        <CardFooter className="flex flex-col gap-3">
            <h1 className="text-center text-green-500 font-semibold">Password Reset Successful. Please login with the new Password</h1>
          <Button asChild variant={"outline"} className="w-full">
            <Link href={"/login"}>LogIn Now</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default ResetPasswordForm;
