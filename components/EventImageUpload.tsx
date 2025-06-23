import React, { useState, useRef } from 'react';
import { Camera, Calendar, Upload, X } from 'lucide-react';

type EventData = {
  title: string;
  date: string;
  time: string;
  image: File | null;
  imageUrl: string | null;
};

const EventImageUpload = () => {
  const [eventData, setEventData] = useState<EventData>({
    title: '',
    date: '',
    time: '',
    image: null,
    imageUrl: null
  });
  
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('prompt');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Check camera permission status
  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' });
      setPermissionStatus(result.state);
      return result.state;
    } catch (error) {
      console.log('Permission API not supported');
      return 'prompt';
    }
  };

  // Request camera permission
  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop the stream immediately as we just needed permission
      stream.getTracks().forEach(track => track.stop());
      setPermissionStatus('granted');
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      setPermissionStatus('denied');
      return false;
    }
  };

  // Handle camera icon click
  const handleCameraClick = async () => {
    await checkCameraPermission();
    setShowUploadOptions(true);
  };

  // Handle file selection from device
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const file = files && files[0];
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setEventData(prev => ({
        ...prev,
        image: file,
        imageUrl: imageUrl
      }));
      setShowUploadOptions(false);
    }
  };

  // Handle camera capture
  const handleCameraCapture = async () => {
    const hasPermission = await requestCameraPermission();
    if (hasPermission) {
      // Trigger the camera input
      cameraInputRef.current?.click();
    } else {
      alert('Camera permission is required to take photos. Please enable it in your browser settings.');
    }
  };

  // Handle camera file selection
  const handleCameraFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const file = files && files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setEventData(prev => ({
        ...prev,
        image: file,
        imageUrl: imageUrl
      }));
      setShowUploadOptions(false);
    }
  };

  // Remove selected image
  const removeImage = () => {
    if (eventData.imageUrl) {
      URL.revokeObjectURL(eventData.imageUrl);
    }
    setEventData(prev => ({
      ...prev,
      image: null,
      imageUrl: null
    }));
  };

  // Format date
  const formatDate = (dateString: string | number | Date) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format time
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className= "border-b border-white/10 bg-[#201a28] top-0 z-40" style={{ background: "#201a28" }}>
      <div className="max-w-2xl mx-auto">
        {/* Image Upload Section */}
        <div className="relative">
          <div 
            className="relative h-64 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-2xl"
            onClick={handleCameraClick}
            style={eventData.imageUrl ? {
              backgroundImage: `url(${eventData.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            } : {}}
          >
            {!eventData.imageUrl ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
                    <Camera className="w-6 h-6 text-white/60" />
                  </div>
                  <p className="text-white/60 font-medium">Add event image</p>
                  <p className="text-white/40 text-sm mt-1">Recommended: 1200x630</p>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col justify-between p-6">
                <div className="flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                    className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                
                {eventData.title && (
                  <div className="bg-gradient-to-t from-black/60 to-transparent rounded-xl p-4 -m-2">
                    <h2 className="text-2xl font-bold text-white mb-2">{eventData.title}</h2>
                    {(eventData.date || eventData.time) && (
                      <div className="flex items-center text-white/90 text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        {eventData.date && formatDate(eventData.date)}
                        {eventData.date && eventData.time && ' • '}
                        {eventData.time && formatTime(eventData.time)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Upload Options Modal */}
          {showUploadOptions && (
            <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center z-10">
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 w-full max-w-sm mx-4">
                <h3 className="text-white font-semibold text-lg mb-4 text-center">Choose Image Source</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={handleCameraCapture}
                    className="w-full flex items-center justify-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-medium transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Take Photo</span>
                  </button>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center space-x-3 bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-xl font-medium transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Choose from Files</span>
                  </button>
                  
                  <button
                    onClick={() => setShowUploadOptions(false)}
                    className="w-full bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraFile}
          className="hidden"
        />

        {/* Permission Status (for debugging) */}
        {permissionStatus === 'denied' && (
          <div className="mt-4 p-4 bg-red-600/20 border border-red-500/30 rounded-xl">
            <p className="text-red-200 text-sm">
              Camera permission denied. You can still upload images from your device.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventImageUpload;