import LoingForm from "@/components/auth/login-form";
import React from "react";

async function RegisterPage() {

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-md">
        <LoingForm />
      </div>
    </div>
  );
}

export default RegisterPage;
