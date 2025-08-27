# Enoki Dashboard Configuration Guide

## How to Add Allow-Listed Move Call Targets

### Step 1: Access the Enoki Dashboard
1. Go to the [Enoki Developer Portal](https://enoki.mystenlabs.com/dashboard)
2. Sign in with your account credentials
3. Select your API key (the one that matches your `ENOKI_PRIVATE_KEY`)

### Step 2: Navigate to Allow-List Section
1. In the left sidebar, click on "API Keys" or "Applications"
2. Select your application/API key
3. Look for the "Allow-List" or "Move Call Targets" section
4. This is usually found under "Security" or "Advanced Settings"

### Step 3: Add Move Call Targets
1. Click "Add Move Call Target" or similar button
2. Copy and paste the targets from `ENOKI_ALLOWLIST_TARGETS.txt` one by one
3. Alternatively, some dashboards allow bulk import via CSV or text area

### Step 4: Save Configuration
1. Click "Save" or "Update" to apply the changes
2. The changes should take effect immediately

### Step 5: Test the Configuration
1. After adding the targets, test your application
2. Try creating a profile or event to verify sponsorship works

## Important Notes

### Package ID
Your package ID is: `0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c`

### Critical Targets to Add First
Start with these essential targets:
```
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_core::create_profile
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_core::create_event
0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c::suilens_core::register_for_event
```

### Environment Variables
Make sure these are set in your `.env` file:
```
NEXT_PUBLIC_PACKAGE_ID=0x5d663fe35c25c54fe701cc9490e516722590e28722c34325dc6f1e20b2e8576c
NEXT_PUBLIC_EVENT_REGISTRY_ID=0x31ff956c2a7983edb450237628a363780c2651fff956f6c9aec9969b66f97c92
NEXT_PUBLIC_POAP_REGISTRY_ID=0xc8dd38a9b655f355e5de22514ede961b219722eaada1c36d980fc085dcb571a3
```

### Troubleshooting
- If targets don't appear in the dashboard, check that you're using the correct API key
- Ensure your `ENOKI_PRIVATE_KEY` matches the key you're configuring
- Restart your server after making changes
- Check server logs for any allow-list related errors

## Next Steps After Configuration
1. Test user profile creation
2. Test event creation
3. Test event registration
4. Verify sponsored transactions work end-to-end
