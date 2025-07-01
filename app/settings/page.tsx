"use client";

import { useUser } from "../landing/UserContext";
import { useState, useEffect } from "react";
import clsx from "clsx";
import Header from "../components/Header";

// Tab definitions
const TABS = [
  { key: "profile", label: "Account" },
  { key: "preferences", label: "Preferences" },
  { key: "payment", label: "Payment" },
];

// Notification keys type
type NotificationKey =
  | "eventInvitations"
  | "eventReminders"
  | "eventBlasts"
  | "eventUpdates"
  | "feedbackRequests"
  | "guestRegistrations"
  | "feedbackResponses"
  | "newMembers"
  | "eventSubmissions"
  | "productUpdates";

// Notification options
const notificationOptions: {
  key: NotificationKey;
  label: string;
  options: string[];
}[] = [
  { key: "eventInvitations", label: "Event Invitations", options: ["off", "email", "whatsapp"] },
  { key: "eventReminders", label: "Event Reminders", options: ["off", "email", "whatsapp"] },
  { key: "eventBlasts", label: "Event Blasts", options: ["off", "email", "whatsapp"] },
  { key: "eventUpdates", label: "Event Updates", options: ["off", "email"] },
  { key: "feedbackRequests", label: "Feedback Requests", options: ["off", "email"] },
//   { key Hogan: guestRegistrations", label: "Guest Registrations", options: ["off", "email"] },
  { key: "feedbackResponses", label: "Feedback Responses", options: ["off", "email"] },
  { key: "newMembers", label: "New Members", options: ["off", "email"] },
  { key: "eventSubmissions", label: "Event Submissions", options: ["off", "email"] },
  { key: "productUpdates", label: "Product Updates", options: ["off", "email"] },
];

// Device type
type Device = {
  id: string;
  name: string;
  location: string;
  current: boolean;
  lastActive: string;
};

