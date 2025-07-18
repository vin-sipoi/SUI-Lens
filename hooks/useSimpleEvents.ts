"use client";

import { useCallback } from 'react';
import { useSuiClient } from '@mysten/dapp-kit';
import { SUI_CONTRACTS } from '@/lib/sui-contracts';

export function useSimpleEvents() {
  const client = useSuiClient();

  const getUserEvents = useCallback(async (userAddress: string) => {
    try {
      console.log('Fetching events for user:', userAddress);
      
      // Query EventCreated events
      const eventQuery = await client.queryEvents({
        query: {
          MoveEventType: `${SUI_CONTRACTS.packageId}::${SUI_CONTRACTS.modules.core}::EventCreated`
        },
        limit: 50,
        order: 'descending'
      });
      
      console.log('Found EventCreated events:', eventQuery.data.length);
      
      // Filter events by creator
      const userEventIds = eventQuery.data
        .filter((event: any) => event.parsedJson?.creator === userAddress)
        .map((event: any) => event.parsedJson?.event_id)
        .filter((id: string) => id);
      
      console.log('User event IDs:', userEventIds);
      
      if (userEventIds.length === 0) {
        return [];
      }
      
      // For now, return a simplified version
      // In a real implementation, you would fetch the full event objects
      const events = userEventIds.map((id: string, index: number) => ({
        id,
        title: `Event ${index + 1}`,
        creator: userAddress,
        description: 'Event description',
        start_date: new Date(),
        end_date: new Date(),
        location: 'Online',
        category: 'General',
        is_free: true,
      }));
      
      return events;
    } catch (error) {
      console.error('Error fetching user events:', error);
      return [];
    }
  }, [client]);

  return { getUserEvents };
}