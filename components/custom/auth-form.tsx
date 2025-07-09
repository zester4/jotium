import React from "react";

export function AuthForm({
  action,
  children,
}: {
  action: any;
  children: React.ReactNode;
}) {
  return (
    <form action={action} className="flex flex-col gap-4 px-4 sm:px-16">
      {children}
    </form>
  );
}