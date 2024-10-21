'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SidebarItemProps {
  icon: React.ReactNode
  text: string
  link:string
  isExpanded: boolean
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, text, isExpanded,link }) =>{
  const pathname=usePathname()
  return(
    <Link 
    href={link}>
    <li className={cn("flex items-center p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors",pathname===link&&'bg-gray-200 text-black hover:bg-gray-200')}>
    <span className="text-gray-500">{icon}</span>
    {isExpanded && <span className="ml-4 text-sm">{text}</span>}
  </li>
  </Link>
  )
}

interface SidebarProps {
  items: Array<{ icon: React.ReactNode; text: string,link:string }>
  defaultExpanded?: boolean
  expandedWidth?: string
  collapsedWidth?: string
  backgroundColor?: string
  textColor?: string
}

export function ExpandableSidebar({
  items,
  defaultExpanded = false,
  expandedWidth = '240px',
  collapsedWidth = '64px',
  backgroundColor = 'bg-white',
  textColor = 'text-gray-800',
}: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div
      className={`h-screen ${backgroundColor} ${textColor} sticky top-0 shadow-lg transition-all duration-300 ease-in-out`}
      style={{ width: isExpanded ? expandedWidth : collapsedWidth }}
    >
      <div className={cn("flex flex-col h-full")}>
        <div className="flex items-center justify-between p-4">
          {isExpanded && <h1 className="text-xl font-semibold">Sidebar</h1>}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            {isExpanded ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </button>
        </div>
        <nav className="flex-grow">
          <ul className="space-y-2 p-2 flex flex-col">
            {items.map((item, index) => (
              <SidebarItem key={index} icon={item.icon} link={item.link} text={item.text} isExpanded={isExpanded} />
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}