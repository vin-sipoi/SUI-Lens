"use client"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  className?: string
}

interface SidebarItem {
  id: string
  label: string
  icon: string
  alt: string
}

const mainItems: SidebarItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: "/material-symbols_dashboard-rounded.svg",
    alt: "overviewicon"
  },
  {
    id: "guests",
    label: "Guests",
    icon: "/Vector (2).svg",
    alt: "guesticon"
  },
  {
    id: "registrations",
    label: "Registration",
    icon: "/Vector (3).png",
    alt: "reg"
  },
  {
    id: "blast",
    label: "Blast",
    icon: "/Vector (1).svg",
    alt: "reg"
  },
]

const insightItems = [
  {
    id: "statistics",
    label: "Statistics",
    icon: "/Vector (3).svg",
    alt: "statistics"
  },
  {
    id: "bounties",
    label: "Bounties",
    icon: "/Vector (4).svg",
    alt: "bounties",
    href: "/bounties"
  }
]

export default function Sidebar({ activeSection, onSectionChange, className = "" }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    // Check on initial load
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && sidebarOpen) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setSidebarOpen(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, sidebarOpen]);

  const handleSectionClick = (sectionId: string) => {
    onSectionChange(sectionId);
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)} 
        className="lg:hidden fixed bottom-6 right-6 z-30 w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg"
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside 
        id="sidebar"
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } fixed lg:static top-0 left-0 z-20 w-64 lg:w-64 min-h-screen bg-[#F6FBFF] text-[#0B1620] py-6 flex flex-col transition-transform duration-300 ease-in-out ${className}`}
      >
        <nav className="flex-1 flex flex-col px-4 gap-2">
          {/* Main Navigation Items */}
          {mainItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => handleSectionClick(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base transition-colors ${
                activeSection === item.id 
                  ? "text-white bg-[#1A2332]" 
                  : "text-gray-400 hover:text-white hover:bg-[#1A2332]"
              }`}
            >
              <Image src={item.icon} alt={item.alt} width={20} height={20} className="flex-shrink-0"/>
              {item.label}
            </button>
          ))}
            
          {/* Insights Section */}
          <div className="mt-6">
            <span className="text-gray-500 font-medium text-base uppercase tracking-wider px-4 mb-3 block">INSIGHTS</span>

            {insightItems.map((item) => (
              <div key={item.id}>
                {item.href ? (
                  <button 
                    onClick={() => {
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm text-gray-400 hover:text-white hover:bg-[#1A2332] transition-colors w-full"
                  >
                    <Link 
                      href={item.href} 
                      className="flex items-center gap-3 w-full"
                      onClick={() => {
                        if (isMobile) setSidebarOpen(false);
                      }}
                    >
                      <Image src={item.icon} alt={item.alt} width={20} height={20} className="flex-shrink-0"/>
                      {item.label}
                    </Link>
                  </button>  
                ) : (
                  <button 
                    onClick={() => {
                      handleSectionClick(item.id);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors w-full ${
                      activeSection === item.id 
                        ? "text-white bg-[#1A2332]" 
                        : "text-gray-400 hover:text-white hover:bg-[#1A2332]"
                    }`}
                  >
                    <Image src={item.icon} alt={item.alt} width={20} height={20} className="flex-shrink-0"/>
                    {item.label}
                  </button>
                )}
              </div>
            ))}
          </div>
        </nav>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  )
}