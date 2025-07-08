'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBounty } from '../../../context/BountyContext';

interface BountyDetailsProps {
  params: {
    id: string;
  };
}

const BountyDetailsPage: React.FC<BountyDetailsProps> = ({ params }) => {
  const { id } = params;
  const { getBountyById, claimBounty, submitProof } = useBounty();
  const [bounty, setBounty] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [proof, setProof] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchBounty() {
      const data = await getBountyById(id);
      setBounty(data);
    }
    fetchBounty();
  }, [id, getBountyById]);

  const handleClaim = async () => {
    setLoading(true);
    try {
      await claimBounty(id);
      alert('Bounty claimed successfully');
      router.refresh();
    } catch (error) {
      alert('Failed to claim bounty');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProof = async () => {
    setLoading(true);
    try {
      await submitProof(id, proof);
      alert('Proof submitted successfully');
      router.refresh();
    } catch (error) {
      alert('Failed to submit proof');
    } finally {
      setLoading(false);
    }
  };

  if (!bounty) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{bounty.title}</h1>
      <p className="mb-2">Reward: {bounty.reward_amount} SUI</p>
      <p className="mb-2">Status: {bounty.status}</p>
      <p className="mb-4">{bounty.description}</p>

      {bounty.status === 'open' && (
        <button
          onClick={handleClaim}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        >
          {loading ? 'Claiming...' : 'Claim Bounty'}
        </button>
      )}

      {bounty.status === 'claimed' && (
        <div>
          <textarea
            placeholder="Submit proof of completion"
            value={proof}
            onChange={(e) => setProof(e.target.value)}
            className="border p-2 w-full mb-2"
          />
          <button
            onClick={handleSubmitProof}
            disabled={loading || !proof}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            {loading ? 'Submitting...' : 'Submit Proof'}
          </button>
        </div>
      )}
    </div>
  );
};

export default BountyDetailsPage;
