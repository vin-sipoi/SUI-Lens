"use client"
import { useUser } from "../landing/UserContext"
import { useState } from "react"
import clsx from "clsx"

const TABS = [
	{ key: "profile", label: "Account" },
	{ key: "preferences", label: "Preferences" },
	{ key: "payment", label: "Payment" },
]

export default function SettingsPage() {
	const { user, login, logout } = useUser()
	const [tab, setTab] = useState("profile")
	const [form, setForm] = useState({
		firstName: user?.name?.split(" ")[0] || "",
		lastName: user?.name?.split(" ")[1] || "",
		username: user?.email?.split("@")[0] || "",
		bio: "",
		instagram: "",
		twitter: "",
		youtube: "",
		tiktok: "",
		linkedin: "",
		website: "",
		email: user?.email || "",
		mobile: "+254 714 296157",
	})
	const [avatar, setAvatar] = useState<File | null>(null)
	const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatarUrl || "/avatar-placeholder.png")

	// Demo: update context on save
	const handleSave = (e: React.FormEvent) => {
		e.preventDefault()
		login({
			...user!,
			name: `${form.firstName} ${form.lastName}`,
			email: form.email,
			avatarUrl: avatarPreview,
		})
		alert("Changes saved (demo only)")
	}

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			setAvatar(file)
			setAvatarPreview(URL.createObjectURL(file))
		}
	}

	return (
		<div className="min-h-screen bg-[#18151f] text-white">
			<div className="max-w-3xl mx-auto py-10 px-4">
				<h1 className="text-2xl font-bold mb-6 text-white">Settings</h1>
				{/* Tabs */}
				<div className="flex space-x-2 mb-8 border-b border-white/10">
					{TABS.map(t => (
						<button
							key={t.key}
							onClick={() => setTab(t.key)}
							className={clsx(
								"px-4 py-2 font-medium transition-colors border-b-2",
								tab === t.key
									? "border-blue-500 text-blue-400"
									: "border-transparent text-white/60 hover:text-white"
							)}
						>
							{t.label}
						</button>
					))}
				</div>

				{/* Tab Content */}
				{tab === "profile" && (
					<form onSubmit={handleSave} className="space-y-8">
						{/* Your Profile */}
						<div className="bg-[#23202b] rounded-xl p-6 space-y-4 shadow-lg">
							<h2 className="font-semibold text-lg mb-2 text-white">Your Profile</h2>
							<p className="text-white/70 text-sm mb-4">
								Choose how you are displayed as a host or guest.
							</p>
							<div className="flex items-center space-x-4">
								<img
									src={avatarPreview}
									alt="Profile Picture"
									className="w-16 h-16 rounded-full border border-white/20 object-cover"
								/>
								<div>
									<label className="block text-sm text-white/70 mb-1">
										Profile Picture
									</label>
									<input
										type="file"
										accept="image/*"
										className="block text-white/60 text-xs"
										onChange={handleAvatarChange}
									/>
									<span className="text-xs text-white/40">
										{avatar ? avatar.name : "No file chosen"}
									</span>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4 mt-4">
								<div>
									<label className="block text-sm text-white/70">First Name</label>
									<input
										className="w-full rounded-lg px-3 py-2 bg-[#18151f] text-white border border-white/10"
										value={form.firstName}
										onChange={e =>
											setForm(f => ({ ...f, firstName: e.target.value }))
										}
										placeholder="Cynthia"
									/>
								</div>
								<div>
									<label className="block text-sm text-white/70">Last Name</label>
									<input
										className="w-full rounded-lg px-3 py-2 bg-[#18151f] text-white border border-white/10"
										value={form.lastName}
										onChange={e =>
											setForm(f => ({ ...f, lastName: e.target.value }))
										}
										placeholder="Muemi"
									/>
								</div>
								<div>
									<label className="block text-sm text-white/70">Username</label>
									<div className="flex items-center">
										<span className="text-white/40 mr-1">@</span>
										<input
											className="w-full rounded-lg px-3 py-2 bg-[#18151f] text-white border border-white/10"
											value={form.username}
											onChange={e =>
												setForm(f => ({ ...f, username: e.target.value }))
											}
										/>
									</div>
								</div>
								<div>
									<label className="block text-sm text-white/70">Bio</label>
									<input
										className="w-full rounded-lg px-3 py-2 bg-[#18151f] text-white border border-white/10"
										value={form.bio}
										onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
										placeholder="Share a little about your background and interests."
									/>
								</div>
							</div>
							{/* Social Links */}
							<div className="grid grid-cols-2 gap-4 mt-4">
								<div>
									<label className="block text-sm text-white/70">
										instagram.com/
									</label>
									<input
										className="w-full rounded-lg px-3 py-2 bg-[#18151f] text-white border border-white/10"
										value={form.instagram}
										onChange={e =>
											setForm(f => ({ ...f, instagram: e.target.value }))
										}
										placeholder="username"
									/>
								</div>
								<div>
									<label className="block text-sm text-white/70">x.com/</label>
									<input
										className="w-full rounded-lg px-3 py-2 bg-[#18151f] text-white border border-white/10"
										value={form.twitter}
										onChange={e =>
											setForm(f => ({ ...f, twitter: e.target.value }))
										}
										placeholder="_skillpulse"
									/>
								</div>
								<div>
									<label className="block text-sm text-white/70">
										youtube.com/@
									</label>
									<input
										className="w-full rounded-lg px-3 py-2 bg-[#18151f] text-white border border-white/10"
										value={form.youtube}
										onChange={e =>
											setForm(f => ({ ...f, youtube: e.target.value }))
										}
										placeholder="username"
									/>
								</div>
								<div>
									<label className="block text-sm text-white/70">tiktok.com/@</label>
									<input
										className="w-full rounded-lg px-3 py-2 bg-[#18151f] text-white border border-white/10"
										value={form.tiktok}
										onChange={e =>
											setForm(f => ({ ...f, tiktok: e.target.value }))
										}
										placeholder="username"
									/>
								</div>
								<div>
									<label className="block text-sm text-white/70">linkedin.com</label>
									<input
										className="w-full rounded-lg px-3 py-2 bg-[#18151f] text-white border border-white/10"
										value={form.linkedin}
										onChange={e =>
											setForm(f => ({ ...f, linkedin: e.target.value }))
										}
										placeholder="/in/cynthia-muemi-0aa22223b"
									/>
								</div>
								<div>
									<label className="block text-sm text-white/70">Your website</label>
									<input
										className="w-full rounded-lg px-3 py-2 bg-[#18151f] text-white border border-white/10"
										value={form.website}
										onChange={e =>
											setForm(f => ({ ...f, website: e.target.value }))
										}
										placeholder="yourwebsite.com"
									/>
								</div>
							</div>
							<div className="mt-6">
								<button
									type="submit"
									className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold"
								>
									Save Changes
								</button>
							</div>
						</div>

						{/* Emails */}
						<div className="bg-[#23202b] rounded-xl p-6 space-y-4 shadow-lg">
							<h2 className="font-semibold text-lg mb-2 text-white">Emails</h2>
							<button
								type="button"
								className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
								disabled
							>
								Add Email
							</button>
							<p className="text-white/70 text-sm mt-2">
								Add additional emails to receive event invitations sent to those addresses.
							</p>
							<div className="mt-2">
								<div className="flex items-center justify-between">
									<span className="text-white">{form.email}</span>
									<span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
										Primary
									</span>
								</div>
								<p className="text-xs text-white/40 mt-1">
									This email will be shared with hosts when you register for their
									events.
								</p>
							</div>
						</div>

						{/* Mobile Number */}
						<div className="bg-[#23202b] rounded-xl p-6 space-y-4 shadow-lg">
							<h2 className="font-semibold text-lg mb-2 text-white">Mobile Number</h2>
							<p className="text-white/70 text-sm">
								Manage the mobile number you use to sign in to Luma and receive SMS updates.
							</p>
							<label className="block text-sm text-white/70 mt-2">
								Mobile Number
							</label>
							<input
								className="w-full rounded-lg px-3 py-2 bg-[#18151f] text-white border border-white/10"
								value={form.mobile}
								onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
								disabled
							/>
							<button
								type="button"
								className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
								disabled
							>
								Update
							</button>
							<p className="text-xs text-white/40 mt-1">
								For your security, we will send you a code to verify any change to your mobile number.
							</p>
						</div>

						{/* Password & Security */}
						<div className="bg-[#23202b] rounded-xl p-6 space-y-4 shadow-lg">
							<h2 className="font-semibold text-lg mb-2 text-white">Password & Security</h2>
							<p className="text-white/70 text-sm">
								Secure your account with password and two-factor authentication.
							</p>
							<div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-8 mt-4">
								<div>
									<label className="block text-sm text-white/70">
										Account Password
									</label>
									<p className="text-xs text-white/40 mb-2">
										Please follow the instructions in the email to finish setting your password.
									</p>
									<button
										type="button"
										className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
										disabled
									>
										Set Password
									</button>
								</div>
								<div>
									<label className="block text-sm text-white/70">
										Two-Factor Authentication
									</label>
									<p className="text-xs text-white/40 mb-2">
										Please set a password before enabling two-factor authentication.
									</p>
									<button
										type="button"
										className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
										disabled
									>
										Enable 2FA
									</button>
								</div>
							</div>
						</div>

						{/* Third Party Accounts */}
						<div className="bg-[#23202b] rounded-xl p-6 space-y-4 shadow-lg">
							<h2 className="font-semibold text-lg mb-2 text-white">Third Party Accounts</h2>
							<p className="text-white/70 text-sm mb-4">
								Link your accounts to sign in to Luma and automate your workflows.
							</p>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<span className="font-medium text-white">Google</span>
									<div className="text-white/70 text-sm">
										cynthiamuemi@gmail.com
									</div>
								</div>
								<div>
									<span className="font-medium text-white">Apple</span>
									<div className="text-white/40 text-sm">Not Linked</div>
								</div>
								<div>
									<span className="font-medium text-white">Zoom</span>
									<div className="text-white/40 text-sm">Not Linked</div>
								</div>
								<div>
									<span className="font-medium text-white">Solana</span>
									<div className="text-white/40 text-sm">Not Linked</div>
								</div>
								<div>
									<span className="font-medium text-white">Ethereum</span>
									<div className="text-white/40 text-sm">Not Linked</div>
								</div>
							</div>
						</div>

						{/* Account Syncing */}
						<div className="bg-[#23202b] rounded-xl p-6 space-y-4 shadow-lg">
							<h2 className="font-semibold text-lg mb-2 text-white">Account Syncing</h2>
							<div className="mb-4">
								<label className="block text-sm text-white/70 mb-1">
									Calendar Syncing
								</label>
								<p className="text-white/70 text-sm mb-2">
									Sync your Luma events with your Google, Outlook, or Apple calendar.
								</p>
								<button
									type="button"
									className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
									disabled
								>
									Add iCal Subscription
								</button>
							</div>
							<div>
								<label className="block text-sm text-white/70 mb-1">
									Sync Contacts with Google
								</label>
								<p className="text-white/70 text-sm mb-2">
									Sync your Gmail contacts to easily invite them to your events.
								</p>
								<button
									type="button"
									className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
									disabled
								>
									Enable Syncing
								</button>
							</div>
						</div>

						{/* Active Devices */}
						<div className="bg-[#23202b] rounded-xl p-6 space-y-4 shadow-lg">
							<h2 className="font-semibold text-lg mb-2 text-white">Active Devices</h2>
							<p className="text-white/70 text-sm mb-4">
								See the list of devices you are currently signed into Luma from.
							</p>
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<div>
										<span className="text-white">Chrome on Windows</span>
										<span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
											This Device
										</span>
										<div className="text-xs text-white/40">Nairobi, KE</div>
									</div>
									<span className="text-xs text-white/40">Active now</span>
								</div>
								<div className="flex items-center justify-between">
									<div>
										<span className="text-white">Mobile Chrome on Android</span>
										<div className="text-xs text-white/40">Nairobi, KE</div>
									</div>
									<span className="text-xs text-white/40">Active today</span>
								</div>
								<div className="flex items-center justify-between">
									<div>
										<span className="text-white">Mobile Chrome on Android</span>
										<div className="text-xs text-white/40">Nairobi, KE</div>
									</div>
								</div>
							</div>
							<p className="text-xs text-white/40 mt-2">
								See something you don't recognise? You may sign out of all other devices.
							</p>
						</div>

						{/* Danger Zone */}
						<div className="bg-[#2d1a1a] rounded-xl p-6 space-y-4 shadow-lg border border-red-500/30">
							<h2 className="font-semibold text-lg mb-2 text-red-400">
								Delete Account
							</h2>
							<p className="text-white/70">
								If you no longer wish to use Luma, you can permanently delete your
								account.
							</p>
							<button
								type="button"
								className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold"
								onClick={() => {
									logout()
									alert("Account deleted (demo only)")
								}}
							>
								Delete My Account
							</button>
						</div>
					</form>
				)}

				{/* Preferences Tab */}
				{tab === "preferences" && (
					<div className="bg-[#23202b] rounded-xl p-6 shadow-lg text-white/70">
						<h2 className="font-semibold text-lg mb-2 text-white">Preferences</h2>
						<p className="text-white/70 text-sm">
							Preferences content goes here (customize as needed).
						</p>
					</div>
				)}

				{/* Payment Tab */}
				{tab === "payment" && (
					<div className="bg-[#23202b] rounded-xl p-6 shadow-lg text-white/70">
						<h2 className="font-semibold text-lg mb-2 text-white">Payment</h2>
						<p className="text-white/70 text-sm">
							Payment content goes here (customize as needed).
						</p>
					</div>
				)}
			</div>
		</div>
	)
}