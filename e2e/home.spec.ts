import { test, expect } from '@playwright/test';

/**
 * Basic smoke tests for Spark ADHD web app (Original Aesthetic).
 */

test.describe('Home Screen', () => {
    test('should load without crash', async ({ page }) => {
        await page.goto('/');

        // App Title
        await expect(page.getByTestId('home-title')).toBeVisible();
    });

    test('should display streak summary', async ({ page }) => {
        await page.goto('/');

        // Streak text format (e.g. "0 days streak" or "1 day streak")
        await expect(page.getByTestId('home-streak')).toBeVisible();
        await expect(page.getByTestId('home-streak')).toHaveText(/\b\d+\s+day(s)?\s+streak\b/);
    });

    test('should display mode cards', async ({ page }) => {
        await page.goto('/');

        // Current Mode Names
        await expect(page.getByTestId('mode-ignite')).toBeVisible();
        await expect(page.getByTestId('mode-fogcutter')).toBeVisible();
        await expect(page.getByTestId('mode-pomodoro')).toBeVisible();
        await expect(page.getByTestId('mode-anchor')).toBeVisible();
        await expect(page.getByTestId('mode-checkin')).toBeVisible();
        await expect(page.getByTestId('mode-cbtguide')).toBeVisible();
    });



    test('should navigate to Fog Cutter from home card', async ({ page }) => {
        await page.goto('/');

        await page.getByTestId('mode-fogcutter').click();
        await expect(page.getByPlaceholder('What feels overwhelming?')).toBeVisible({ timeout: 15000 });
    });

    test('should display bottom tab navigation', async ({ page }) => {
        await page.goto('/');

        // Current Tab Labels
        await expect(page.getByText('Home', { exact: true })).toBeVisible();
        await expect(page.getByText('Focus', { exact: true })).toBeVisible();
        await expect(page.getByText('Tasks', { exact: true })).toBeVisible();
        await expect(page.getByText('Calendar', { exact: true })).toBeVisible();
    });
});

test.describe('Navigation', () => {
    test.skip('should navigate to Focus tab', async ({ page }) => {
        await page.goto('/');
        await page.click('text=Focus');
        await page.waitForTimeout(1000);
        await expect(page.locator('text=5-Minute Focus Timer')).toBeVisible({ timeout: 5000 });
    });
});
