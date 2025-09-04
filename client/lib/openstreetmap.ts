// Free geocoding and mapping utilities using OpenStreetMap services

// OpenStreetMap embed URL with marker
export const getOpenStreetMapEmbedUrl = (location: string, lat?: number, lng?: number) => {
  if (lat && lng) {
    // Use coordinates with marker for precise pinpointing
    const bbox = `${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  }

  // Fallback to location search
  return `https://www.openstreetmap.org/export/embed.html?q=${encodeURIComponent(location)}`;
};

// Free geocoding function using OpenStreetMap Nominatim API
export const geocodeLocation = async (location: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      return { lat, lng };
    }

    return null;
  } catch (error) {
    console.error('Error geocoding location:', error);
    return null;
  }
};

// Reverse geocoding function using Nominatim
export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();

    if (data && data.display_name) {
      return data.display_name;
    }

    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};

// Get location suggestions for autocomplete using Nominatim
export const getLocationSuggestions = async (query: string): Promise<Array<{ display_name: string; lat: number; lng: number; place_id: string }>> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error('Location suggestions failed');
    }

    const data = await response.json();

    return data.map((item: any) => ({
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      place_id: item.place_id
    }));
  } catch (error) {
    console.error('Error getting location suggestions:', error);
    return [];
  }
};
