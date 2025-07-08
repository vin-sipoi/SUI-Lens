export const RewardDistribution = ({ eventId }: { eventId: string }) => {
  const [participants, setParticipants] = useState<string[]>([]);
  const [distributionMethod, setDistributionMethod] = useState<'attendance' | 'manual'>('attendance');
  
  const loadPOAPHolders = async () => {
    // Get all POAP holders for this event
    const holders = await getPOAPHolders(eventId);
    setParticipants(holders);
  };
  
  const distributeRewards = async () => {
    await contract.add_participants_to_pool(eventId, participants);
    await contract.verify_participants(eventId, participants);
    await contract.distribute_funds(eventId, participants);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3>Distribution Method</h3>
        <select value={distributionMethod} onChange={(e) => setDistributionMethod(e.target.value)}>
          <option value="attendance">All POAP Holders</option>
          <option value="manual">Manual Selection</option>
        </select>
      </div>
      
      {distributionMethod === 'attendance' && (
        <Button onClick={loadPOAPHolders}>
          Load POAP Holders ({participants.length} found)
        </Button>
      )}
      
      <div>
        <h4>Selected Participants ({participants.length})</h4>
        {participants.map(addr => (
          <div key={addr} className="flex justify-between">
            <span>{addr.slice(0, 8)}...{addr.slice(-6)}</span>
            <span>~{baseReward} SUI</span>
          </div>
        ))}
      </div>
      
      <Button onClick={distributeRewards} disabled={participants.length === 0}>
        Distribute Rewards
      </Button>
    </div>
  );
};