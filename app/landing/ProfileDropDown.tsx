"use client"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { User, Settings, LogOut } from "lucide-react"
import { useUser } from "./UserContext"
import Image from "next/image"
import Link from "next/link"

export function ProfileDropdown() {
  const { user, logout } = useUser()

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center space-x-2 focus:outline-none">
          <span className="inline-block w-9 h-9 rounded-full overflow-hidden border-2 border-blue-400 shadow">
            <Image
              src={user?.avatarUrl || "/avatar-placeholder.png"}
              alt="Profile"
              width={36}
              height={36}
            />
          </span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        className="min-w-[180px] bg-[#23202b] border border-white/10 rounded-xl shadow-lg p-2 mt-2"
        sideOffset={8}
      >
        <DropdownMenu.Item asChild>
          <Link
            href="/profile"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/80 hover:bg-blue-500/10 hover:text-white cursor-pointer"
          >
            <User className="w-4 h-4" />
            View Profile
          </Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild>
          <Link
            href="/settings"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/80 hover:bg-blue-500/10 hover:text-white cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </DropdownMenu.Item>
        <DropdownMenu.Separator className="my-2 border-t border-white/10" />
        <DropdownMenu.Item
          onSelect={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}