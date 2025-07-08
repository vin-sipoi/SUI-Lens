import { useState, useEffect } from 'react';
import { Combobox } from '@headlessui/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { suilensService } from '@/lib/sui-client';

// Define the Bounty type
interface Bounty {
    id: string;
    title: string;
    // ... other bounty properties as needed
}

interface BountySelectionProps {
    selectedBounty: Bounty | null;
    onBountySelect: (bounty: Bounty | null) => void;
}

const BountySelection: React.FC<BountySelectionProps> = ({ selectedBounty, onBountySelect }) => {
    const [bounties, setBounties] = useState<Bounty[]>([]);
    const [query, setQuery] = useState('');

    useEffect(() => {
        const fetchBounties = async () => {
            try {
                const allBounties = await suilensService.getBounties();
                setBounties(allBounties);
            } catch (error) {
                console.error('Error fetching bounties:', error);
            }
        };

        fetchBounties();
    }, []);

    const filteredBounties =
        query === ''
            ? bounties
            : bounties.filter((bounty) => bounty.title.toLowerCase().includes(query.toLowerCase()));


    return (
        <div>
            <Label htmlFor="bounty-select">Associate a Bounty (Optional)</Label>
            <Combobox
                value={selectedBounty}
                onValueChange={onBountySelect}
            >
                <Combobox.Input
                    id="bounty-select"
                    placeholder="Search for a bounty..."
                    className="w-full"
                    onChange={(e) => setQuery(e.target.value)}
                    displayValue={(bounty: Bounty | null) => bounty?.title || ''}
                />
                <Combobox.Options>
                    {filteredBounties.map((bounty) => (
                        <Combobox.Option key={bounty.id} value={bounty}>
                            {bounty.title}
                        </Combobox.Option>
                    ))}
                </Combobox.Options>
            </Combobox>
        </div>
    );
};

export default BountySelection;