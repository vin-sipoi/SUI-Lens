import { test, expect } from '@playwright/test';

test.describe('Event creation and registration flows', () => {
  test('Create event with approval and POAP enabled', async ({ page }) => {
    await page.goto('/create');

    // Fill event creation form
    await page.fill('input#eventName', 'Test Event with Approval and POAP');
    await page.fill('textarea#description', 'This is a test event.');
    await page.fill('input[type="date"]', '2025-07-01');
    await page.fill('input[type="time"]', '10:00');
    await page.fill('input#location', 'Test Location');

    // Enable Require Approval
    await page.click('label:has-text("Require Approval") + div input[type="checkbox"]');

    // Open POAP dialog and add POAP details
    await page.click('button:has-text("Add POAP")');
    await page.fill('input#poap-name', 'Test POAP');
    await page.fill('textarea#poap-description', 'Test POAP description');
    // Skipping image upload for simplicity
    await page.click('button:has-text("Add POAP")');

    // Submit event creation
    await page.click('button:has-text("Create Event")');

    // Expect redirect to discover page
    await expect(page).toHaveURL(/\/discover/);
  });

  test('Register for event and see pending approval', async ({ page }) => {
    await page.goto('/discover');

    // Search for the test event
    await page.fill('input[placeholder="Search for community or event..."]', 'Test Event with Approval and POAP');
    await page.waitForTimeout(1000); // wait for filtering

    // Click Register button
    await page.click('button:has-text("Register")');

    // Expect Pending Approval button to appear
    await expect(page.locator('button:has-text("Pending Approval")')).toBeVisible();
  });

  test('Event details show POAP claim after check-in', async ({ page }) => {
    // Navigate to event details page (assuming event id known or from discover)
    await page.goto('/events/event_1234567890'); // Replace with actual event id

    // Simulate check-in (this might require API or UI interaction)
    // For now, assume user is checked in

    // Expect Claim POAP button to be visible
    await expect(page.locator('button:has-text("Claim POAP")')).toBeVisible();

    // Click Claim POAP button
    await page.click('button:has-text("Claim POAP")');

    // Expect success alert or confirmation (mocked)
    // This depends on implementation; may need to mock mintPOAP
  });
});
