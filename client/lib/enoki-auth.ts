import { EnokiClient } from '@mysten/enoki';

// Initialize Enoki client with your API key
const enokiClient = new EnokiClient({
  apiKey: process.env.NEXT_PUBLIC_ENOKI_API_KEY!,
});

// Function to initiate Google OAuth login with Enoki
export async function initiateGoogleLogin() {
  try {
    // Create a zkLogin URL using Enoki
    const zkLoginURL = await enokiClient.createZkLoginURL({
      provider: 'google',
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      redirectUrl: `${window.location.origin}/auth/callback`,
      network: 'mainnet',
    });

    // Redirect to the zkLogin URL
    window.location.href = zkLoginURL;
  } catch (error) {
    console.error('Error creating zkLogin URL:', error);
    throw error;
  }
}

// Function to handle the callback after Google OAuth
export async function handleAuthCallback(authCode: string) {
  try {
    // Get the zkProof from Enoki
    const zkProof = await enokiClient.getZkProof({
      provider: 'google',
      authCode,
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      redirectUrl: `${window.location.origin}/auth/callback`,
      network: 'mainnet',
    });

    // Get the SUI address from the zkProof
    const address = zkProof.address;

    // Store the session
    if (typeof window !== 'undefined') {
      localStorage.setItem('sui_address', address);
      localStorage.setItem('enoki_proof', JSON.stringify(zkProof));
    }

    return {
      address,
      zkProof,
    };
  } catch (error) {
    console.error('Error getting zkProof:', error);
    throw error;
  }
}

// Function to get the current session
export function getSession() {
  if (typeof window !== 'undefined') {
    const address = localStorage.getItem('sui_address');
    const proofStr = localStorage.getItem('enoki_proof');
    
    if (address && proofStr) {
      return {
        address,
        zkProof: JSON.parse(proofStr),
      };
    }
  }
  return null;
}

// Function to clear the session
export function clearSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sui_address');
    localStorage.removeItem('enoki_proof');
  }
}