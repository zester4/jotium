"use client";

import { useState } from "react";
import { toast } from "sonner"; // Import toast for notifications

import { MessageSquareTextIcon, SmileIcon, MehIcon, FrownIcon, XIcon } from "./icons";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface FeedbackFormProps {
  onClose: () => void;
}

export const FeedbackForm = ({ onClose }: FeedbackFormProps) => {
  const [feedbackText, setFeedbackText] = useState("");
  const [sentiment, setSentiment] = useState<"positive" | "neutral" | "negative" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission loading

  const handleSubmit = async () => {
    if (!feedbackText.trim()) {
      toast.error("Feedback cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    const submitPromise = fetch("/api/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: "shopseyy@gmail.com", // The specified email address
        type: "feedback",
        data: {
          feedbackText,
          sentiment,
          timestamp: new Date().toISOString(),
        },
      }),
    });

    toast.promise(submitPromise, {
      loading: "Submitting feedback...",
      success: () => {
        onClose();
        return "Feedback submitted successfully!";
      },
      error: (err) => {
        console.error("Failed to send feedback:", err);
        return `Failed to submit feedback: ${err.message || "Unknown error"}`;
      },
      finally: () => {
        setIsSubmitting(false);
      },
    });
  };

  return (
    <div className="p-4 bg-background rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <MessageSquareTextIcon size={20} />
          <h3 className="text-lg font-semibold">Submit Feedback</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <XIcon size={20} />
        </Button>
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
        We are always looking for ways to improve our product. Please let us
        know what you think.
      </p>
      <Textarea
        placeholder="Give us your feedback..."
        value={feedbackText}
        onChange={(e) => setFeedbackText(e.target.value)}
        className="mb-4 min-h-[100px]"
      />
      <div className="flex gap-2 mb-4">
        <Button
          variant="outline"
          size="icon"
          className={sentiment === "positive" ? "bg-green-500/20 border-green-500" : ""}
          onClick={() => setSentiment("positive")}
        >
          <SmileIcon />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={sentiment === "neutral" ? "bg-yellow-500/20 border-yellow-500" : ""}
          onClick={() => setSentiment("neutral")}
        >
          <MehIcon />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={sentiment === "negative" ? "bg-red-500/20 border-red-500" : ""}
          onClick={() => setSentiment("negative")}
        >
          <FrownIcon />
        </Button>
      </div>
      <Button onClick={handleSubmit} className="w-full">
        Submit
      </Button>
    </div>
  );
};
