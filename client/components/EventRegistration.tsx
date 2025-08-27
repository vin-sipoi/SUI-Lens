"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useZkLogin } from '@mysten/enoki/react';
import { registrationAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EventRegistrationProps {
  eventId: string;
  eventTitle: string;
  onRegistrationComplete?: (registration: any) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

interface RegistrationData {
  email: string;
  name: string;
  eventId: string;
  authenticationMethod: 'web2' | 'web3';
  walletAddress?: string;
  userId?: string;
  emailConsent?: boolean;
}

export default function EventRegistration({
  eventId,
  eventTitle,
  onRegistrationComplete,
  className = '',
  variant = 'default',
  size = 'default'
}: EventRegistrationProps) {
  const { user } = useUser();
  const account = useCurrentAccount();
  const { address: enokiAddress } = useZkLogin();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [manualEmail, setManualEmail] = useState('');
  const [manualName, setManualName] = useState('');

  // Extract user data for registration
  const extractUserData = (): RegistrationData | null => {
    const walletAddress = account?.address || enokiAddress || user?.walletAddress;
    
    if (!walletAddress && !user?.email) {
      return null;
    }

    return {
      email: user?.email || '',
      name: user?.name || user?.username || 'Anonymous User',
      eventId,
      authenticationMethod: walletAddress ? 'web3' : 'web2',
      walletAddress: walletAddress || undefined,
      userId: user?.id,
      emailConsent: true
    };
  };

  // Check if user is already registered
  const checkRegistrationStatus = async () => {
    if (!eventId) return;

    try {
      const walletAddress = account?.address || enokiAddress || user?.walletAddress;
      
      if (walletAddress) {
        // Check web3 registration
        const registrations = await registrationAPI.getRegistrations(eventId);
        const isRegisteredWeb3 = registrations.registrations?.some(
          (reg: any) => reg.walletAddress === walletAddress
        );
        setIsRegistered(isRegisteredWeb3);
      } else if (user?.email) {
        // Check web2 registration
        const registrations = await registrationAPI.getRegistrations(eventId);
        const isRegisteredWeb2 = registrations.registrations?.some(
          (reg: any) => reg.email === user.email
        );
        setIsRegistered(isRegisteredWeb2);
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
    }
  };

  useEffect(() => {
    checkRegistrationStatus();
  }, [eventId, user, account, enokiAddress]);

  // Handle registration click
  const handleRegistrationClick = async () => {
    setError(null);
    
    // Extract user data
    const userData = extractUserData();
    
    if (!userData) {
      setError('Unable to extract user information. Please ensure you are logged in.');
      return;
    }

    // Check if email is available
    if (!userData.email) {
      setShowEmailPrompt(true);
      return;
    }

    await registerUser(userData);
  };

  // Handle registration with manual email
  const handleManualRegistration = async () => {
    if (!manualEmail || !manualName) {
      setError('Please provide both email and name');
      return;
    }

    const userData: RegistrationData = {
      email: manualEmail,
      name: manualName,
      eventId,
      authenticationMethod: 'web2',
      emailConsent: true
    };

    await registerUser(userData);
  };

  // Register user with unified endpoint
  const registerUser = async (data: RegistrationData) => {
    setIsLoading(true);
    
    try {
      const response = await registrationAPI.registerEmailUnified(data);
      
      if (response.success) {
        setIsRegistered(true);
        setRegistrationData(response.registration);
        
        toast({
          title: "Registration Successful",
          description: `You have successfully registered for ${eventTitle}`,
          duration: 5000,
        });
        
        if (onRegistrationComplete) {
          onRegistrationComplete(response.registration);
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.message?.includes('Already registered')) {
        setIsRegistered(true);
        toast({
          title: "Already Registered",
          description: "You are already registered for this event",
          variant: "default",
        });
      } else {
        setError(error.message || 'Registration failed. Please try again.');
        toast({
          title: "Registration Failed",
          description: error.message || 'Unable to register for this event',
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      setShowEmailPrompt(false);
    }
  };

  // Reset registration state
  const resetRegistration = () => {
    setIsRegistered(false);
    setRegistrationData(null);
    setError(null);
  };

  if (isRegistered) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="w-5 h-5" />
        <span className="text-sm font-medium">Registered</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <Button
        onClick={handleRegistrationClick}
        disabled={isLoading}
        variant={variant}
        size={size}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Registering...
          </>
        ) : (
          'Register for Event'
        )}
      </Button>

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Email Collection Modal */}
      {showEmailPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Complete Registration</h3>
            <p className="text-sm text-gray-600 mb-4">
              To register for this event, please provide your email address and name.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Your Name"
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleManualRegistration}
                disabled={isLoading || !manualEmail || !manualName}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Register'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowEmailPrompt(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
