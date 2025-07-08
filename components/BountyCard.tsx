import React from 'react';

interface Bounty {
  id: string;
  title: string;
  reward_amount: number;
  status: string;
}

interface BountyCardProps {
  bounty: Bounty;
}

export const BountyCard: React.FC<BountyCardProps> = ({ bounty }) => {
  return (
    <div className="bounty-card border p-4 rounded shadow mb-4">
      <h3 className="text-lg font-semibold">{bounty.title}</h3>
      <p>Reward: {bounty.reward_amount} SUI</p>
      <p>Status: {bounty.status}</p>
    </div>
  );
};
