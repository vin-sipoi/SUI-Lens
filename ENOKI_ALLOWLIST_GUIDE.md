# Enoki Allow-List Configuration Guide

## Problem
The sponsored transactions are failing with the error:
```
Method 0x80a710472adc37cc6deced075780f2ac44a0e8cad534f4edc1c1e2f994878c7b::suilens_core::create_profile is not part of an allow-listed move call target
```

## Solution
You need to configure the following Move call targets in your Enoki dashboard to allow sponsored transactions for your SUI-Lens application.

## Required Move Call Targets

### Package ID
```
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c
```

### Core Module (`suilens_core`)
```
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_core::create_profile
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_core::update_profile
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_core::add_social_link
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_core::create_event
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_core::register_for_event
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_core::approve_registration
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_core::cancel_registration
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_core::update_event
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_core::cancel_event
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_core::mark_attendance
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_core::verify_and_checkin
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_core::self_checkin
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_core::mint_event_nft
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_core::withdraw_event_funds
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_core::join_waitlist
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_core::leave_waitlist
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_core::promote_from_waitlist
```

### POAP Module (`suilens_poap`)
```
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_poap::create_poap_collection
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_poap::claim_poap
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_poap::update_collection
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_poap::deactivate_collection
```

### Community Module (`suilens_community`)
```
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_community::create_community
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_community::join_community
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_community::approve_join_request
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_community::leave_community
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_community::add_moderator
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_community::post_announcement
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_community::add_community_event
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_community::update_community
```

### Bounty Module (`suilens_bounty`)
```
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_bounty::create_bounty
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_bounty::submit_bounty_work
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_bounty::select_winner
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_bounty::claim_bounty_reward
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_bounty::cancel_bounty
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_bounty::add_bounty_metadata
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_bounty::add_submission_metadata
```

## How to Configure in Enoki Dashboard

1. **Login to Enoki Dashboard**: Go to https://enoki.mystenlabs.com/dashboard
2. **Select your API Key**: Choose the API key you're using for SUI-Lens
3. **Navigate to Allow-List Section**: Go to the "Allow-List" or "Move Call Targets" section
4. **Add Move Call Targets**: Add all the targets listed above
5. **Save Configuration**: Save the changes

## Verification

After configuring the allow-list, test the following:
1. Create a user profile
2. Create an event
3. Register for an event
4. Create a POAP collection

## Current Status

✅ **Network Connectivity Fixed**: The "Failed to fetch" error has been resolved
✅ **Server Configuration Fixed**: Enoki is properly configured with ENOKI_PRIVATE_KEY
✅ **CORS Configuration Updated**: Frontend can communicate with backend
⚠️ **Allow-List Pending**: Move call targets need to be configured in Enoki dashboard

## Next Steps

1. Configure the allow-list targets in Enoki dashboard
2. Test sponsored transactions
3. Verify all functionality works end-to-end
