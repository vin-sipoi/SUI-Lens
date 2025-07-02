"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Clock, Users, Share2, Heart, DollarSign } from "lucide-react";
import Image from "next/image";
import { mintPOAP } from "@/lib/sui-client";
import { useUser } from "@/app/landing/UserContext";

interface EventDetailsProps {
  eventData: any;
  onClose: () => void;
}

