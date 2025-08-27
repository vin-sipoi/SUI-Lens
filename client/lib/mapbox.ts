import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

// Set Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

// Mapbox Geocoder configuration
export const getMapboxGeocoder = () => {
  if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
    console.error('Mapbox access token not found');
    return null;
  }

  return new MapboxGeocoder({
    accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    types: 'poi,address,place',
    placeholder: 'Enter location or venue',
    countries: 'us,gb,ca,au',
    limit: 5,
    language: 'en',
    marker: false,
    flyTo: false,
    clearAndBlurOnEsc: true,
    clearOnBlur: true,
  });
};

// Mapbox embed URLs
export const getMapboxEmbedUrl = (location: string, lat?: number, lng?: number) => {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!accessToken) {
    console.error('Mapbox access token not found');
    return '';
  }

  if (lat && lng) {
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s-l+3b82f6(${lng},${lat})/${lng},${lat},14,0/600x400?access_token=${accessToken}`;
  }
  
  // For location search, we'll use the geocoding API
  return `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${accessToken}`;
};

// Mapbox directions URL
export const getMapboxDirectionsUrl = (origin: string, destination: string) => {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!accessToken) {
    console.error('Mapbox access token not found');
    return '';
  }

  const encodedOrigin = encodeURIComponent(origin);
  const encodedDestination = encodeURIComponent(destination);
  
  return `https://api.mapbox.com/directions/v5/mapbox/driving/${encodedOrigin};${encodedDestination}?access_token=${accessToken}&geometries=geojson`;
};

// Geocoding function
export const geocodeLocation = async (location: string): Promise<{ lat: number; lng: number } | null> => {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!accessToken) {
    console.error('Mapbox access token not found');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${accessToken}&limit=1`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding location:', error);
    return null;
  }
};

// Reverse geocoding function
export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!accessToken) {
    console.error('Mapbox access token not found');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}&limit=1`
    );
    
    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      return data.features[0].place_name;
    }
    
    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};

// Check if Mapbox is configured
export const isMapboxConfigured = () => {
  return !!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
};
