"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Bounty {
  id: string;
  title: string;
  reward_amount: number;
  status: string;
  description?: string;
}

interface BountyContextType {
  bounties: Bounty[];
  fetchBounties: () => Promise<void>;
  getBountyById: (id: string) => Promise<Bounty | null>;
  claimBounty: (id: string) => Promise<void>;
  submitProof: (id: string, proof: string) => Promise<void>;
}

const BountyContext = createContext<BountyContextType | undefined>(undefined);

export const BountyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bounties, setBounties] = useState<Bounty[]>([]);

  const fetchBounties = async () => {
    // Fetch bounties from backend API
    const response = await fetch('/api/bounties');
    const data = await response.json();
    setBounties(data);
  };

  const getBountyById = async (id: string): Promise<Bounty | null> => {
    // Fetch bounty details by id
    const response = await fetch(`/api/bounties/${id}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  };

  const claimBounty = async (id: string) => {
    // Call API to claim bounty
    await fetch(`/api/bounties/${id}/claim`, { method: 'POST' });
    await fetchBounties();
  };

  const submitProof = async (id: string, proof: string) => {
    // Call API to submit proof
    await fetch(`/api/bounties/${id}/submit-proof`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proof }),
    });
    await fetchBounties();
  };

  useEffect(() => {
    fetchBounties();
  }, []);

  return (
    <BountyContext.Provider value={{ bounties, fetchBounties, getBountyById, claimBounty, submitProof }}>
      {children}
    </BountyContext.Provider>
  );
};

export const useBounty = (): BountyContextType => {
  const context = useContext(BountyContext);
  if (!context) {
    throw new Error('useBounty must be used within a BountyProvider');
  }
  return context;
};
