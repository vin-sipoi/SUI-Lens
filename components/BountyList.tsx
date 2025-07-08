import React, { useEffect, useState } from 'react';
import { useBounty } from '../context/BountyContext';
import { BountyCard } from './BountyCard';

interface BountyListProps {
  searchQuery: string;
  filterStatus: string;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const BountyList: React.FC<BountyListProps> = ({ searchQuery, filterStatus, page, pageSize, onPageChange }) => {
  const { bounties, fetchBounties } = useBounty();
  const [filteredBounties, setFilteredBounties] = useState<typeof bounties>([]);

  useEffect(() => {
    fetchBounties();
  }, []);

  useEffect(() => {
    let filtered = bounties;

    if (searchQuery) {
      filtered = filtered.filter((bounty: any) =>
        bounty.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus && filterStatus !== 'all') {
      filtered = filtered.filter((bounty: any) => bounty.status === filterStatus);
    }

    setFilteredBounties(filtered);
  }, [bounties, searchQuery, filterStatus]);

  const totalPages = Math.ceil(filteredBounties.length / pageSize);
  const paginatedBounties = filteredBounties.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      {paginatedBounties.map((bounty: any) => (
        <BountyCard key={bounty.id} bounty={bounty} />
      ))}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => onPageChange(i + 1)}
            disabled={page === i + 1}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BountyList;