export default function SettingsPage() {
  const { user, login, logout } = useUser();
  const [tab, setTab] = useState("profile");
  const [form, setForm] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ")[1] || "",
    username: user?.username || user?.email?.split("@")[0] || "",
    bio: user?.bio || "",
    instagram: user?.instagram || "",
    twitter: user?.twitter || "",
    youtube: user?.youtube || "",
    tiktok: user?.tiktok || "",
    linkedin: user?.linkedin || "",
    website: user?.website || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    user?.avatarUrl || "/avatar-placeholder.png"
  );
  const [emails, setEmails] = useState(
    user?.emails?.length
      ? user.emails
      : [{ address: user?.email || "", primary: true, verified: true }]
  );
  const [newEmail, setNewEmail] = useState("");
  const [verifyingEmail, setVerifyingEmail] = useState<string | null>(null);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [mobile, setMobile] = useState(form.mobile || "");
  const [verifyingMobile, setVerifyingMobile] = useState(false);
  const [showMobileOtpDialog, setShowMobileOtpDialog] = useState(false);
  const [mobileOtp, setMobileOtp] = useState("");
  const [mobileOtpError, setMobileOtpError] = useState<string | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("en-uk");

  const [notifications, setNotifications] = useState<Record<NotificationKey, string>>({
    eventInvitations: "email,whatsapp",
    eventReminders: "email,whatsapp",
    eventBlasts: "email,whatsapp",
    eventUpdates: "email",
    feedbackRequests: "email",
    guestRegistrations: "off",
    feedbackResponses: "email",
    newMembers: "email",
    eventSubmissions: "email",
    productUpdates: "email",
  });

  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    if (theme === "system") {
      document.body.classList.remove("theme-light", "theme-dark");
    } else {
      document.body.classList.remove("theme-light", "theme-dark");
      document.body.classList.add(`theme-${theme}`);
    }
    localStorage.setItem("suilens-theme", theme);
  }, [theme]);

  const handleVerifyEmail = async (email: string) => {
    setVerifyingEmail(email);
    setOtp("");
    setOtpError(null);
    setShowOtpDialog(true);
    // await api.sendVerificationEmail(email);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    try {
      // await api.verifyEmailOtp(verifyingEmail, otp);
      setEmails((emails) =>
        emails.map((e) =>
          e.address === verifyingEmail ? { ...e, verified: true } : e
        )
      );
      setShowOtpDialog(false);
      setVerifyingEmail(null);
      setOtp("");
    } catch (err) {
      setOtpError("Invalid code. Please try again.");
    }
  };

  const handleSendMobileOtp = async () => {
    setVerifyingMobile(true);
    setShowMobileOtpDialog(true);
    // await api.sendMobileOtp(mobile);
    setVerifyingMobile(false);
  };

  const handleMobileOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMobileOtpError(null);
    try {
      // await api.verifyMobileOtp(mobile, mobileOtp);
      setShowMobileOtpDialog(false);
    } catch (err) {
      setMobileOtpError("Invalid code. Please try again.");
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      ...user!,
      name: `${form.firstName} ${form.lastName}`.trim(),
      username: form.username,
      avatarUrl: avatarPreview,
      bio: form.bio,
      instagram: form.instagram,
      twitter: form.twitter,
      youtube: form.youtube,
      tiktok: form.tiktok,
      linkedin: form.linkedin,
      website: form.website,
      emails,
      email: emails.find((e) => e.primary)?.address || "",
      mobile: form.mobile,
    });
    alert("Changes saved!");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const isLight =
    theme === "light" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: light)").matches);

  return (
    <div
      className={clsx(
        "min-h-screen",
        isLight ? "bg-white text-gray-900" : "bg-[#18151f] text-white"
      )}
    >
      <Header />
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1
          className={clsx(
            "text-2xl font-bold mb-6",
            isLight ? "text-gray-900" : "text-white"
          )}
        >
          Settings
        </h1>
        {/* Tabs */}
        <div
          className={clsx(
            "flex space-x-2 mb-8 border-b",
            isLight ? "border-gray-200" : "border-white/10"
          )}
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={clsx(
                "px-4 py-2 font-medium transition-colors border-b-2",
                tab === t.key
                  ? isLight
                    ? "border-blue-600 text-blue-600"
                    : "border-blue-500 text-blue-400"
                  : isLight
                  ? "border-transparent text-gray-500 hover:text-gray-900"
                  : "border-transparent text-white/60 hover:text-white"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === "profile" && (
          <form onSubmit={handleSave} className="space-y-8">
            {/* Your Profile */}
            <div
              className={clsx(
                "rounded-xl p-6 space-y-4 shadow-lg",
                isLight ? "bg-white" : "bg-[#23202b]"
              )}
            >
              <h2
                className={clsx(
                  "font-semibold text-lg mb-2",
                  isLight ? "text-gray-900" : "text-white"
                )}
              >
                Your Profile
              </h2>
              <p
                className={clsx(
                  "text-sm mb-4",
                  isLight ? "text-gray-600" : "text-white/70"
                )}
              >
                Choose how you are displayed as a host or guest.
              </p>
              <div className="flex items-center space-x-4">
                <img
                  src={avatarPreview}
                  alt="Profile Picture"
                  className="w-16 h-16 rounded-full border border-white/20 object-cover"
                />
                <div>
                  <label
                    className={clsx(
                      "block text-sm mb-1",
                      isLight ? "text-gray-600" : "text-white/70"
                    )}
                  >
                    Profile Picture
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="block text-xs text-gray-900"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label
                    className={clsx("block text-sm", isLight ? "text-gray-600" : "text-white/70")}
                  >
                    First Name
                  </label>
                  <input
                    className={clsx(
                      "w-full rounded-lg px-3 py-2 border",
                      isLight
                        ? "bg-white text-gray-900 border-gray-300"
                        : "bg-[#18151f] text-white border-white/10"
                    )}
                    value={form.firstName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, firstName: e.target.value }))
                    }
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <label
                    className={clsx("block text-sm", isLight ? "text-gray-600" : "text-white/70")}
                  >
                    Last Name
                  </label>
                  <input
                    className={clsx(
                      "w-full rounded-lg px-3 py-2 border",
                      isLight
                        ? "bg-white text-gray-900 border-gray-300"
                        : "bg-[#18151f] text-white border-white/10"
                    )}
                    value={form.lastName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lastName: e.target.value }))
                    }
                    placeholder="Last Name"
                  />
                </div>
                <div>
                  <label
                    className={clsx("block text-sm", isLight ? "text-gray-600" : "text-white/70")}
                  >
                    Username
                  </label>
                  <div className="flex items-center">
                    <span className={clsx(isLight ? "text-gray-400" : "text-white/40", "mr-1")}>
                      @
                    </span>
                    <input
                      className={clsx(
                        "w-full rounded-lg px-3 py-2 border",
                        isLight
                          ? "bg-white text-gray-900 border-gray-300"
                          : "bg-[#18151f] text-white border-white/10"
                      )}
                      value={form.username}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, username: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label
                    className={clsx("block text-sm", isLight ? "text-gray-600" : "text-white/70")}
                  >
                    Bio
                  </label>
                  <input
                    className={clsx(
                      "w-full rounded-lg px-3 py-2 border",
                      isLight
                        ? "bg-white text-gray-900 border-gray-300"
                        : "bg-[#18151f] text-white border-white/10"
                    )}
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder="Share a little about your background and interests."
                  />
                </div>
              </div>
              {/* Social Links */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label
                    className={clsx("block text-sm", isLight ? "text-gray-600" : "text-white/70")}
                  >
                    instagram.com/
                  </label>
                  <input
                    className={clsx(
                      "w-full rounded-lg px-3 py-2 border",
                      isLight
                        ? "bg-white text-gray-900 border-gray-300"
                        : "bg-[#18151f] text-white border-white/10"
                    )}
                    value={form.instagram}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, instagram: e.target.value }))
                    }
                    placeholder="username"
                  />
                </div>
                <div>
                  <label
                    className={clsx("block text-sm", isLight ? "text-gray-600" : "text-white/70")}
                  >
                    x.com/
                  </label>
                  <input
                    className={clsx(
                      "w-full rounded-lg px-3 py-2 border",
                      isLight
                        ? "bg-white text-gray-900 border-gray-300"
                        : "bg-[#18151f] text-white border-white/10"
                    )}
                    value={form.twitter}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, twitter: e.target.value }))
                    }
                    placeholder="username"
                  />
                </div>
                <div>
                  <label
                    className={clsx("block text-sm", isLight ? "text-gray-600" : "text-white/70")}
                  >
                    youtube.com/@
                  </label>
                  <input
                    className={clsx(
                      "w-full rounded-lg px-3 py-2 border",
                      isLight
                        ? "bg-white text-gray-900 border-gray-300"
                        : "bg-[#18151f] text-white border-white/10"
                    )}
                    value={form.youtube}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, youtube: e.target.value }))
                    }
                    placeholder="username"
                  />
                </div>
                <div>
                  <label
                    className={clsx("block text-sm", isLight ? "text-gray-600" : "text-white/70")}
                  >
                    tiktok.com/@
                  </label>
                  <input
                    className={clsx(
                      "w-full rounded-lg px-3 py-2 border",
                      isLight
                        ? "bg-white text-gray-900 border-gray-300"
                        : "bg-[#18151f] text-white border-white/10"
                    )}
                    value={form.tiktok}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, tiktok: e.target.value }))
                    }
                    placeholder="username"
                  />
                </div>
                <div>
                  <label
                    className={clsx("block text-sm", isLight ? "text-gray-600" : "text-white/70")}
                  >
                    linkedin.com
                  </label>
                  <input
                    className={clsx(
                      "w-full rounded-lg px-3 py-2 border",
                      isLight
                        ? "bg-white text-gray-900 border-gray-300"
                        : "bg-[#18151f] text-white border-white/10"
                    )}
                    value={form.linkedin}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, linkedin: e.target.value }))
                    }
                    placeholder="/in/your-linkedin"
                  />
                </div>
                <div>
                  <label
                    className={clsx("block text-sm", isLight ? "text-gray-600" : "text-white/70")}
                  >
                    Your website
                  </label>
                  <input
                    className={clsx(
                      "w-full rounded-lg px-3 py-2 border",
                      isLight
                        ? "bg-white text-gray-900 border-gray-300"
                        : "bg-[#18151f] text-white border-white/10"
                    )}
                    value={form.website}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, website: e.target.value }))
                    }
                    placeholder="yourwebsite.com"
                  />
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>

            {/* Emails */}
            <div
              className={clsx(
                "rounded-xl p-6 space-y-4 shadow-lg",
                isLight ? "bg-white" : "bg-[#23202b]"
              )}
            >
              <h2
                className={clsx("font-semibold text-lg mb-2", isLight ? "text-gray-900" : "text-white")}
              >
                Emails
              </h2>
              <div className="space-y-2">
                {emails.map((email, idx) => (
                  <div key={email.address} className="flex items-center justify-between">
                    <div>
                      <span className={clsx(isLight ? "text-gray-900" : "text-white")}>
                        {email.address}
                      </span>
                      {email.primary && (
                        <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                          Primary
                        </span>
                      )}
                      {email.verified ? (
                        <span className="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                          Verified
                        </span>
                      ) : (
                        <span className="ml-2 text-xs bg-yellow-600 text-white px-2 py-0.5 rounded">
                          Unverified
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!email.primary && (
                        <button
                          type="button"
                          className="text-xs text-blue-400 hover:underline"
                          onClick={() => {
                            setEmails((emails) =>
                              emails.map((e, i) => ({
                                ...e,
                                primary: i === idx,
                              }))
                            );
                          }}
                        >
                          Set Primary
                        </button>
                      )}
                      {!email.primary && (
                        <button
                          type="button"
                          className="text-xs text-red-400 hover:underline"
                          onClick={() => {
                            setEmails((emails) => emails.filter((_, i) => i !== idx));
                          }}
                        >
                          Remove
                        </button>
                      )}
                      {!email.verified && (
                        <button
                          type="button"
                          className="text-xs text-yellow-400 hover:underline"
                          onClick={() => handleVerifyEmail(email.address)}
                        >
                          Verify
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex mt-4 gap-2">
                <input
                  type="email"
                  className={clsx(
                    "flex-1 rounded-lg px-3 py-2 border",
                    isLight
                      ? "bg-white text-gray-900 border-gray-300"
                      : "bg-[#18151f] text-white border-white/10"
                  )}
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Add another email"
                />
                <button
                  type="button"
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  onClick={() => {
                    if (newEmail && !emails.some((e) => e.address === newEmail)) {
                      setEmails([
                        ...emails,
                        { address: newEmail, primary: false, verified: false },
                      ]);
                      setNewEmail("");
                    }
                  }}
                  disabled={!newEmail || emails.some((e) => e.address === newEmail)}
                >
                  Add
                </button>
              </div>
              <p className={clsx("text-xs mt-1", isLight ? "text-gray-400" : "text-white/40")}>
                Your primary email will be shared with hosts when you register for their events.
              </p>
            </div>

            {/* OTP Dialog */}
            {showOtpDialog && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <form
                  onSubmit={handleOtpSubmit}
                  className="bg-[#23202b] rounded-xl p-8 shadow-xl flex flex-col items-center"
                >
                  <h3 className="text-lg font-semibold mb-2 text-white">Verify Email</h3>
                  <p className="text-white/70 mb-4 text-center">
                    Enter the code sent to <span className="font-mono">{verifyingEmail}</span>
                  </p>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="mb-2 px-4 py-2 rounded bg-[#18151f] border border-white/10 text-white text-center"
                    placeholder="Enter OTP"
                    autoFocus
                  />
                  {otpError && <div className="text-red-400 text-sm mb-2">{otpError}</div>}
                  <div className="flex gap-2 mt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Verify
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      onClick={() => {
                        setShowOtpDialog(false);
                        setVerifyingEmail(null);
                        setOtp("");
                        setOtpError(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Mobile OTP Dialog */}
            {showMobileOtpDialog && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <form
                  onSubmit={handleMobileOtpSubmit}
                  className="bg-[#23202b] rounded-xl p-8 shadow-xl flex flex-col items-center"
                >
                  <h3 className="text-lg font-semibold mb-2 text-white">Verify Mobile</h3>
                  <p className="text-white/70 mb-4 text-center">
                    Enter the code sent to <span className="font-mono">{mobile}</span>
                  </p>
                  <input
                    type="text"
                    value={mobileOtp}
                    onChange={(e) => setMobileOtp(e.target.value)}
                    className="mb-2 px-4 py-2 rounded bg-[#18151f] border border-white/10 text-white text-center"
                    placeholder="Enter OTP"
                    autoFocus
                  />
                  {mobileOtpError && (
                    <div className="text-red-400 text-sm mb-2">{mobileOtpError}</div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Verify
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      onClick={() => {
                        setShowMobileOtpDialog(false);
                        setMobileOtp("");
                        setMobileOtpError(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Mobile Number */}
            <div
              className={clsx(
                "rounded-xl p-6 space-y-4 shadow-lg",
                isLight ? "bg-white" : "bg-[#23202b]"
              )}
            >
              <h2
                className={clsx("font-semibold text-lg mb-2", isLight ? "text-gray-900" : "text-white")}
              >
                Mobile Number
              </h2>
              <p className={clsx("text-sm", isLight ? "text-gray-600" : "text-white/70")}>
                Manage the mobile number you use to sign in to Suilens and receive SMS updates.
              </p>
              <label className={clsx("block text-sm mt-2", isLight ? "text-gray-600" : "text-white/70")}>
                Mobile Number
              </label>
              <input
                className={clsx(
                  "w-full rounded-lg px-3 py-2 border",
                  isLight
                    ? "bg-white text-gray-900 border-gray-300"
                    : "bg-[#18151f] text-white border-white/10"
                )}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+254712345678"
              />
              <button
                type="button"
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm mt-2 hover:bg-blue-700"
                onClick={handleSendMobileOtp}
                disabled={!mobile}
              >
                Update
              </button>
              <p className={clsx("text-xs mt-1", isLight ? "text-gray-400" : "text-white/40")}>
                For your security, we will send you a code to verify any change to your mobile number.
              </p>
            </div>

            {/* Password & Security */}
            <div
              className={clsx(
                "rounded-xl p-6 space-y-4 shadow-lg",
                isLight ? "bg-white" : "bg-[#23202b]"
              )}
            >
              <h2
                className={clsx("font-semibold text-lg mb-2", isLight ? "text-gray-900" : "text-white")}
              >
                Password & Security
              </h2>
              <p className={clsx("text-sm", isLight ? "text-gray-600" : "text-white/70")}>
                Secure your account with password and two-factor authentication.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-8 mt-4">
                <div>
                  <label
                    className={clsx("block text-sm", isLight ? "text-gray-600" : "text-white/70")}
                  >
                    Account Password
                  </label>
                  <p className={clsx("text-xs mb-2", isLight ? "text-gray-400" : "text-white/40")}>
                    Please follow the instructions in the email to finish setting your password.
                  </p>
                  <button
                    type="button"
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                    onClick={async () => {
                      // await api.sendPasswordResetEmail(
                      //   emails.find((e) => e.primary)?.address || user.email
                      // );
                      alert("Check your email. We've sent instructions to set your password.");
                    }}
                  >
                    Set Password
                  </button>
                </div>
                <div>
                  <label
                    className={clsx("block text-sm", isLight ? "text-gray-600" : "text-white/70")}
                  >
                    Two-Factor Authentication
                  </label>
                  <p className={clsx("text-xs mb-2", isLight ? "text-gray-400" : "text-white/40")}>
                    Please set a password before enabling two-factor authentication.
                  </p>
                  <button
                    type="button"
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm opacity-50 cursor-not-allowed"
                    disabled
                  >
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>

            {/* Third Party Accounts */}
            <div
              className={clsx(
                "rounded-xl p-6 space-y-4 shadow-lg",
                isLight ? "bg-white" : "bg-[#23202b]"
              )}
            >
              <h2
                className={clsx("font-semibold text-lg mb-2", isLight ? "text-gray-900" : "text-white")}
              >
                Third Party Accounts
              </h2>
              <p className={clsx("text-sm mb-4", isLight ? "text-gray-600" : "text-white/70")}>
                Link your accounts to sign in to Suilens and automate your workflows.
              </p>
              <div className="flex items-center justify-center min-h-[80px]">
                <span className={clsx("text-base font-semibold", isLight ? "text-gray-500" : "text-white/50")}>
                  Coming soon
                </span>
              </div>
            </div>

            {/* Account Syncing */}
            <div
              className={clsx(
                "rounded-xl p-6 space-y-4 shadow-lg",
                isLight ? "bg-white" : "bg-[#23202b]"
              )}
            >
              <h2
                className={clsx("font-semibold text-lg mb-2", isLight ? "text-gray-900" : "text-white")}
              >
                Account Syncing
              </h2>
              <div className="mb-4">
                <label
                  className={clsx("block text-sm mb-1", isLight ? "text-gray-600" : "text-white/70")}
                >
                  Calendar Syncing
                </label>
                <p className={clsx("text-sm mb-2", isLight ? "text-gray-600" : "text-white/70")}>
                  Sync your Suilens events with your Google, Outlook, or Apple calendar.
                </p>
                <button
                  type="button"
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  onClick={() => setShowCalendarModal(true)}
                >
                  Add Calendar Sync
                </button>
              </div>
              <div>
                <label
                  className={clsx("block text-sm mb-1", isLight ? "text-gray-600" : "text-white/70")}
                >
                  Sync Contacts with Google
                </label>
                <p className={clsx("text-sm mb-2", isLight ? "text-gray-600" : "text-white/70")}>
                  Sync your Gmail contacts to easily invite them to your events.
                </p>
                <button
                  type="button"
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  onClick={() => {
                    window.location.href = "/api/oauth/google-contacts";
                  }}
                >
                  Enable Syncing
                </button>
              </div>
            </div>

            {/* Calendar Sync Modal */}
            {showCalendarModal && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-[#23202b] rounded-xl p-8 shadow-xl w-full max-w-xs flex flex-col items-center">
                  <h3 className="text-lg font-semibold mb-4 text-white">Connect a Calendar</h3>
                  <button
                    className="w-full mb-2 px-4 py-2 bg-[#4285F4] text-white rounded hover:bg-[#357ae8] font-semibold"
                    onClick={() => {
                      setShowCalendarModal(false);
                      // await api.connectGoogleCalendar();
                    }}
                  >
                    Google Calendar
                  </button>
                  <button
                    className="w-full mb-2 px-4 py-2 bg-[#0072C6] text-white rounded hover:bg-[#005fa3] font-semibold"
                    onClick={() => {
                      setShowCalendarModal(false);
                      // await api.connectOutlookCalendar();
                    }}
                  >
                    Outlook Calendar
                  </button>
                  <button
                    className="w-full mb-2 px-4 py-2 bg-[#333] text-white rounded hover:bg-[#222] font-semibold"
                    onClick={() => {
                      setShowCalendarModal(false);
                      // Show iCal URL or instructions for Apple Calendar
                    }}
                  >
                    Apple Calendar (iCal)
                  </button>
                  <button
                    className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    onClick={() => setShowCalendarModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Active Devices */}
            <div
              className={clsx(
                "rounded-xl p-6 space-y-4 shadow-lg",
                isLight ? "bg-white" : "bg-[#23202b]"
              )}
            >
              <h2
                className={clsx("font-semibold text-lg mb-2", isLight ? "text-gray-900" : "text-white")}
              >
                Active Devices
              </h2>
              <p className={clsx("text-sm mb-4", isLight ? "text-gray-600" : "text-white/70")}>
                See the list of devices you are currently signed into Suilens from.
              </p>
              <div className="space-y-2">
                {devices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between">
                    <div>
                      <span className={clsx(isLight ? "text-gray-900" : "text-white")}>
                        {device.name}
                      </span>
                      {device.current && (
                        <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                          This Device
                        </span>
                      )}
                      <div className={clsx("text-xs", isLight ? "text-gray-400" : "text-white/40")}>
                        {device.location}
                      </div>
                    </div>
                    <span className={clsx("text-xs", isLight ? "text-gray-400" : "text-white/40")}>
                      {device.lastActive}
                    </span>
                    {!device.current && (
                      <button
                        type="button"
                        className="ml-4 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                        onClick={async () => {
                          // await api.signOutDevice(device.id);
                          setDevices((devices) => devices.filter((d) => d.id !== device.id));
                        }}
                      >
                        Sign Out
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className={clsx("text-xs mt-2", isLight ? "text-gray-400" : "text-white/40")}>
                See something you don't recognise? You may sign out of all other devices.
              </p>
              <button
                type="button"
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                onClick={async () => {
                  // await api.signOutAllDevices();
                  setDevices((devices) => devices.filter((d) => d.current));
                }}
              >
                Sign out of all other devices
              </button>
            </div>

            {/* Danger Zone */}
            <div
              className={clsx(
                "rounded-xl p-6 space-y-4 shadow-lg border border-red-500/30",
                isLight ? "bg-white" : "bg-[#2d1a1a]"
              )}
            >
              <h2 className="font-semibold text-lg mb-2 text-red-400">Delete Account</h2>
              <p className={clsx("text-sm", isLight ? "text-gray-600" : "text-white/70")}>
                If you no longer wish to use Suilens, you can permanently delete your account.
              </p>
              <button
                type="button"
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                onClick={async () => {
                  if (
                    window.confirm("Are you sure you want to delete your account? This cannot be undone.")
                  ) {
                    // await api.deleteAccount();
                    logout();
                  }
                }}
              >
                Delete My Account
              </button>
            </div>
          </form>
        )}

        {/* Preferences Tab */}
        {tab === "preferences" && (
          <form
            className={clsx(
              "rounded-xl p-6 shadow-lg space-y-8",
              isLight ? "bg-white text-gray-600" : "bg-[#23202b] text-white/70"
            )}
          >
            {/* Display Preferences */}
            <div>
              <h2
                className={clsx("font-semibold text-lg mb-2", isLight ? "text-gray-900" : "text-white")}
              >
                Display
              </h2>
              <label
                className={clsx("block text-sm mb-1", isLight ? "text-gray-600" : "text-white/70")}
              >
                Choose your desired Suilens interface.
              </label>
              <div className="flex gap-4 mt-2">
                {["system", "light", "dark"].map((mode) => (
                  <label
                    key={mode}
                    className="flex items-center gap-2 cursor-pointer scale-110"
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={mode}
                      checked={theme === mode}
                      onChange={() => setTheme(mode)}
                      className="accent-blue-600 scale-125"
                    />
                    <span className="capitalize">{mode}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <h2
                className={clsx("font-semibold text-lg mb-2", isLight ? "text-gray-900" : "text-white")}
              >
                Language
              </h2>
              <select
                className={clsx(
                  "rounded-lg px-3 py-2 border",
                  isLight
                    ? "bg-white text-gray-900 border-gray-300"
                    : "bg-[#18151f] text-white border-white/10"
                )}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en-uk">English (UK)</option>
                {/* Add more languages as needed */}
              </select>
            </div>

            {/* Notifications */}
            <div>
              <h2
                className={clsx("font-semibold text-lg mb-2", isLight ? "text-gray-900" : "text-white")}
              >
                Notifications
              </h2>
              <p className={clsx("mb-2", isLight ? "text-gray-600" : "text-white/70")}>
                Choose how you would like to be notified about updates, invitations, and subscriptions.
              </p>
              <div className="space-y-6">
                {/* Events You Attend */}
                <div>
                  <label
                    className={clsx(
                      "block text-sm font-medium",
                      isLight ? "text-gray-900" : "text-white"
                    )}
                  >
                    Events You Attend
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {notificationOptions.slice(0, 5).map((opt) => (
                      <div
                        key={opt.key}
                        className="flex items-center justify-between py-1"
                      >
                        <span className={clsx(isLight ? "text-gray-900" : "text-white")}>
                          {opt.label}
                        </span>
                        <select
                          className={clsx(
                            "rounded-lg px-2 py-1 border scale-110",
                            isLight
                              ? "bg-white text-gray-900 border-gray-300"
                              : "bg-[#18151f] text-white border-white/10"
                          )}
                          value={notifications[opt.key]}
                          onChange={(e) =>
                            setNotifications((n) => ({ ...n, [opt.key]: e.target.value }))
                          }
                        >
                          {opt.options.map((option) => (
                            <option key={option} value={option}>
                              {option === "off"
                                ? "Off"
                                : option.charAt(0).toUpperCase() + option.slice(1)}
                            </option>
                          ))}
                          {opt.options.includes("whatsapp") && (
                            <option value="email,whatsapp">Email, WhatsApp</option>
                          )}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Events You Host */}
                <div>
                  <label
                    className={clsx(
                      "block text-sm font-medium",
                      isLight ? "text-gray-900" : "text-white"
                    )}
                  >
                    Events You Host
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {notificationOptions.slice(5, 7).map((opt) => (
                      <div
                        key={opt.key}
                        className={clsx(
                          "flex items-center justify-between rounded-lg px-4 py-2",
                          isLight ? "bg-gray-50" : "bg-[#18151f]"
                        )}
                      >
                        <span className={clsx(isLight ? "text-gray-900" : "text-white")}>
                          {opt.label}
                        </span>
                        <select
                          className={clsx(
                            "rounded-lg px-2 py-1 border scale-110",
                            isLight
                              ? "bg-white text-gray-900 border-gray-300"
                              : "bg-[#23202b] text-white border-white/10"
                          )}
                          value={notifications[opt.key]}
                          onChange={(e) =>
                            setNotifications((n) => ({ ...n, [opt.key]: e.target.value }))
                          }
                        >
                          {opt.options.map((option) => (
                            <option key={option} value={option}>
                              {option === "off"
                                ? "Off"
                                : option.charAt(0).toUpperCase() + option.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Calendars You Manage */}
                <div>
                  <label
                    className={clsx(
                      "block text-sm font-medium",
                      isLight ? "text-gray-900" : "text-white"
                    )}
                  >
                    Calendars You Manage
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {notificationOptions.slice(7, 9).map((opt) => (
                      <div
                        key={opt.key}
                        className={clsx(
                          "flex items-center justify-between rounded-lg px-4 py-2",
                          isLight ? "bg-gray-50" : "bg-[#18151f]"
                        )}
                      >
                        <span className={clsx(isLight ? "text-gray-900" : "text-white")}>
                          {opt.label}
                        </span>
                        <select
                          className={clsx(
                            "rounded-lg px-2 py-1 border scale-110",
                            isLight
                              ? "bg-white text-gray-900 border-gray-300"
                              : "bg-[#23202b] text-white border-white/10"
                          )}
                          value={notifications[opt.key]}
                          onChange={(e) =>
                            setNotifications((n) => ({ ...n, [opt.key]: e.target.value }))
                          }
                        >
                          {opt.options.map((option) => (
                            <option key={option} value={option}>
                              {option === "off"
                                ? "Off"
                                : option.charAt(0).toUpperCase() + option.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Suilens */}
                <div>
                  <label
                    className={clsx(
                      "block text-sm font-medium",
                      isLight ? "text-gray-900" : "text-white"
                    )}
                  >
                    Suilens
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {notificationOptions.slice(9, 10).map((opt) => (
                      <div
                        key={opt.key}
                        className={clsx(
                          "flex items-center justify-between rounded-lg px-4 py-2",
                          isLight ? "bg-gray-50" : "bg-[#18151f]"
                        )}
                      >
                        <span className={clsx(isLight ? "text-gray-900" : "text-white")}>
                          {opt.label}
                        </span>
                        <select
                          className={clsx(
                            "rounded-lg px-2 py-1 border scale-110",
                            isLight
                              ? "bg-white text-gray-900 border-gray-300"
                              : "bg-[#23202b] text-white border-white/10"
                          )}
                          value={notifications[opt.key]}
                          onChange={(e) =>
                            setNotifications((n) => ({ ...n, [opt.key]: e.target.value }))
                          }
                        >
                          {opt.options.map((option) => (
                            <option key={option} value={option}>
                              {option === "off"
                                ? "Off"
                                : option.charAt(0).toUpperCase() + option.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Payment Tab */}
        {tab === "payment" && (
          <div
            className={clsx(
              "rounded-xl p-6 shadow-lg",
              isLight ? "bg-white text-gray-600" : "bg-[#23202b] text-white/70"
            )}
          >
            <h2
              className={clsx("font-semibold text-lg mb-2", isLight ? "text-gray-900" : "text-white")}
            >
              Payment
            </h2>
            <p className={clsx("text-sm", isLight ? "text-gray-600" : "text-white/70")}>
              Pay with Slush.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}