"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/landing/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function CreateBountyPage() {
  const { user } = useUser();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState("");
  const [criteria, setCriteria] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in to create a bounty.");
      return;
    }

    if (!title || !description || !reward || !criteria) {
      alert("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Integrate with smart contract or backend to create bounty
      // For now, simulate success with timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Bounty created successfully!");
      router.push("/bounties");
    } catch (error) {
      console.error("Error creating bounty:", error);
      alert("Failed to create bounty. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Create New Bounty</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter bounty title"
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Describe the bounty"
            rows={4}
          />
        </div>
        <div>
          <Label htmlFor="reward">Reward</Label>
          <Input
            id="reward"
            value={reward}
            onChange={(e) => setReward(e.target.value)}
            required
            placeholder="Enter reward amount (e.g., 100 SUI)"
          />
        </div>
        <div>
          <Label htmlFor="criteria">Criteria</Label>
          <Textarea
            id="criteria"
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            required
            placeholder="Specify criteria for bounty completion"
            rows={3}
          />
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating..." : "Create Bounty"}
        </Button>
      </form>
    </div>
  );
}
