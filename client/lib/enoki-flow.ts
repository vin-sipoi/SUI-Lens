import { EnokiFlow } from '@mysten/enoki';

// Initialize Enoki Flow for zkLogin
// This handles the OAuth flow and wallet creation
const enokiFlow = new EnokiFlow({
  apiKey: process.env.NEXT_PUBLIC_ENOKI_API_KEY!,
  network: 'mainnet',
});

/**
 * Start the Google OAuth flow for zkLogin
 * Using implicit flow since that's what Google is returning
 */
export async function startGoogleLogin() {
  try {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      throw new Error('Google Client ID not configured');
    }

    console.log('Starting Google OAuth implicit flow...');
    
    // Use Google OAuth directly with implicit flow for ID token
    const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: 'http://localhost:3001/auth/callback',
      response_type: 'id_token', // Get ID token directly
      scope: 'openid email profile',
      nonce: Math.random().toString(36).substring(7), // Required for ID token
      prompt: 'select_account',
    });
    
    const url = `${googleAuthUrl}?${params.toString()}`;
    console.log('Redirecting to:', url);
    
    // Redirect to Google OAuth
    window.location.href = url;
  } catch (error) {
    console.error('Failed to start Google login:', error);
    throw error;
  }
}

/**
 * Handle the OAuth callback
 */
export async function handleAuthCallback(code: string) {
  try {
    const session = await enokiFlow.handleAuthorizationResponse({ code });
    
    // Session contains:
    // - address: The zkLogin SUI address
    // - jwt: The JWT token
    
    // Store session data
    if (typeof window !== 'undefined') {
      localStorage.setItem('enoki_address', session.address);
      localStorage.setItem('enoki_jwt', session.jwt);
    }
    
    return session;
  } catch (error) {
    console.error('Failed to handle auth callback:', error);
    throw error;
  }
}

/**
 * Get the current session
 */
export async function getSession() {
  try {
    return await enokiFlow.getSession();
  } catch (error) {
    return null;
  }
}

/**
 * Logout and clear session
 */
export async function logout() {
  try {
    await enokiFlow.logout();
    
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('enoki_address');
      localStorage.removeItem('enoki_jwt');
    }
  } catch (error) {
    console.error('Failed to logout:', error);
  }
}