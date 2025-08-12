//app/contact/page.tsx
"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";


export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("All fields are required.");
      return;
    }

    setIsSubmitting(true);
    const submitPromise = fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, message }),
    });

    toast.promise(submitPromise, {
      loading: "Submitting message...",
      success: () => {
        setName("");
        setEmail("");
        setMessage("");
        return "Message sent successfully!";
      },
      error: (err) => {
        console.error("Failed to send message:", err);
        return `Failed to send message: ${err.message || "Unknown error"}`;
      },
      finally: () => {
        setIsSubmitting(false);
      },
    });
  };

  return (
    <div className="mx-auto max-w-5xl pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-center mb-8">Contact Us</h1>
      <p className="text-center text-lg text-muted-foreground mb-12">
        We would love to hear from you. Please fill out the form below to get in touch.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground">
                Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-foreground">
                Message
              </label>
              <Textarea
                id="message"
                placeholder="Your Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="mt-1 min-h-[150px]"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4">Our Information</h2>
          <div className="flex items-start gap-4">
            <Mail className="size-6 mt-1 text-primary" />
            <div>
              <h3 className="font-semibold">Email</h3>
              <p className="text-muted-foreground">support@jotium.com</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Phone className="size-6 mt-1 text-primary" />
            <div>
              <h3 className="font-semibold">Phone</h3>
              <p className="text-muted-foreground">(123) 456-7890</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <MapPin className="size-6 mt-1 text-primary" />
            <div>
              <h3 className="font-semibold">Address</h3>
              <p className="text-muted-foreground">123 Jotium Lane, Suite 100<br />San Francisco, CA 94105</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
