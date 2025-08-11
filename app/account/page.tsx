"use client";

import { ArrowLeft, Eye, EyeOff, Key, Plug, Shield, User, Plus, Trash, Sun, Moon, Monitor, Check } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const apiTools = [
  { name: "Airtable", keyName: "airtableApiKey", placeholder: "key..." },
  { name: "Ayrshare", keyName: "ayrshareApiKey", placeholder: "ayr-..." },
  { name: "Asana", keyName: "asanaApiKey", placeholder: "pat_..." },
  { name: "Cal.com", keyName: "calcomApiKey", placeholder: "cal-..." },
  { name: "ClickUp", keyName: "clickupApiToken", placeholder: "pk_..." },
  { name: "GitHub", keyName: "githubToken", placeholder: "ghp-..." },
  { name: "Notion", keyName: "notionApiKey", placeholder: "secret_..." },
  { name: "Slack", keyName: "slackBotToken", placeholder: "xoxb-..." },
  { name: "Stripe", keyName: "stripeSecretKey", placeholder: "sk_test_..." },
  { name: "Supabase URL", keyName: "supabaseUrl", placeholder: "https://<project-ref>.supabase.co" },
  { name: "Supabase Key", keyName: "supabaseKey", placeholder: "ey..." },
  { name: "Trello", keyName: "trelloApiKey", placeholder: "key..." },
  { name: "Trello Token", keyName: "trelloToken", placeholder: "token..." },
  { name: "Linear", keyName: "linearApiKey", placeholder: "lin_api_..." },
];

// List of OAuth providers
const oauthProviders = [
  { name: "Google", service: "gmail", icon: "/logo/google.svg" },
  { name: "GitHub", service: "github", icon: "/logo/github.svg" },
  { name: "Slack", service: "slack", icon: "/logo/slack.svg" },
  { name: "X", service: "x", icon: "/logo/x-twitter.svg" },
];

