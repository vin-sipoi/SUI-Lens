'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { User, Mail, Link, FileText } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useSuiContracts } from '@/hooks/useSuiContracts';
import { useUser } from '@/app/landing/UserContext';
import { toast } from 'sonner';

export default function CreateProfile() {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentAccount = useCurrentAccount();
  const { createProfile, hasUserProfile } = useSuiContracts();
  const { login } = useUser();
  
  const walletAddress = searchParams.get('wallet') || currentAccount?.address;

  useEffect(() => {
    if (!walletAddress) {
      toast.error('No wallet address found. Please connect your wallet first.');
      router.push('/auth/signin');
      return;
    }

    // Check if profile already exists
    const checkExistingProfile = async () => {
      try {
        const profileExists = await hasUserProfile(walletAddress);
        if (profileExists) {
          toast.info('Profile already exists. Redirecting to dashboard...');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking existing profile:', error);
      }
    };

    checkExistingProfile();
  }, [walletAddress, router, hasUserProfile]);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Username is required');
      return;
    }

    if (!walletAddress) {
      toast.error('Wallet address is required');
      return;
    }

    try {
      setIsCreating(true);
      
      // Create profile on blockchain
      await createProfile({
        username: username.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${username}`
      });

      // Update user context
      login({
        name: username.trim(),
        email: '',
        walletAddress: walletAddress,
        username: username.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
        emails: [],
        eventsAttended: 0,
        poapsCollected: 0
      });

      toast.success('Profile created successfully!');
      router.push('/dashboard');
      
    } catch (error) {
      console.error('Error creating profile:', error);
      
      // Check if error is due to existing profile
      if (error.message && error.message.includes('E_ALREADY_REGISTERED')) {
        toast.error('Profile already exists for this wallet. Redirecting to sign in...');
        router.push('/auth/signin');
      } else {
        toast.error('Failed to create profile. Please try again.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  if (!walletAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Create Your Profile
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Set up your SUI-Lens profile to get started
          </p>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm font-medium">
              Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleCreateProfile} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700 font-semibold">
                Username *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="pl-10 py-3 rounded-xl border-2 focus:border-blue-400"
                  maxLength={100}
                />
              </div>
              <p className="text-xs text-gray-500">
                {username.length}/100 characters - This will be your display name on the platform
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-gray-700 font-semibold">
                Bio
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="pl-10 py-3 rounded-xl border-2 focus:border-blue-400 min-h-[100px]"
                  maxLength={1000}
                />
              </div>
              <p className="text-xs text-gray-500">
                {bio.length}/1000 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl" className="text-gray-700 font-semibold">
                Avatar URL
              </Label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="avatarUrl"
                  type="url"
                  placeholder="https://example.com/avatar.png"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="pl-10 py-3 rounded-xl border-2 focus:border-blue-400"
                />
              </div>
              <p className="text-xs text-gray-500">
                Leave empty to use a generated avatar
              </p>
              {(avatarUrl || username) && (
                <div className="mt-3 flex items-center gap-3">
                  <p className="text-sm text-gray-600">Preview:</p>
                  <img
                    src={avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${username}`}
                    alt="Avatar preview"
                    className="w-12 h-12 rounded-full border-2 border-gray-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${username}`;
                    }}
                  />
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isCreating || !username.trim()}
              className="w-full py-3 text-base font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
            >
              {isCreating ? 'Creating Profile...' : 'Create Profile'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By creating a profile, you agree to our terms of service
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}