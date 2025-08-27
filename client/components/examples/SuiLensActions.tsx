/**
 * Example component demonstrating all SUI-Lens actions with Enoki zkLogin
 * Shows how creators, attendees, and users can interact with the platform
 */

'use client';

import { useState } from 'react';
import { useSuiLensTransaction } from '@/hooks/useSuiLensTransaction';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function SuiLensActions() {
  const { user } = useUser();
  const {
    isConnected,
    address,
    createEvent,
    registerForEvent,
    mintEventNFT,
    claimPOAP,
    markAttendance,
    withdrawEventFunds,
    createProfile,
    joinCommunity,
    createBounty,
  } = useSuiLensTransaction();

  const [loading, setLoading] = useState<string | null>(null);
  const [eventId, setEventId] = useState('');
  const [attendeeAddress, setAttendeeAddress] = useState('');

  // Example: Create Event (for creators)
  const handleCreateEvent = async () => {
    setLoading('createEvent');
    try {
      const result = await createEvent({
        name: 'Web3 Developer Meetup',
        description: 'Monthly meetup for Web3 developers',
        bannerUrl: 'https://i.ibb.co/0JQ0Z6Z/web3-meetup-banner.jpg',
        nftImageUrl: 'https://i.ibb.co/NFT123/web3-meetup-nft.jpg',
        poapImageUrl: 'https://i.ibb.co/POAP456/web3-meetup-poap.jpg',
        location: 'San Francisco, CA',
        category: 'Technology',
        startTime: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week from now
        endTime: Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000, // 3 hours event
        maxAttendees: 100,
        ticketPrice: 0,
        requiresApproval: false,
      });
      console.log('Event created:', result);
    } finally {
      setLoading(null);
    }
  };

  // Example: Register for Event (for attendees)
  const handleRegisterForEvent = async () => {
    if (!eventId) return;
    setLoading('register');
    try {
      const result = await registerForEvent(eventId);
      console.log('Registered for event:', result);
    } finally {
      setLoading(null);
    }
  };

  // Example: Mint Event NFT (for registered attendees)
  const handleMintEventNFT = async () => {
    if (!eventId) return;
    setLoading('mintNFT');
    try {
      const result = await mintEventNFT(eventId);
      console.log('Event NFT minted:', result);
    } finally {
      setLoading(null);
    }
  };

  // Example: Claim POAP (for attendees who checked in)
  const handleClaimPOAP = async () => {
    if (!eventId) return;
    setLoading('claimPOAP');
    try {
      const result = await claimPOAP(eventId);
      console.log('POAP claimed:', result);
    } finally {
      setLoading(null);
    }
  };

  // Example: Mark Attendance (for event organizers)
  const handleMarkAttendance = async () => {
    if (!eventId || !attendeeAddress) return;
    setLoading('markAttendance');
    try {
      const result = await markAttendance(eventId, attendeeAddress);
      console.log('Attendance marked:', result);
    } finally {
      setLoading(null);
    }
  };

  // Example: Withdraw Funds (for event creators)
  const handleWithdrawFunds = async () => {
    if (!eventId) return;
    setLoading('withdraw');
    try {
      const result = await withdrawEventFunds(eventId);
      console.log('Funds withdrawn:', result);
    } finally {
      setLoading(null);
    }
  };

  // Example: Create Profile (for new users)
  const handleCreateProfile = async () => {
    setLoading('createProfile');
    try {
      const result = await createProfile({
        username: 'web3dev',
        bio: 'Passionate Web3 developer and blockchain enthusiast',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SuiLens',
      });
      console.log('Profile created:', result);
    } finally {
      setLoading(null);
    }
  };

  if (!isConnected && !user?.isEnoki) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Please connect your wallet or ensure you are properly logged in with Enoki to use SUI-Lens features</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SUI-Lens Actions Demo</CardTitle>
          <p className="text-sm text-gray-600">Connected: {address}</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="creator">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="creator">Creator</TabsTrigger>
              <TabsTrigger value="attendee">Attendee</TabsTrigger>
              <TabsTrigger value="user">User</TabsTrigger>
            </TabsList>

            {/* Creator Actions */}
            <TabsContent value="creator" className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Event Management</h3>
                
                <Button 
                  onClick={handleCreateEvent}
                  disabled={loading === 'createEvent'}
                  className="w-full"
                >
                  {loading === 'createEvent' ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Event...</>
                  ) : (
                    'Create Sample Event'
                  )}
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Event ID"
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                  />
                  <Button 
                    onClick={handleWithdrawFunds}
                    disabled={loading === 'withdraw' || !eventId}
                  >
                    {loading === 'withdraw' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Withdraw Funds'
                    )}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Mark Attendance</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Attendee Address"
                      value={attendeeAddress}
                      onChange={(e) => setAttendeeAddress(e.target.value)}
                    />
                    <Button 
                      onClick={handleMarkAttendance}
                      disabled={loading === 'markAttendance' || !eventId || !attendeeAddress}
                    >
                      {loading === 'markAttendance' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Mark Present'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Attendee Actions */}
            <TabsContent value="attendee" className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Event Participation</h3>
                
                <div className="space-y-2">
                  <Input
                    placeholder="Enter Event ID"
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                  />
                  
                  <Button 
                    onClick={handleRegisterForEvent}
                    disabled={loading === 'register' || !eventId}
                    className="w-full"
                  >
                    {loading === 'register' ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...</>
                    ) : (
                      'Register for Event'
                    )}
                  </Button>

                  <Button 
                    onClick={handleMintEventNFT}
                    disabled={loading === 'mintNFT' || !eventId}
                    className="w-full"
                    variant="secondary"
                  >
                    {loading === 'mintNFT' ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Minting NFT...</>
                    ) : (
                      'Mint Event NFT'
                    )}
                  </Button>

                  <Button 
                    onClick={handleClaimPOAP}
                    disabled={loading === 'claimPOAP' || !eventId}
                    className="w-full"
                    variant="outline"
                  >
                    {loading === 'claimPOAP' ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Claiming POAP...</>
                    ) : (
                      'Claim POAP (After Event)'
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* User Profile Actions */}
            <TabsContent value="user" className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Profile & Community</h3>
                
                <Button 
                  onClick={handleCreateProfile}
                  disabled={loading === 'createProfile'}
                  className="w-full"
                >
                  {loading === 'createProfile' ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Profile...</>
                  ) : (
                    'Create Profile'
                  )}
                </Button>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    All actions are signed using Enoki zkLogin with your Google account.
                    No traditional wallet needed!
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>For Event Creators:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Create events with 3 images (banner, NFT, POAP)</li>
            <li>Manage registrations and approve attendees</li>
            <li>Mark attendance and withdraw collected funds</li>
            <li>Create POAP collections for your events</li>
          </ul>
          
          <p className="mt-4"><strong>For Attendees:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Register for events (free or paid)</li>
            <li>Mint commemorative Event NFTs</li>
            <li>Claim POAPs after attending and checking in</li>
            <li>Join waitlists for full events</li>
          </ul>
          
          <p className="mt-4"><strong>For All Users:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Create and update profiles</li>
            <li>Join and participate in communities</li>
            <li>Create and compete for bounties</li>
            <li>All powered by Enoki zkLogin - no wallet app needed!</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}