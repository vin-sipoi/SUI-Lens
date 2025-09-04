"use client"

import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Search } from 'lucide-react';
import { getLocationSuggestions } from '@/lib/openstreetmap';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  onCoordinatesChange?: (lat: number, lng: number) => void;
  placeholder?: string;
  label?: string;
}

interface LocationSuggestion {
  display_name: string;
  lat: number;
  lng: number;
  place_id: string;
}

const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  onCoordinatesChange,
  placeholder = "Enter location or venue",
  label = "Location"
}) => {
  const [predictions, setPredictions] = useState<LocationSuggestion[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (newValue.length > 2) {
      setIsSearching(true);

      try {
        abortControllerRef.current = new AbortController();
        const suggestions = await getLocationSuggestions(newValue);

        if (suggestions.length > 0) {
          setPredictions(suggestions);
          setShowPredictions(true);
        } else {
          setPredictions([]);
          setShowPredictions(false);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error fetching predictions:', error);
        }
        setPredictions([]);
        setShowPredictions(false);
      } finally {
        setIsSearching(false);
      }
    } else {
      setPredictions([]);
      setShowPredictions(false);
    }
  };

  const handlePredictionSelect = (suggestion: LocationSuggestion) => {
    onChange(suggestion.display_name);
    setShowPredictions(false);

    // Get coordinates for the selected place
    if (onCoordinatesChange) {
      onCoordinatesChange(suggestion.lat, suggestion.lng);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setShowPredictions(false), 200);
  };

  return (
    <div className="relative">
      <Label className="text-sm font-medium text-gray-700 mb-2 block">{label}</Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          ref={autocompleteRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {isSearching && (
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-pulse" />
        )}
      </div>

      {showPredictions && predictions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {predictions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              type="button"
              className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              onClick={() => handlePredictionSelect(suggestion)}
            >
              <div className="text-sm">{suggestion.display_name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationInput;
