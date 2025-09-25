import EmailVerificationTemplete from "@/components/mail/verification-email";
// import { Session } from "../auth-client";
// import { User } from "../auth";
// import { Session } from "better-auth";
import { Resend } from "resend";
import transpoter from "./nodemailer-config";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail2 = async (url: string, user: User) => {
  // console.log("The value of user in sendEmail is : ", user);
  try {
    
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: ['delivered@resend.dev'],
      subject: "Verify your email",
      react: EmailVerificationTemplete({ url, name: user.name }),
    });
  } catch (error) {
    console.log("Error in sending Email : ", error)
  }
};

export const sendVerificationEmail = async (url: string, userEmail:string, userName: string) => {
  try {
    await transpoter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: userEmail,
      subject: "Verify Your Email",
      html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Email Verification</title>
  </head>
  <body
    style="background-color:#ffffff; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif;"
  >
    <div
      style="margin:0 auto; padding:20px 25px 48px; background-image:url('/static/raycast-bg.png'); background-position:bottom; background-repeat:no-repeat;"
    >
      <h1 style="font-size:28px; font-weight:bold; margin-top:48px;">
        Hello ${userName}, Your Account Verification link
      </h1>

      <div style="margin:24px 0;">
        <p style="font-size:16px; line-height:26px;">
          <a
            href="${url}"
            style="color:#FF6363; text-decoration:none;"
          >
            👉 Click here to sign in 👈
          </a>
        </p>
        <p style="font-size:16px; line-height:26px;">
          If you didn't request this, please ignore this email.
        </p>
      </div>

      <p style="font-size:16px; line-height:26px;">
        Best, <br />- Vidme Team
      </p>

      <hr style="border:0; border-top:1px solid #dddddd; margin-top:48px;" />

      <img
        src="/static/raycast-logo.png"
        width="32"
        height="32"
        alt="Logo"
        style="filter:grayscale(100%); -webkit-filter:grayscale(100%); margin:20px 0;"
      />

      <p style="color:#8898aa; font-size:12px; margin-left:4px;">
        Rohit Technologies Inc.
      </p>
      <p style="color:#8898aa; font-size:12px; margin-left:4px;">
        70/12 Bidhannagar Sector V, Kolkata-70002, West Bengal, India
      </p>
    </div>
  </body>
</html>
`,
    });
  } catch (error) {
    console.log("Error in sending Email : ", error);
  }
};


export const sendResetPasswordEmail = async (url: string, userEamil: string, userName:string) => {
  try {
    await transpoter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: userEamil,
      subject: "Reset Your Account's Password",
      html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Email Verification</title>
  </head>
  <body
    style="background-color:#ffffff; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif;"
  >
    <div
      style="margin:0 auto; padding:20px 25px 48px; background-image:url('/static/raycast-bg.png'); background-position:bottom; background-repeat:no-repeat;"
    >
      <h1 style="font-size:28px; font-weight:bold; margin-top:48px;">
        Hello ${userName}, Your Reset Password link
      </h1>

      <div style="margin:24px 0;">
        <p style="font-size:16px; line-height:26px;">
          <a
            href="${url}"
            style="color:#FF6363; text-decoration:none;"
          >
            👉 Click here to Reset Your password 👈
          </a>
        </p>
        <p style="font-size:16px; line-height:26px;">
          If you didn't request this, please ignore this email.
        </p>
      </div>

      <p style="font-size:16px; line-height:26px;">
        Best, <br />- Vidme Team
      </p>

      <hr style="border:0; border-top:1px solid #dddddd; margin-top:48px;" />

      <img
        src="/static/raycast-logo.png"
        width="32"
        height="32"
        alt="Logo"
        style="filter:grayscale(100%); -webkit-filter:grayscale(100%); margin:20px 0;"
      />

      <p style="color:#8898aa; font-size:12px; margin-left:4px;">
        Rohit Technologies Inc.
      </p>
      <p style="color:#8898aa; font-size:12px; margin-left:4px;">
        70/12 Bidhannagar Sector V, Kolkata-70002, West Bengal, India
      </p>
    </div>
  </body>
</html>
`,
    });
  } catch (error) {
    console.log("Error in sending Email : ", error);
  }
};
