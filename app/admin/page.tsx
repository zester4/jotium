import AdminOTPGate from "@/components/admin/AdminOTPGate";
import { adminEmails } from "@/db/queries";

import { auth } from "../(auth)/auth";

// Server component
export default async function AdminPage() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email || !adminEmails.includes(email)) {
    return <div className="flex items-center justify-center min-h-screen text-xl font-semibold">Access Denied</div>;
  }
  // Render client-side OTP gate
  return <AdminOTPGate />;
} 