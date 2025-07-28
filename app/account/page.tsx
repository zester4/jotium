
"use client";

import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// List of tools that require API keys (from /ai/tools)
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
];

export default function AccountPage() {
  const router = useRouter();
  // Which services have a key saved (from backend)
  const [savedServices, setSavedServices] = useState<string[]>([]);
  // Input values for adding/updating
  const [inputValues, setInputValues] = useState(() => Object.fromEntries(apiTools.map((tool) => [tool.keyName, ""])));
  const [showKey, setShowKey] = useState(() => Object.fromEntries(apiTools.map((tool) => [tool.keyName, false])));
  // Custom keys
  const [customKeys, setCustomKeys] = useState<{ name: string; value: string; show: boolean; editing: boolean; inputValue: string }[]>([]);
  const [customName, setCustomName] = useState("");
  const [customInputValue, setCustomInputValue] = useState("");

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

  return (
    <div className="max-w-2xl mx-auto pt-20 pb-16 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <Button
        variant="outline"
        size="sm"
        className="mb-4 flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>
      <h1 className="text-3xl font-bold text-center mb-8 text-foreground">Account Settings</h1>
      <div className="bg-background rounded-xl shadow p-6 border border-border">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full flex flex-wrap justify-center md:justify-between mb-6 bg-background border border-border rounded-lg overflow-hidden p-1">
            <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
            <TabsTrigger value="security" className="flex-1">Security</TabsTrigger>
            <TabsTrigger value="integrations" className="flex-1">Integrations</TabsTrigger>
            <TabsTrigger value="api-keys" className="flex-1">API Keys</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="overflow-x-hidden">
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
              <div className="flex gap-2">
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
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="overflow-x-hidden">
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">Two-Factor Authentication (2FA)</h3>
                <p className="text-sm text-foreground/70">Add an extra layer of security to your account.</p>
              </div>
              <Switch id="2fa-toggle" />
            </div>
            {/* Placeholder for 2FA setup flow (e.g., QR code) */}
            <div className="bg-background rounded p-4 text-center text-foreground/70 text-sm mb-6 border border-border">
              2FA setup flow will appear here when enabled.
            </div>
            <Separator className="my-6" />
            <h3 className="font-semibold mb-2 text-foreground">Recent Logins</h3>
            <ul className="text-sm text-foreground/70 space-y-2">
              <li>Chrome on Windows · New York, USA · 2 hours ago</li>
              <li>Safari on iPhone · San Francisco, USA · Yesterday</li>
              <li>Firefox on Mac · London, UK · 3 days ago</li>
            </ul>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="overflow-x-hidden">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Connected Accounts</h2>
            <div className="space-y-4 mb-8">
              {/* Example connected accounts */}
              <div className="flex items-center justify-between p-3 rounded bg-background border border-border">
                <div className="flex items-center gap-3">
                  <Image src="/logo/google.svg" alt="Google" width={24} height={24} className="size-6" />
                  <span className="text-foreground">Google</span>
                </div>
                <Button size="sm" variant="secondary">Disconnect</Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded bg-background border border-border">
                <div className="flex items-center gap-3">
                  <Image src="/logo/asana.svg" alt="Asana" width={24} height={24} className="size-6" />
                  <span className="text-foreground">Asana</span>
                </div>
                <Button size="sm">Connect</Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded bg-background border border-border">
                <div className="flex items-center gap-3">
                  <Image src="/logo/github.svg" alt="GitHub" width={24} height={24} className="size-6" />
                  <span className="text-foreground">GitHub</span>
                </div>
                <Button size="sm">Connect</Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded bg-background border border-border">
                <div className="flex items-center gap-3">
                  <Image src="/logo/slack.svg" alt="Slack" width={24} height={24} className="size-6" />
                  <span className="text-foreground">Slack</span>
                </div>
                <Button size="sm">Connect</Button>
              </div>
              {/* Add more as needed */}
            </div>
            <Separator className="my-6" />
            <h3 className="font-semibold mb-4 text-foreground">Scopes & Permissions</h3>
            <div className="space-y-2 text-sm text-foreground/70">
              <div>Review and adjust what each integration can access. (Coming soon)</div>
              <ul className="list-disc ml-6">
                <li>Google: Profile, Email, Calendar</li>
                <li>GitHub: Repos, Issues, Pull Requests</li>
                <li>Slack: Channels, Messages</li>
                <li>ClickUp: Tasks, Spaces</li>
                <li>Cal.com: Bookings, Events</li>
                {/* Add more as needed */}
              </ul>
            </div>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api-keys" className="overflow-x-hidden">
            <h2 className="text-xl font-semibold mb-4 text-foreground">API Keys</h2>
            <p className="text-sm text-foreground/70 mb-6">Store your API keys for each tool here. These keys are used to connect your account to external services. <span className="font-medium text-foreground">We do not generate API keys for you. Please obtain them from the respective service providers.</span></p>
            <div className="space-y-6">
              {apiTools.map((tool) => (
                <div key={tool.keyName} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 rounded bg-background border border-border">
                  <div className="flex-1">
                    <Label htmlFor={tool.keyName} className="font-medium text-foreground">{tool.name} API Key</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id={tool.keyName}
                        type={showKey[tool.keyName] ? "text" : "password"}
                        placeholder={tool.placeholder}
                        value={inputValues[tool.keyName]}
                        onChange={(e) => handleInputChange(tool.keyName, e.target.value)}
                        autoComplete="off"
                        className="mt-1 bg-background text-foreground border-border w-full"
                      />
                      {/* Only one Eye/EyeOff icon button per input */}
                      <Button size="icon" variant="ghost" type="button" onClick={() => handleShowToggle(tool.keyName)} aria-label={showKey[tool.keyName] ? "Hide key" : "Show key"} className="mt-1">
                        {showKey[tool.keyName] ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    {savedServices.includes(tool.name) && (
                      <Button size="sm" variant="destructive" onClick={() => handleRemove(tool.name, tool.keyName)} type="button">Remove</Button>
                    )}
                    {!savedServices.includes(tool.name) && inputValues[tool.keyName] && (
                      <Button size="sm" variant="default" onClick={() => handleSave(tool.keyName, tool.name)} type="button">Add</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
              <Button size="sm" variant="default" onClick={handleAddCustomKey} type="button">Add</Button>
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
                        <Button size="sm" variant="destructive" onClick={() => handleRemoveCustomKey(idx)} type="button">Remove</Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
