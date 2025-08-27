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
    icon: "/overviewgray.png",
    alt: "overviewicon"
  },
  {
    id: "guests",
    label: "Guests",
    icon: "/Vector (2).svg",
    alt: "guesticon"
  },
  {
    id: "blast",
    label: "Broadcast",
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
      const mobile = window.innerWidth < 768;
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
        className="md:hidden fixed bottom-6 right-6 z-30 w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg"
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside 
        id="sidebar"
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } fixed md:static top-0 left-0 z-20 w-64 md:w-52 lg:w-60 xl:w-64 min-h-screen bg-white text-[#0B1620] py-4 md:py-6 flex flex-col transition-transform duration-300 ease-in-out shadow-lg md:shadow-none ${className}`}
      >
        <nav className="flex-1 flex flex-col px-3 md:px-4 gap-2">
          {/* Main Navigation Items */}
          {mainItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => handleSectionClick(item.id)}
              className={`flex items-center gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg font-medium text-sm md:text-base transition-colors ${
                activeSection === item.id 
                  ? "text-[#101928] bg-[#EDF6FF]" 
                  : "text-[#667185] bg-white"
              }`}
            >
              <Image src={item.icon} alt={item.alt} width={20} height={20} className={`flex-shrink-0 ${
                activeSection === item.id ? "text-[#101928]" : "text-[#667185]"
              } `}/>
              <span className="truncate">{item.label}</span>
            </button>
          ))}
            
          {/* Insights Section */}
          <div className="mt-4 md:mt-6">
            <span className="text-[#667185] font-medium text-sm md:text-base uppercase tracking-wider px-3 md:px-4 mb-3 block">INSIGHTS</span>

            {insightItems.map((item) => (
              <div key={item.id}>
                {item.href ? (
                  <Link 
                    href={item.href}
                    onClick={() => {
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className={`flex items-center gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg font-medium text-sm md:text-base transition-colors w-full ${
                      activeSection === item.id 
                        ? "text-[#101928] bg-[#EDF6FF]" 
                        : "text-[#667185] bg-white hover:text-[#101928] hover:bg-[#EDF6FF]"
                    }`}
                  >
                    <Image src={item.icon} alt={item.alt} width={20} height={20} className="flex-shrink-0"/>
                    <span className="truncate">{item.label}</span>
                  </Link>
                ) : (
                  <button 
                    onClick={() => {
                      handleSectionClick(item.id);
                    }}
                    className={`flex items-center gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg font-medium text-sm md:text-base transition-colors w-full ${
                      activeSection === item.id 
                        ? "text-[#101928] bg-[#EDF6FF]" 
                        : "text-[#667185] bg-white hover:text-[#101928] hover:bg-[#EDF6FF]"
                    }`}
                  >
                    <Image src={item.icon} alt={item.alt} width={20} height={20} className="flex-shrink-0"/>
                    <span className="truncate">{item.label}</span>
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