const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function to handle API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Registration API with unified endpoint
export const registrationAPI = {
  registerEmailUnified: async (data: {
    email: string;
    name: string;
    eventId: string;
    authenticationMethod: 'web2' | 'web3';
    walletAddress?: string;
    userId?: string;
    emailConsent?: boolean;
  }) => {
    return await apiRequest('/api/register-email-unified', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  registerEmail: async (email: string, name: string, eventId: string) => {
    return await apiRequest('/api/register-email', {
      method: 'POST',
      body: JSON.stringify({
        email,
        name,
        eventId,
      }),
    });
  },

  getRegistrations: async (eventId: string) => {
    return await apiRequest(`/api/registrations/event/${eventId}`, {
      method: 'GET',
    });
  },

  getRegistrationsForBlast: async (eventId: string) => {
    return await apiRequest(`/api/registrations-blast/${eventId}`, {
      method: 'GET',
    });
  },
};

// Email Blast API
export const emailBlastAPI = {
  sendBlastEmail: async (
    subject: string,
    content: string,
    recipients: string[],
    eventId?: string,
    userId?: string
  ) => {
    return await apiRequest('/api/send-blast-email', {
      method: 'POST',
      body: JSON.stringify({
        subject,
        content,
        recipients,
        eventId,
        userId,
      }),
    });
  },
};

// Event API
export const eventAPI = {
  createEvent: async (eventData: {
    id: string; // Add id field
    title: string;
    description?: string;
    startDate: string; // Change date to startDate
    endDate: string; // Add endDate
    location?: string;
    capacity?: number;
    ticketPrice?: number;
    isFree?: boolean;
    requiresApproval?: boolean;
    isPrivate?: boolean;
    timezone?: string;
    bannerUrl?: string;
    nftImageUrl?: string;
    poapImageUrl?: string;
    qrCode?: string;
    eventUrl?: string;
    poapEnabled?: boolean;
    poapName?: string;
    poapDescription?: string;
    createdBy?: string;
    suiEventId?: string;
  }) => {
    return await apiRequest('/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  getEvents: async () => {
    return await apiRequest('/api/events', {
      method: 'GET',
    });
  },

  getEvent: async (id: string) => {
    return await apiRequest(`/api/events/${id}`, {
      method: 'GET',
    });
  },
};

// Enoki integration utilities
export const enokiAPI = {
  extractEmailFromEnoki: async (walletAddress: string) => {
    // This would integrate with Enoki's API to extract email
    // Placeholder for actual Enoki integration
    return {
      email: null, // Would be populated from Enoki
      walletAddress,
      authenticationMethod: 'web3'
    };
  },
};

// For backward compatibility, export a default object that mimics axios
const api = {
  post: (endpoint: string, data: any) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  get: (endpoint: string) => apiRequest(endpoint, { method: 'GET' }),
};

export default api;
