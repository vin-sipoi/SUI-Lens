'use client'

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "../../context/UserContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import Image from "next/image"
import {
  ArrowLeft,
  Edit3,
  Camera,
  Plus,
  Loader2,
  Menu,
  X,
  Upload,
  Image as ImageIcon,
  Award,
  Ticket,
} from "lucide-react"
import Link from "next/link"
import { useEventContext } from "@/context/EventContext"
import { mintPOAP, suilensService } from "@/lib/sui-client"
import Header from '@/app/components/Header'
import LocationInput from '@/components/LocationInput'
import { uploadImageToImgBB, validateImageFile } from '@/utils/imageUtils'
import { toast } from 'sonner'
import { useEnokiTransaction } from '@/hooks/useEnokiTransaction'
import { Transaction } from '@mysten/sui/transactions'
import TransactionIdExtractor from '@/lib/transaction-id-extractor';

// Backend API service
const saveEventToDatabase = async (eventData: any) => {
  try {
    const eventId = eventData.id; // Blockchain event ID
    if (!eventId) {
      throw new Error('Event ID is missing');
    }

    const response = await fetch('http://localhost:3005/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: eventId,
        title: eventData.title,
        description: eventData.description,
        startDate: new Date(`${eventData.date} ${eventData.time}`).toISOString(),
        endDate: new Date(`${eventData.endDate || eventData.date} ${eventData.endTime || eventData.time}`).toISOString(),
        location: eventData.location,
        latitude: eventData.latitude,
        longitude: eventData.longitude,
        category: eventData.category,
        capacity: eventData.capacity ? parseInt(eventData.capacity) : 100,
        ticketPrice: eventData.isFree ? 0 : (parseInt(eventData.ticketPrice) || 0),
        isFree: eventData.isFree,
        requiresApproval: eventData.requiresApproval,
        isPrivate: eventData.isPrivate,
        timezone: eventData.timezone || 'UTC',
        bannerUrl: eventData.bannerUrl,
        nftImageUrl: eventData.nftImageUrl,
        poapImageUrl: eventData.poapImageUrl,
        qrCode: eventData.qrCode,
        eventUrl: eventData.eventUrl,
        poapEnabled: eventData.poapEnabled,
        poapName: eventData.poapName,
        poapDescription: eventData.poapDescription,
        createdBy: eventData.createdBy,
        suiEventId: eventData.suiEventId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Database save failed:', response.status, errorData);
      throw new Error(`Database save failed: ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('Event saved to database successfully:', result.id);
    return result;
  } catch (error) {
    console.error('Error saving to database:', error);
    throw error;
  }
};

export default function CreateEventPage() {
  const { user } = useUser();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { addEvent } = useEventContext();
  const { signAndExecuteTransaction } = useEnokiTransaction();

  // Redirect to signin if not logged in
  useEffect(() => {
    if (!user) {
      const timeoutId = setTimeout(() => {
        router.push('/auth/signin');
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [user, router]);

  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    endDate: "",
    time: "",
    endTime: "",
    location: "",
    category: "",
    capacity: "",
    ticketPrice: "",
    isFree: true,
    requiresApproval: false,
    isPrivate: false,
    timezone: "UTC",
    latitude: 0,
    longitude: 0,
  });

  const [isCreating, setIsCreating] = useState(false);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [capacityDialogOpen, setCapacityDialogOpen] = useState(false);
  const [poapDialogOpen, setPoapDialogOpen] = useState(false);
  const [tempTicketData, setTempTicketData] = useState({
    isFree: eventData.isFree,
    ticketPrice: eventData.ticketPrice,
  });
  const [tempCapacityData, setTempCapacityData] = useState({
    capacity: eventData.capacity,
  });

  const [bannerImage, setBannerImage] = useState<{
    file: File | null;
    preview: string | null;
    url: string | null;
  }>({ file: null, preview: null, url: null });

  const [nftImage, setNftImage] = useState<{
    file: File | null;
    preview: string | null;
    url: string | null;
  }>({ file: null, preview: null, url: null });

  const [poapImage, setPoapImage] = useState<{
    file: File | null;
    preview: string | null;
    url: string | null;
  }>({ file: null, preview: null, url: null });

  const [uploadingImages, setUploadingImages] = useState({
    banner: false,
    nft: false,
    poap: false,
  });

  const [poapData, setPoapData] = useState({
    name: "",
    description: "",
  });

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    imageType: 'banner' | 'nft' | 'poap'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      // Reset the image state to avoid inconsistent UI
      if (imageType === 'banner') {
        setBannerImage({ file: null, preview: null, url: null });
      } else if (imageType === 'nft') {
        setNftImage({ file: null, preview: null, url: null });
      } else if (imageType === 'poap') {
        setPoapImage({ file: null, preview: null, url: null });
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const preview = event.target?.result as string;

      if (imageType === 'banner') {
        setBannerImage({ file, preview, url: null });
      } else if (imageType === 'nft') {
        setNftImage({ file, preview, url: null });
      } else if (imageType === 'poap') {
        setPoapImage({ file, preview, url: null });
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadImagesToCloud = async () => {
    const imageUrls = {
      bannerUrl: bannerImage.url || '',
      nftImageUrl: nftImage.url || '',
      poapImageUrl: poapImage.url || ''
    };

    const uploads: Promise<void>[] = [];

    if (bannerImage.file && !bannerImage.url) {
      setUploadingImages(prev => ({ ...prev, banner: true }));
      uploads.push(
        uploadImageToImgBB(bannerImage.file, `${eventData.title}_banner_${Date.now()}`)
          .then(url => {
            setBannerImage(prev => ({ ...prev, url }));
            imageUrls.bannerUrl = url;
          })
          .finally(() => setUploadingImages(prev => ({ ...prev, banner: false })))
      );
    }

    if (nftImage.file && !nftImage.url) {
      setUploadingImages(prev => ({ ...prev, nft: true }));
      uploads.push(
        uploadImageToImgBB(nftImage.file, `${eventData.title}_nft_${Date.now()}`)
          .then(url => {
            setNftImage(prev => ({ ...prev, url }));
            imageUrls.nftImageUrl = url;
          })
          .finally(() => setUploadingImages(prev => ({ ...prev, nft: false })))
      );
    }

    if (poapImage.file && !poapImage.url) {
      setUploadingImages(prev => ({ ...prev, poap: true }));
      uploads.push(
        uploadImageToImgBB(poapImage.file, `${eventData.title}_poap_${Date.now()}`)
          .then(url => {
            setPoapImage(prev => ({ ...prev, url }));
            imageUrls.poapImageUrl = url;
          })
          .finally(() => setUploadingImages(prev => ({ ...prev, poap: false })))
      );
    }

    if (uploads.length > 0) {
      toast.info('Uploading images...');
      await Promise.all(uploads);
      toast.success('Images uploaded successfully!');
    }

    return imageUrls;
  };

  const generateQRCode = async (eventId: string) => {
    try {
      const eventUrl = `${window.location.origin}/event/${eventId}/register`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(eventUrl)}`;
      return {
        qrCodeUrl,
        eventUrl,
        qrCodeImage: qrCodeUrl,
      };
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      // Validate required fields
      if (!eventData.title || !eventData.description || !eventData.date || !eventData.time || !eventData.location) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate banner image
      if (!bannerImage.file) {
        toast.error('Please upload an event banner image');
        return;
      }

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(eventData.date) || (eventData.endDate && !/^\d{4}-\d{2}-\d{2}$/.test(eventData.endDate))) {
        toast.error('Invalid date format. Please use YYYY-MM-DD');
        return;
      }

      // Validate numeric fields
      if (eventData.capacity && isNaN(parseInt(eventData.capacity))) {
        toast.error('Capacity must be a valid number');
        return;
      }
      if (!eventData.isFree && eventData.ticketPrice && isNaN(parseInt(eventData.ticketPrice))) {
        toast.error('Ticket price must be a valid number');
        return;
      }

      // Upload images
      const imageUrls = await uploadImagesToCloud();

      // Create profile if not exists
      if (!user) {
        toast.error('User not authenticated');
        router.push('/auth/signin');
        return;
      }

      try {
        const profileTx = new Transaction();
        if (!process.env.NEXT_PUBLIC_PACKAGE_ID || !process.env.NEXT_PUBLIC_EVENT_REGISTRY_ID) {
          throw new Error('Missing environment variables for package or registry ID');
        }
        profileTx.moveCall({
          target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::suilens_core::create_profile`,
          arguments: [
            profileTx.object(process.env.NEXT_PUBLIC_EVENT_REGISTRY_ID),
            profileTx.pure.string(user.name || 'Event Creator'),
            profileTx.pure.string('Event creator on SUI-Lens'),
            profileTx.pure.string(user.avatarUrl || user.picture || 'https://api.dicebear.com/7.x/avataaars/svg?seed=SuiLens'),
            profileTx.object('0x6'),
          ],
        });

        await signAndExecuteTransaction(profileTx);
        toast.success('Profile created successfully!');
      } catch (profileError: any) {
        console.log('Profile creation skipped (may already exist):', profileError.message);
        toast.info('Profile creation skipped (may already exist)');
      }

      // Create event on blockchain
      toast.info('Creating event on blockchain...');
      const tx = await suilensService.createEvent({
        name: eventData.title,
        description: eventData.description,
        bannerUrl: imageUrls.bannerUrl,
        nftImageUrl: imageUrls.nftImageUrl,
        poapImageUrl: imageUrls.poapImageUrl,
        location: eventData.location,
        category: eventData.category,
        startTime: new Date(`${eventData.date} ${eventData.time}`).getTime(),
        endTime: new Date(`${eventData.endDate || eventData.date} ${eventData.endTime || eventData.time}`).getTime(),
        maxAttendees: parseInt(eventData.capacity) || 100,
        ticketPrice: eventData.isFree ? 0 : parseInt(eventData.ticketPrice) || 0,
        requiresApproval: eventData.requiresApproval,
        poapTemplate: poapData.name || '',
      });

      const result = await signAndExecuteTransaction(tx);
      console.log('Create event transaction result:', result);

      // Extract blockchain event ID
      let blockchainEventId: string | undefined;
      try {
        blockchainEventId = TransactionIdExtractor.extractEventId(result as any);
        if (!blockchainEventId) {
          throw new Error('Failed to extract event ID from transaction');
        }
      } catch (error) {
        console.error('Failed to extract event ID:', error);
        toast.error('Failed to get event ID from blockchain transaction');
        throw error;
      }

      console.log('Blockchain Event ID:', blockchainEventId);
      toast.success('Event created on blockchain!');

      // Generate QR code
      const qrData = await generateQRCode(blockchainEventId);

      // Prepare complete event data
      const completeEventData = {
        id: blockchainEventId,
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        endDate: eventData.endDate,
        endTime: eventData.endTime,
        location: eventData.location,
        latitude: eventData.latitude,
        longitude: eventData.longitude,
        category: eventData.category,
        capacity: eventData.capacity,
        ticketPrice: eventData.ticketPrice,
        isFree: eventData.isFree,
        requiresApproval: eventData.requiresApproval,
        isPrivate: eventData.isPrivate,
        timezone: eventData.timezone,
        bannerUrl: imageUrls.bannerUrl,
        nftImageUrl: imageUrls.nftImageUrl,
        poapImageUrl: imageUrls.poapImageUrl,
        qrCode: qrData.qrCodeImage,
        eventUrl: qrData.eventUrl,
        poapEnabled: !!poapData.name,
        poapName: poapData.name,
        poapDescription: poapData.description,
        createdBy: user.id || user.email || 'unknown',
        suiEventId: blockchainEventId,
      };

      // Add to local context
      addEvent(completeEventData);

      // Save to database
      toast.info('Saving event details...');
      try {
        const dbResult = await saveEventToDatabase(completeEventData);
        if (dbResult) {
          toast.success('Event saved to database!');
        } else {
          console.warn('Database save completed but returned null');
          toast.warning('Event created but database sync may be delayed');
        }
      } catch (dbError) {
        console.error('Database save failed:', dbError);
        toast.warning('Event created successfully but database sync may be delayed');
      }

      toast.success('Event created successfully!');
      router.push(`/discover`);

    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error(error.message || 'Failed to create event. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleTicketSave = () => {
    setEventData({
      ...eventData,
      isFree: tempTicketData.isFree,
      ticketPrice: tempTicketData.ticketPrice,
    });
    setTicketDialogOpen(false);
  };

  const handleCapacitySave = () => {
    setEventData({
      ...eventData,
      capacity: tempCapacityData.capacity,
    });
    setCapacityDialogOpen(false);
  };

  const handlePoapSave = () => {
    setEventData({
      ...eventData,
      poapEnabled: !!poapData.name,
      poapName: poapData.name,
      poapDescription: poapData.description,
    });
    setPoapDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6">
          <Link href="/landing" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Create Event</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Event Images</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {bannerImage.preview ? (
                      <img src={bannerImage.preview} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">📸 Event Banner *</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Main promotional image for your event (16:9 recommended)
                  </p>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'banner')}
                      className="hidden"
                    />
                    <Button type="button" variant="outline" size="sm" className="pointer-events-none">
                      <Upload className="w-4 h-4 mr-2" />
                      {bannerImage.file ? 'Change Image' : 'Upload Image'}
                    </Button>
                  </label>
                  {bannerImage.url && (
                    <span className="ml-2 text-sm text-green-600">✓ Uploaded</span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {nftImage.preview ? (
                      <img src={nftImage.preview} alt="NFT" className="w-full h-full object-cover" />
                    ) : (
                      <Ticket className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">🎫 Event NFT Image</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Commemorative NFT for registered attendees (1:1 recommended)
                  </p>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'nft')}
                      className="hidden"
                    />
                    <Button type="button" variant="outline" size="sm" className="pointer-events-none">
                      <Upload className="w-4 h-4 mr-2" />
                      {nftImage.file ? 'Change Image' : 'Upload Image'}
                    </Button>
                  </label>
                  {nftImage.url && (
                    <span className="ml-2 text-sm text-green-600">✓ Uploaded</span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                    {poapImage.preview ? (
                      <img src={poapImage.preview} alt="POAP" className="w-full h-full object-cover" />
                    ) : (
                      <Award className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">🏅 POAP Badge Design</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Badge for attendees who check in (Square, badge-style recommended)
                  </p>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'poap')}
                      className="hidden"
                    />
                    <Button type="button" variant="outline" size="sm" className="pointer-events-none">
                      <Upload className="w-4 h-4 mr-2" />
                      {poapImage.file ? 'Change Image' : 'Upload Image'}
                    </Button>
                  </label>
                  {poapImage.url && (
                    <span className="ml-2 text-sm text-green-600">✓ Uploaded</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="eventName" className="text-sm font-medium text-gray-700 mb-2 block">
              Event Name *
            </Label>
            <Input
              id="eventName"
              placeholder="Enter event name"
              value={eventData.title}
              onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Start *</Label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                value={eventData.date}
                onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <Input
                type="time"
                value={eventData.time}
                onChange={(e) => setEventData({ ...eventData, time: e.target.value })}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">End</Label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                value={eventData.endDate}
                onChange={(e) => setEventData({ ...eventData, endDate: e.target.value })}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <Input
                type="time"
                value={eventData.endTime}
                onChange={(e) => setEventData({ ...eventData, endTime: e.target.value })}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <LocationInput
              value={eventData.location}
              onChange={(value) => setEventData({ ...eventData, location: value })}
              onCoordinatesChange={(lat, lng) => {
                setEventData(prev => ({
                  ...prev,
                  latitude: lat,
                  longitude: lng
                }));
              }}
              label="Event Location"
              placeholder="Enter venue name or address"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
              Add Description *
            </Label>
            <Textarea
              id="description"
              placeholder="What's your event about?"
              rows={4}
              value={eventData.description}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Tickets</Label>
            <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between border-gray-300 hover:border-gray-400"
                  onClick={() => {
                    setTempTicketData({
                      isFree: eventData.isFree,
                      ticketPrice: eventData.ticketPrice,
                    });
                  }}
                >
                  <span>{eventData.isFree ? "Free" : `$${eventData.ticketPrice || "0"}`}</span>
                  <Edit3 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95%] max-w-md mx-auto bg-white">
                <DialogHeader>
                  <DialogTitle>Edit Tickets</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="free-ticket"
                      checked={tempTicketData.isFree}
                      onCheckedChange={(checked) =>
                        setTempTicketData({ ...tempTicketData, isFree: checked, ticketPrice: checked ? '' : tempTicketData.ticketPrice })
                      }
                    />
                    <Label htmlFor="free-ticket">Free Event</Label>
                  </div>
                  {!tempTicketData.isFree && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">
                        Price ($)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="0.00"
                        value={tempTicketData.ticketPrice}
                        onChange={(e) =>
                          setTempTicketData({ ...tempTicketData, ticketPrice: e.target.value })
                        }
                        className="col-span-3"
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    onClick={handleTicketSave}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Save changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="approval" className="text-sm font-medium text-gray-700">
              Require Approval
            </Label>
            <Switch
              id="approval"
              checked={eventData.requiresApproval}
              onCheckedChange={(checked) => setEventData({ ...eventData, requiresApproval: checked })}
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Maximum Capacity</Label>
            <Dialog open={capacityDialogOpen} onOpenChange={setCapacityDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between border-gray-300 hover:border-gray-400"
                  onClick={() => {
                    setTempCapacityData({
                      capacity: eventData.capacity,
                    });
                  }}
                >
                  <span>{eventData.capacity || "Unlimited"}</span>
                  <Edit3 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95%] max-w-md mx-auto bg-white">
                <DialogHeader>
                  <DialogTitle>Edit Capacity</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="capacity" className="text-right">
                      Max Guests
                    </Label>
                    <Input
                      id="capacity"
                      type="number"
                      placeholder="Unlimited"
                      value={tempCapacityData.capacity}
                      onChange={(e) =>
                        setTempCapacityData({ ...tempCapacityData, capacity: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    Leave empty for unlimited capacity
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    onClick={handleCapacitySave}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Save changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {poapImage.file && (
            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="font-medium text-gray-900 mb-3">POAP Details</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="poap-name">POAP Name</Label>
                  <Input
                    id="poap-name"
                    placeholder="Enter POAP name"
                    value={poapData.name}
                    onChange={(e) => setPoapData({ ...poapData, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="poap-description">POAP Description</Label>
                  <Textarea
                    id="poap-description"
                    placeholder="Describe your POAP"
                    rows={3}
                    value={poapData.description}
                    onChange={(e) => setPoapData({ ...poapData, description: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isCreating || !bannerImage.file || uploadingImages.banner || uploadingImages.nft || uploadingImages.poap}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Event...
              </>
            ) : (
              'Create Event'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}