export default function AccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();   
  const [activeSection, setActiveSection] = useState<"profile" | "security" | "integrations" | "api-keys" | "appearance" | "customize">("profile");
  // Appearance
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Customize (prompt/tone)
  const [customInstruction, setCustomInstruction] = useState("");
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/account/customize");
        if (res.ok) {
          const data = await res.json();
          setCustomInstruction(data.instruction || "");
        }
      } catch {}
    })();
  }, []);
  const saveCustomInstruction = async () => {
    const instruction = customInstruction.trim();
    try {
      const res = await fetch("/api/account/customize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction })
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Custom instruction saved.");
    } catch {
      toast.error("Failed to save instruction.");
    }
  };
  const clearCustomInstruction = async () => {
    try {
      setCustomInstruction("");
      const res = await fetch("/api/account/customize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: "" })
      });
      if (!res.ok) throw new Error("Failed to clear");
      toast.info("Custom instruction cleared.");
    } catch {}
  };

  // Preset instructions
  const presets = [
    {
      id: 'custom',
      title: 'Custom',
      description: 'Responds to you as you please.',
      value: '',
    },
    {
      id: 'concise',
      title: 'Concise',
      description: 'Responds briefly and directly.',
      value: 'Respond concisely. Use short sentences, bullet lists where helpful, and avoid unnecessary elaboration.',
    },
    {
      id: 'formal',
      title: 'Formal',
      description: 'Responds using a formal tone.',
      value: 'Use a formal, professional tone. Avoid colloquialisms. Provide well-structured, complete explanations.',
    },
    {
      id: 'socratic',
      title: 'Socratic',
      description: 'Responds in a way to help you learn.',
      value: 'Use the Socratic method. Ask guiding questions, reveal reasoning step-by-step, and encourage independent thinking.',
    },
  ] as const;

  const activePresetId = (() => {
    const match = presets.find(p => p.value && p.value === customInstruction.trim());
    if (match) return match.id;
    return customInstruction.trim().length === 0 ? 'custom' : 'custom';
  })();

  // Which services have a key saved (from backend)
  const [savedServices, setSavedServices] = useState<string[]>([]);
  // Input values for adding/updating
  const [inputValues, setInputValues] = useState(() => Object.fromEntries(apiTools.map((tool) => [tool.keyName, ""])));
  const [showKey, setShowKey] = useState(() => Object.fromEntries(apiTools.map((tool) => [tool.keyName, false])));
  // Custom keys
  const [customKeys, setCustomKeys] = useState<{ name: string; value: string; show: boolean; editing: boolean; inputValue: string }[]>([]);
  const [customName, setCustomName] = useState("");
  const [customInputValue, setCustomInputValue] = useState("");

  // OAuth connections
  const [oauthConnections, setOauthConnections] = useState<{ service: string; externalUserName?: string }[]>([]);
  const [oauthLoading, setOauthLoading] = useState(true);
  const refreshOauthConnections = async () => {
    try {
      setOauthLoading(true);
      const res = await fetch("/api/oauth/connections");
      if (res.ok) {
        const data = await res.json();
        setOauthConnections(data.connections || []);
      }
    } catch (err) {
      console.error("Error refreshing OAuth connections:", err);
    } finally {
      setOauthLoading(false);
    }
  };

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");

  // Profile state
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // Delete All Chats state
  const [showDeleteAllChatsDialog, setShowDeleteAllChatsDialog] = useState(false);
  const [isDeletingAllChats, setIsDeletingAllChats] = useState(false);

  // Fetch saved API key services on mount
  useEffect(() => {
    fetch("/account/api/api-keys")
      .then((res) => res.json())
      .then((data) => setSavedServices(data.services || []));
  }, []);

  useEffect(() => {
    setProfileLoading(true);
    fetch("/account/api/profile")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      })
      .then((data) => {
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setEmail(data.email || "");
        setProfileError("");
      })
      .catch(() => setProfileError("Failed to load profile info."))
      .finally(() => setProfileLoading(false));
  }, []);

  // Fetch OAuth connections on mount
  useEffect(() => {
    setOauthLoading(true);
    refreshOauthConnections();
  }, []);

  // Handle OAuth success/error messages from URL params
  useEffect(() => {
    if (searchParams.get("oauth_success")) {
      toast.success("OAuth connection successful!");
      refreshOauthConnections();
      router.replace("/account", undefined); //
    }
    if (searchParams.get("oauth_disconnected")) {
      toast.info("OAuth connection disconnected.");
      refreshOauthConnections();
      router.replace("/account", undefined); //
    }
    if (searchParams.get("oauth_error")) {
      toast.error("OAuth connection failed. Please try again.");
      router.replace("/account", undefined); //
    }
  }, [searchParams, router]);

  // Disconnect handler to update UI immediately without full refresh
  const handleDisconnectOAuth = async (service: string) => {
    try {
      setOauthLoading(true);
      const res = await fetch(`/api/oauth/${service}/disconnect`, { method: "GET", redirect: "manual" as RequestRedirect });
      if (!res.ok && !(res.status >= 300 && res.status < 400)) {
        throw new Error("Failed to disconnect");
      }
      toast.info("OAuth connection disconnected.");
      setOauthConnections((prev) => prev.filter((c) => c.service !== service));
    } catch (err) {
      console.error("Failed to disconnect OAuth:", err);
      toast.error("Failed to disconnect. Please try again.");
    } finally {
      await refreshOauthConnections();
    }
  };

  // Built-in API key logic
  const handleInputChange = (keyName: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [keyName]: value }));
  };

  const handleSave = async (keyName: string, serviceName: string) => {
    const key = inputValues[keyName];
    if (!key) return;
    await fetch("/account/api/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service: serviceName, key }),
    });
    setSavedServices((prev) => [...new Set([...prev, serviceName])]);
    setInputValues((prev) => ({ ...prev, [keyName]: "" }));
  };

  const handleRemove = async (serviceName: string, keyName: string) => {
    await fetch("/account/api/api-keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service: serviceName }),
    });
    setSavedServices((prev) => prev.filter((s) => s !== serviceName));
    setInputValues((prev) => ({ ...prev, [keyName]: "" }));
    setShowKey((prev) => ({ ...prev, [keyName]: false }));
  };

  const handleShowToggle = (keyName: string) => {
    setShowKey((prev) => ({ ...prev, [keyName]: !prev[keyName] }));
  };

  // Custom keys logic (stored via backend as service=custom:NAME)
  const handleAddCustomKey = async () => {
    if (!customName.trim() || !customInputValue.trim()) return;
    const service = `custom:${customName.trim()}`;
    await fetch("/account/api/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service, key: customInputValue.trim() }),
    });
    setCustomKeys((prev) => [
      ...prev,
      { name: customName.trim(), value: "", show: false, editing: false, inputValue: "" },
    ]);
    setSavedServices((prev) => [...new Set([...prev, service])]);
    setCustomName("");
    setCustomInputValue("");
  };

  const handleRemoveCustomKey = async (idx: number) => {
    const service = `custom:${customKeys[idx].name}`;
    await fetch("/account/api/api-keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service }),
    });
    setCustomKeys((prev) => prev.filter((_, i) => i !== idx));
    setSavedServices((prev) => prev.filter((s) => s !== service));
  };

  const handleEditCustomKey = (idx: number) => {
    setCustomKeys((prev) => prev.map((item, i) => i === idx ? { ...item, editing: true, inputValue: "" } : { ...item, editing: false }));
  };

  const handleSaveCustomKey = async (idx: number) => {
    const service = `custom:${customKeys[idx].name}`;
    const key = customKeys[idx].inputValue;
    if (!key) return;
    await fetch("/account/api/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service, key }),
    });
    setCustomKeys((prev) => prev.map((item, i) => i === idx ? { ...item, value: "", editing: false, inputValue: "" } : item));
    setSavedServices((prev) => [...new Set([...prev, service])]);
  };

  const handleCustomInputChange = (idx: number, value: string) => {
    setCustomKeys((prev) => prev.map((item, i) => i === idx ? { ...item, inputValue: value } : item));
  };

  const handleShowCustomKey = (idx: number) => {
    setCustomKeys((prev) => prev.map((item, i) => i === idx ? { ...item, show: !item.show } : item));
  };

  const handleCancelCustomEdit = (idx: number) => {
    setCustomKeys((prev) => prev.map((item, i) => i === idx ? { ...item, editing: false, inputValue: "" } : item));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch("/account/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.status === 204) {
        setPwSuccess("Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json().catch(() => ({}));
        setPwError(data.error || "Failed to update password.");
      }
    } catch (err) {
      setPwError("Failed to update password. Please try again.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    if (!firstName || !lastName) {
      setProfileError("First and last name are required.");
      return;
    }
    setProfileSaving(true);
    try {
      const res = await fetch("/account/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName }),
      });
      if (res.status === 204) {
        setProfileSuccess("Profile updated successfully.");
      } else {
        setProfileError("Failed to update profile.");
      }
    } catch {
      setProfileError("Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleDeleteAllChats = async () => {
    setIsDeletingAllChats(true);
    try {
      const res = await fetch("/api/chat/delete-all", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success("All chats deleted successfully!");
        // Optionally redirect or refresh history if needed
      } else {
        toast.error("Failed to delete all chats.");
      }
    } catch (error) {
      console.error("Error deleting all chats:", error);
      toast.error("An error occurred while deleting chats.");
    } finally {
      setIsDeletingAllChats(false);
      setShowDeleteAllChatsDialog(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold text-foreground">Account Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[240px,1fr] gap-6">
        {/* Sidebar */}
        <aside className="bg-background border border-border rounded-lg p-2 md:p-3 h-fit">
          <nav className="grid grid-cols-3 gap-2 md:block md:space-y-1">
            {[
              { id: "profile", label: "Profile", Icon: User },
              { id: "security", label: "Security", Icon: Shield },
              { id: "integrations", label: "Integrations", Icon: Plug },
              { id: "api-keys", label: "API Keys", Icon: Key },
              { id: "appearance", label: "Appearance", Icon: Sun },
              { id: "customize", label: "Customize", Icon: Monitor },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id as typeof activeSection)}
                className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-sm transition border ${
                  activeSection === id
                    ? "bg-muted text-foreground border-border"
                    : "bg-background text-foreground/80 border-transparent hover:bg-muted/60"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="size-4" />
                  {label}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="bg-background rounded-lg border border-border p-4 md:p-6">
          {activeSection === "profile" && (
            <>
            <h2 className="text-xl font-semibold mb-4 text-foreground">Profile Information</h2>
            <form className="space-y-6" onSubmit={handleProfileSubmit}>
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  <AvatarImage src="/logo/avatar.svg" alt="Profile" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="profile-picture" className="text-foreground">Profile Picture</Label>
                  <Input id="profile-picture" type="file" className="mt-1 bg-background text-foreground border-border" disabled />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input name="firstName" type="text" placeholder="First Name" className="bg-background text-foreground border-border" value={firstName} onChange={e => setFirstName(e.target.value)} disabled={profileLoading || profileSaving} />
                <Input name="lastName" type="text" placeholder="Last Name" className="bg-background text-foreground border-border" value={lastName} onChange={e => setLastName(e.target.value)} disabled={profileLoading || profileSaving} />
              </div>
              <Input name="email" type="email" placeholder="Email" className="bg-background text-foreground border-border" value={email} disabled />
              {/* Optionally remove phone field or make it static */}
              {/* <Input name="phone" type="tel" placeholder="Phone Number" className="bg-background text-foreground border-border" disabled /> */}
              {profileError && <div className="text-red-500 text-sm">{profileError}</div>}
              {profileSuccess && <div className="text-green-600 text-sm">{profileSuccess}</div>}
              <Button type="submit" className="w-full" disabled={profileLoading || profileSaving}>{profileSaving ? "Saving..." : "Save Changes"}</Button>
            </form>
            </>
          )}

          {activeSection === "security" && (
            <>
            <h2 className="text-xl font-semibold mb-4 text-foreground">Password & Security</h2>
            <form className="space-y-4 mb-8" onSubmit={handlePasswordChange}>
              <Label htmlFor="current-password" className="text-foreground">Current Password</Label>
              <Input id="current-password" name="current-password" type="password" placeholder="Current Password" className="bg-background text-foreground border-border" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} autoComplete="current-password" />
              <Label htmlFor="new-password" className="text-foreground">New Password</Label>
              <Input id="new-password" name="new-password" type="password" placeholder="New Password" className="bg-background text-foreground border-border" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" />
              <Label htmlFor="confirm-password" className="text-foreground">Confirm New Password</Label>
              <Input id="confirm-password" name="confirm-password" type="password" placeholder="Confirm New Password" className="bg-background text-foreground border-border" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" />
              {pwError && <div className="text-red-500 text-sm">{pwError}</div>}
              {pwSuccess && <div className="text-green-600 text-sm">{pwSuccess}</div>}
              <Button type="submit" className="w-full" disabled={pwLoading}>{pwLoading ? "Updating..." : "Update Password"}</Button>
            </form>
            <Separator className="my-6" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
              <div>
                <h3 className="font-semibold text-foreground">Delete All Chats</h3>
                <p className="text-sm text-foreground/70">Permanently delete all your saved chats.</p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteAllChatsDialog(true)}
                disabled={isDeletingAllChats}
              >
                {isDeletingAllChats ? "Deleting..." : "Delete All"}
              </Button>
            </div>
            <Separator className="my-6" />
            </>
          )}

          <AlertDialog open={showDeleteAllChatsDialog} onOpenChange={setShowDeleteAllChatsDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete ALL your chats and remove them from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAllChats} disabled={isDeletingAllChats}>
                  {isDeletingAllChats ? "Deleting..." : "Continue"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {activeSection === "integrations" && (
            <>
            <h2 className="text-xl font-semibold mb-4 text-foreground">Connected Accounts</h2>
            <div className="space-y-4 mb-8">
              {oauthLoading ? (
                <div className="text-center text-muted-foreground">Loading integrations...</div>
              ) : (
                oauthProviders.map((provider) => {
                  const isConnected = oauthConnections.some(
                    (conn) => conn.service === provider.service
                  );
                  const connectedAs = oauthConnections.find(
                    (conn) => conn.service === provider.service
                  )?.externalUserName;

                  return (
                    <div
                      key={provider.service}
                      className="flex items-center justify-between p-3 rounded bg-background border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={provider.icon}
                          alt={provider.name}
                          width={24}
                          height={24}
                          className="size-6"
                        />
                        <span className="text-foreground">{provider.name}</span>
                        {isConnected && connectedAs && (
                          <span className="text-xs text-muted-foreground">
                            (Connected as: {connectedAs})
                          </span>
                        )}
                      </div>
                      {isConnected ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDisconnectOAuth(provider.service)}
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() =>
                            router.push(`/api/oauth/${provider.service}/initiate`)
                          }
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <Separator className="my-6" />
            <h3 className="font-semibold mb-4 text-foreground">Scopes & Permissions</h3>
            <div className="space-y-2 text-sm text-foreground/70">
              <div>Review and adjust what each integration can access.</div>
              <ul className="list-disc ml-6">
                <li>Google: Profile, Email, Calendar</li>
                <li>GitHub: Repos, Issues, Pull Requests</li>
                <li>Slack: Channels, Messages</li>
                <li>X: Post and engage with tweets, access profile information and settings</li>
                <li>ClickUp: Tasks, Spaces</li>
                <li>Cal.com: Bookings, Events</li>
                {/* Add more as needed */}
              </ul>
            </div>
            </>
          )}

          {activeSection === "appearance" && (
            <>
              <h2 className="text-xl font-semibold mb-4 text-foreground">Appearance</h2>
              <p className="text-sm text-foreground/70 mb-4">Choose your theme. This updates instantly and respects system preferences when set to System.</p>
              <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-md">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 rounded-md border p-2 sm:p-3 text-xs sm:text-sm transition ${
                    (theme === "light" || resolvedTheme === "light") && theme !== "system" ? "border-primary bg-muted" : "border-border hover:bg-muted/60"
                  }`}
                  aria-pressed={theme === "light"}
                >
                  <Sun className="size-3 sm:size-4" /> Light
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 rounded-md border p-2 sm:p-3 text-xs sm:text-sm transition ${
                    (theme === "dark" || resolvedTheme === "dark") && theme !== "system" ? "border-primary bg-muted" : "border-border hover:bg-muted/60"
                  }`}
                  aria-pressed={theme === "dark"}
                >
                  <Moon className="size-3 sm:size-4" /> Dark
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 rounded-md border p-2 sm:p-3 text-xs sm:text-sm transition ${
                    theme === "system" ? "border-primary bg-muted" : "border-border hover:bg-muted/60"
                  }`}
                  aria-pressed={theme === "system"}
                >
                  <Monitor className="size-3 sm:size-4" /> System
                </button>
              </div>
              <div className="mt-3 text-xs text-foreground/60">Current: {theme} {theme === "system" ? `(resolved: ${resolvedTheme})` : ""}</div>
            </>
          )}

          {activeSection === "customize" && (
            <>
              <h2 className="text-xl font-semibold mb-2 text-foreground">Customize Agent Behavior</h2>
              <p className="text-sm text-foreground/70 mb-4">Set a persistent instruction to guide the agent’s tone and behavior. This will be prepended to your chat prompts automatically.</p>
              <div className="space-y-4">
                {/* Presets grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setCustomInstruction(preset.value)}
                      className={`text-left rounded-md border p-2 sm:p-3 transition group ${
                        (preset.value ? customInstruction.trim() === preset.value.trim() : customInstruction.trim().length === 0)
                          ? 'border-primary bg-muted'
                          : 'border-border hover:bg-muted/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-foreground text-xs sm:text-sm">{preset.title}</div>
                        {((preset.value ? customInstruction.trim() === preset.value.trim() : customInstruction.trim().length === 0)) && (
                          <Check className="size-3 sm:size-4 text-primary" />
                        )}
                      </div>
                      <div className="text-[10px] sm:text-xs text-foreground/70 mt-1">{preset.description}</div>
                    </button>
                  ))}
                </div>

                <label className="text-sm font-medium text-foreground" htmlFor="custom-instruction">Custom Instructions</label>
                <textarea
                  id="custom-instruction"
                  className="w-full min-h-[120px] sm:min-h-[140px] rounded-xl border border-border bg-background p-2.5 sm:p-3 text-sm"
                  placeholder="e.g., Respond concisely with bullet points, always include exact commands; avoid placeholders."
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button className="h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-sm" type="button" onClick={saveCustomInstruction}>Save</Button>
                  <Button className="h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-sm" type="button" variant="outline" onClick={clearCustomInstruction}>Clear</Button>
                </div>
                <div className="text-xs text-foreground/60">Tip: You can tailor tone (formal, concise, socratic) or behavior (always provide code with tests, use HTML email format by default). Images shown above are good inspiration for your style.</div>
              </div>
            </>
          )}

          {activeSection === "api-keys" && (
            <>
            <h2 className="text-xl font-semibold mb-4 text-foreground">API Keys</h2>
            <p className="text-sm text-foreground/70 mb-6">Store your API keys for each tool here. These keys are used to connect your account to external services. <span className="font-medium text-foreground">We do not generate API keys for you. Please obtain them from the respective service providers.</span></p>
            {(() => {
              const grouped = Object.entries(
                apiTools.reduce<Record<string, Array<typeof apiTools[number]>>>(
                  (acc, tool) => {
                    const groupKey = (tool.name.split(" ")[0] || tool.name).replace(/\.$/, "");
                    if (!acc[groupKey]) acc[groupKey] = [];
                    acc[groupKey].push(tool);
                    return acc;
                  },
                  {}
                )
              );
              return (
                <div className="space-y-4">
                  {grouped.map(([groupName, tools]) => (
                    <div key={groupName} className="p-4 rounded bg-background border border-border">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="font-semibold text-foreground">{groupName}</h4>
                      </div>
                      <div className="space-y-3">
                        {tools.map((tool) => (
                          <div key={tool.keyName} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <div className="flex-1">
                              <Label htmlFor={tool.keyName} className="text-foreground">{tool.name}</Label>
                              <Input
                                id={tool.keyName}
                                type={showKey[tool.keyName] ? "text" : "password"}
                                placeholder={tool.placeholder}
                                value={inputValues[tool.keyName]}
                                onChange={(e) => handleInputChange(tool.keyName, e.target.value)}
                                autoComplete="off"
                                className="mt-1 bg-background text-foreground border-border w-full"
                              />
                            </div>
                            <div className="flex gap-2 md:mt-5">
                              {savedServices.includes(tool.name) && (
                                <Button size="icon" variant="destructive" onClick={() => handleRemove(tool.name, tool.keyName)} type="button" aria-label="Remove API key">
                                  <Trash size={16} />
                                </Button>
                              )}
                              {!savedServices.includes(tool.name) && inputValues[tool.keyName] && (
                                <Button size="icon" variant="default" onClick={() => handleSave(tool.keyName, tool.name)} type="button" aria-label="Add API key">
                                  <Plus size={16} />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
            {/* Custom API Key Section */}
            <Separator className="my-8" />
            <h3 className="font-semibold mb-4 text-foreground">Add Custom API Key</h3>
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
              <Input
                type="text"
                placeholder="Custom Key Name (e.g. MyService)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="flex-1 bg-background text-foreground border-border w-full"
                autoComplete="off"
              />
              <Input
                type="password"
                placeholder="API Key Value"
                value={customInputValue}
                onChange={(e) => setCustomInputValue(e.target.value)}
                className="flex-1 bg-background text-foreground border-border w-full"
                autoComplete="off"
              />
              <Button size="icon" variant="default" onClick={handleAddCustomKey} type="button" aria-label="Add custom key">
                <Plus size={16} />
              </Button>
            </div>
            <div className="space-y-4">
              {customKeys.map((item, idx) => (
                <div key={idx} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 rounded bg-background border border-border">
                  <div className="flex-1">
                    <Label className="font-medium text-foreground">{item.name}</Label>
                    <div className="flex gap-2 items-center mt-1">
                      {item.editing ? (
                        <Input
                          type={item.show ? "text" : "password"}
                          value={item.inputValue}
                          onChange={(e) => handleCustomInputChange(idx, e.target.value)}
                          className="flex-1 bg-background text-foreground border-border w-full"
                          autoComplete="off"
                        />
                      ) : (
                        <Input
                          type={item.show ? "text" : "password"}
                          value={item.value}
                          readOnly
                          className="flex-1 bg-background text-foreground border-border w-full"
                          autoComplete="off"
                        />
                      )}
                      <Button size="sm" variant="outline" type="button" onClick={() => handleShowCustomKey(idx)}>
                        {item.show ? "Hide" : "Show"}
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    {item.editing ? (
                      <>
                        <Button size="sm" variant="default" onClick={() => handleSaveCustomKey(idx)} type="button">Save</Button>
                        <Button size="sm" variant="outline" onClick={() => handleCancelCustomEdit(idx)} type="button">Cancel</Button>
                      </>
                    ) : (
                      <>
                      <Button size="sm" variant="secondary" onClick={() => handleEditCustomKey(idx)} type="button">Edit</Button>
                      <Button size="icon" variant="destructive" onClick={() => handleRemoveCustomKey(idx)} type="button" aria-label="Remove custom key">
                        <Trash size={16} />
                      </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}