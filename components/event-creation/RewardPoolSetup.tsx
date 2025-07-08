import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useUser } from "@/app/landing/UserContext";

interface RewardPool {
  amount: number;
  maxParticipants: number;
  status: string;
  distributionMethod: string;
  participants: any[];
  createdAt: Date;
}

interface RewardPoolSetupProps {
  onRewardPoolChange: (rewardPool: RewardPool | null) => void;
}

const RewardPoolSetup: React.FC<RewardPoolSetupProps> = ({ onRewardPoolChange }) => {
  const { user } = useUser();
  const [isEnabled, setIsEnabled] = useState(false);
  const [amount, setAmount] = useState(0);
  const [maxParticipants, setMaxParticipants] = useState(1);

  const handleEnableChange = (checked: boolean) => {
    setIsEnabled(checked);
    if (!checked) {
      onRewardPoolChange(null); // Clear reward pool data if disabled
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 0;
    setAmount(value);
  };

  const handleMaxParticipantsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 1;
    setMaxParticipants(value);
  };

  const handleSubmit = () => {
    if (isEnabled) {
      const newRewardPool: RewardPool = {
        amount,
        maxParticipants,
        status: 'none', // Initial status
        distributionMethod: 'attendance', // Default distribution method
        participants: [],
        createdAt: new Date(),
      };
      onRewardPoolChange(newRewardPool as RewardPool);
    } else {
      onRewardPoolChange(null);
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-2">
        <Switch
          id="reward-pool-switch"
          checked={isEnabled}
          onCheckedChange={handleEnableChange}
        />
        <Label htmlFor="reward-pool-switch">Enable Reward Pool</Label>
      </div>

      {isEnabled && (
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="amount">Reward Amount (SUI)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={handleAmountChange}
              min={0}
            />
          </div>
          <div>
            <Label htmlFor="max-participants">Max Participants</Label>
            <Input
              id="max-participants"
              type="number"
              value={maxParticipants}
              onChange={handleMaxParticipantsChange}
              min={1}
            />
          </div>
          <Button onClick={handleSubmit}>Save Reward Pool</Button>
        </div>
      )}
    </div>
  );
};

export default RewardPoolSetup;

