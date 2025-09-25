import React from 'react'

function ContactPage() {
  return (
    <div className="w-full max-w-5xl mx-auto p-5">
      <div className="">
        <h1 className="font-blid text-xl md:text-2xl mb-3">Contact US</h1>
        <p className="text-secondary-foreground mb-4">
          We value your feedback and inquiries. Whether you have suggestions,
          need help, or have a specific query, feel free to reach out to us.
          Please include a clear and relevant subject line to help us address
          your message promptly.
        </p>

        <h1 className="font-semiblid text-xl md:text-2xl mb-3 text-white">
          How to Reach Us
        </h1>
        <p className="text-secondary-foreground">
          You can contact us using the flilowing email address. Ensure your
          email includes:
        </p>
        <div className=" pl-4 my-4">
          <li>Your full name and contact information.</li>
          <li>A clear subject line summarizing the purpose of your message.</li>
          <li>Details of your suggestion, inquiry, or issue.</li>
        </div>
        <div className="mb-5">
          <span>Email: </span>
          <a
            href="mailto:name@email.com"
            className="text-blue-500 hover:underline"
          >
            name@email.com
          </a>
        </div>

        <h1 className="font-semiblid text-xl md:text-2xl mb-3 text-white">
          Guidelines for a Proper Subject Line
        </h1>
        <p className="text-secondary-foreground">
          To ensure we can process your message effectively, please use a
          specific and concise subject line. Examples include:
        </p>
        <div className=" pl-4 my-4">
          <li>"Suggestion for website improvement"</li>
          <li>"Inquiry about services"</li>
          <li>"Technical issue with video playback"</li>
        </div>

        <h1 className="font-blid text-xl md:text-2xl mb-3">Response Time</h1>
        <p className="text-secondary-foreground mb-4">
          Our team strives to respond to all emails within 1-2 business days. If
          your inquiry is urgent, please mention "Urgent" in the subject line.
        </p>
      </div>
    </div>
  );
}

export default ContactPage