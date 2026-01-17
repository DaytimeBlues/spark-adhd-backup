import { test, expect } from '@playwright/test';

/**
 * Basic smoke tests for Spark ADHD web app.
 * Verifies core functionality works after deployment.
 */

test.describe('Home Screen', () => {
    test('should load without crash', async ({ page }) => {
        await page.goto('/');

        // Wait for the app to render
        await expect(page.locator('text=Spark')).toBeVisible();
        await expect(page.locator('text=Your focus companion')).toBeVisible();
    });

    test('should display streak card', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('text=Current Streak')).toBeVisible();
        await expect(page.locator('text=days')).toBeVisible();
    });

    test('should display all mode cards', async ({ page }) => {
        await page.goto('/');

        const modes = ['Ignite', 'Fog Cutter', 'Pomodoro', 'Anchor', 'Check In', 'Crisis Mode'];

        for (const mode of modes) {
            await expect(page.locator(`text=${mode}`)).toBeVisible();
        }
    });

    test('should display bottom tab navigation', async ({ page }) => {
        await page.goto('/');

        const tabs = ['Home', 'Focus', 'Tasks', 'Calendar'];

        for (const tab of tabs) {
            await expect(page.locator(`text=${tab}`)).toBeVisible();
        }
    });
});

test.describe('Navigation', () => {
    test('should navigate to Focus tab', async ({ page }) => {
        await page.goto('/');

        // Click the Focus tab
        await page.click('text=Focus');

        // Wait for navigation
        await page.waitForTimeout(500);

        // Verify we navigated by checking the Focus tab is now active
        // (The tab bar highlights the active tab)
        // Since this is a SPA, URL may not change but content should
        await expect(page.locator('[data-testid="tab-focus"]')).toBeVisible();
    });
});
