"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import z from "zod";

const verifyEmailSchema = z.object({
  email: z.email("Invalid Email"),
});

type verifyEmailValues = z.infer<typeof verifyEmailSchema>;

function VerifyEmailForm() {

    const router = useRouter()

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<verifyEmailValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async ({ email }: verifyEmailValues) => {
    setError(null);
    setSuccess(null);

    const {error} = await authClient.sendVerificationEmail({
        email,
        callbackURL: "/login"
    })

    if(error){
        setError(error.message || "Something went wrong")
        toast.error(error.message || "Something went wrong")
    }
    else{
        setSuccess("Verification email send successfully")
        toast.success("Verification email send successfully")
        form.reset();
        setTimeout(()=> router.push("/login"), 4000)
    }
  };

  const loading = form.formState.isSubmitting;

  return (
    <Card className="w-full m-4 max-w-sm shadow-lg rounded-lg p-4">
      <CardHeader>
        <CardTitle className="text-center text-xl md:text-2xl font-semibold">
          Resend Verification Eamil
        </CardTitle>
        <CardDescription>
          <div className="text-center">
            Resend a verification link by filling out the correct email form
            below
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Email : </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter a registered email"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <div className="text-red-400 text-md">{error}</div>}

            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={loading || Boolean(success)}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Send Veridication Eamil"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      {success && (
        <CardFooter>
          <div className=" w-full mb-2 px-4 py-2 rounded-lg bg-green-100 text-green-700 font-medium shadow-sm border border-green-300">
            Registration successful! Please check your email for confirmation.
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

export default VerifyEmailForm;
