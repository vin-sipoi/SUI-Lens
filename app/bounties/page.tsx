"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Filter, Coins, Calendar, Users, ExternalLink, Award, Plus, X } from "lucide-react"
import Link from "next/link"
import { ConnectButton } from "@mysten/dapp-kit"

interface Bounty {
  id: number
  title: string
  description: string
  event: string
  reward: string
  deadline: string
  difficulty: string
  submissions: number
  status: "active" | "completed"
  tags: string[]
}

interface BountyFormData {
  title: string
  description: string
  event: string
  reward: string
  deadline: string
  difficulty: string
  tags: string[]
}

interface CreateBountyDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: BountyFormData) => void
}

const CreateBountyDialog = ({ isOpen, onClose, onSubmit }: CreateBountyDialogProps) => {
  const [formData, setFormData] = useState<BountyFormData>({
    title: '',
    description: '',
    event: '',
    reward: '',
    deadline: '',
    difficulty: 'Beginner',
    tags: []
  })
  const [tagInput, setTagInput] = useState('')

  const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

  const handleInputChange = (field: keyof BountyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = () => {
    if (formData.title && formData.description && formData.reward && formData.deadline) {
      onSubmit(formData)
      setFormData({
        title: '',
        description: '',
        event: '',
        reward: '',
        deadline: '',
        difficulty: 'Beginner',
        tags: []
      })
      onClose()
    }
  }

  if (!isOpen) return null
}

// Move CommunityBounties to top-level scope
const CommunityBounties: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-600">Community Bounties</h1>
        <p className="text-lg text-gray-600">Earn tokens by contributing to the ecosystem</p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Bounty Card 1 */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
              1
            </div>
            <h2 className="ml-4 text-xl font-semibold">Build a fully functional BTC node</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <div className="text-sm text-gray-400">Deadline: December 2025</div>
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Apply
          </button>
        </div>

        {/* Comment Card 1 */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
          <div className="flex items-center mb-4">
            <img
              src="https://via.placeholder.com/40"
              alt="User"
              className="w-10 h-10 rounded-full mr-4"
            />
            <div>
              <p className="font-semibold">User123</p>
              <p className="text-sm text-gray-400">June 24, 2025</p>
            </div>
          </div>
          <p className="text-gray-600">
            This sounds like a great opportunity! I’ve been working on something similar and would love to contribute. Let me know the details!
          </p>
        </div>

        {/* Bounty Card 2 */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
              2
            </div>
            <h2 className="ml-4 text-xl font-semibold">Build a fully functional LTC node</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <div className="text-sm text-gray-400">Deadline: December 2025</div>
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Apply
          </button>
        </div>

        {/* Comment Card 2 */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
          <div className="flex items-center mb-4">
            <img
              src="https://via.placeholder.com/40"
              alt="User"
              className="w-10 h-10 rounded-full mr-4"
            />
            <div>
              <p className="font-semibold">DevX</p>
              <p className="text-sm text-gray-400">June 24, 2025</p>
            </div>
          </div>
          <p className="text-gray-600">
            Excited to see this! I’ve got some experience with LTC nodes and would love to help out. Any specific requirements?
          </p>
        </div>
      </main>
    </div>
  );
};

export default CommunityBounties;

