"use client";
import React, { useState } from "react";

import AdminDashboard from "@/app/admin/dashboard";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function AdminOTPGate() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const handleChange = (value: string) => {
    setOtp(value);
    setError("");
    if (value.length === 4) {
      if (value === "2902") {
        setUnlocked(true);
      } else {
        setError("Incorrect code. Try again.");
      }
    }
  };

  if (unlocked) return <AdminDashboard />;
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="text-lg font-semibold">Enter 4-digit admin code</div>
      <InputOTP maxLength={4} value={otp} onChange={handleChange} autoFocus>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>
      {error && <div className="text-destructive text-sm mt-2">{error}</div>}
    </div>
  );
} 