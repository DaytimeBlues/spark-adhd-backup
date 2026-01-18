import { test, expect } from '@playwright/test';

/**
 * Basic smoke tests for Spark ADHD web app (Original Aesthetic).
 */

test.describe('Home Screen', () => {
    test('should load without crash', async ({ page }) => {
        await page.goto('/');

        // Original App Title
        await expect(page.locator('text=Spark').first()).toBeVisible();
    });

    test('should display streak summary', async ({ page }) => {
        await page.goto('/');

        // Original App Streak Text format
        await expect(page.locator('text=streak').first()).toBeVisible();
    });

    test('should display mode cards', async ({ page }) => {
        await page.goto('/');

        // Original Mode Names
        await expect(page.locator('text=Ignite').first()).toBeVisible();
        await expect(page.locator('text=Pomodoro').first()).toBeVisible();
        await expect(page.locator('text=Anchor').first()).toBeVisible();
    });

    test('should display bottom tab navigation', async ({ page }) => {
        await page.goto('/');

        // Original Tab Labels
        await expect(page.locator('text=Home').first()).toBeVisible();
        await expect(page.locator('text=Calendar').first()).toBeVisible();
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
