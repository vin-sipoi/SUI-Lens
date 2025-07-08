'use client';

import React, { useState } from 'react';
import { useBounty } from '../../context/BountyContext';
import BountyList from '../../components/BountyList';

const BountiesPage: React.FC = () => {
  const { bounties } = useBounty();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 flex justify-between items-center">
        Bounty Marketplace
        <button
          onClick={() => window.location.href = '/create-bounty'}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Bounty
        </button>
      </h1>

      <div className="mb-4 flex space-x-4">
        <input
          type="text"
          placeholder="Search bounties"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 rounded flex-grow"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="claimed">Claimed</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <BountyList
        searchQuery={searchQuery}
        filterStatus={filterStatus}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
};

export default BountiesPage;
