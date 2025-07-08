interface RewardPoolSetupProps {
  eventId: string;
  onPoolLocked: (amount: number, maxParticipants: number) => void;
}

export const RewardPoolSetup = ({ eventId, onPoolLocked }: RewardPoolSetupProps) => {
  const [amount, setAmount] = useState(0);
  const [maxParticipants, setMaxParticipants] = useState(50);
  
  const handleLockFunds = async () => {
    const txb = await lockRewardPool(eventId, amount, maxParticipants);
    // Execute transaction...
    onPoolLocked(amount, maxParticipants);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label>Reward Pool Amount (SUI)</Label>
        <Input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <p className="text-sm text-gray-500">
          Each participant will receive ~{Math.floor(amount / maxParticipants)} SUI
        </p>
      </div>
      
      <div>
        <Label>Maximum Participants</Label>
        <Input 
          type="number" 
          value={maxParticipants} 
          onChange={(e) => setMaxParticipants(Number(e.target.value))}
          max={1000}
        />
      </div>
      
      <Button onClick={handleLockFunds}>
        Lock Reward Pool
      </Button>
    </div>
  );
};
