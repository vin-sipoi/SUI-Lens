#!/usr/bin/env node

import EventSyncService from '../services/eventSyncService.js';

async function syncEvents() {
  console.log('Starting event synchronization...');
  
  const syncService = new EventSyncService();
  await syncService.syncEventsFromBlockchain();
  
  console.log('Event synchronization complete!');
  process.exit(0);
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

syncEvents().catch(error => {
  console.error('Sync failed:', error);
  process.exit(1);
});