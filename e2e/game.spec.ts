import { expect, test } from '@playwright/test'

test('loads, starts, pauses and resumes the game', async ({ page }) => {
  await page.goto('./?test=1')
  await expect(page.locator('h1')).toContainText('VELOCITY')
  await page.getByRole('button', { name: /enter the circuit/i }).click()
  // Reaching the HUD is the reliable signal that the countdown completed.
  await expect(page.getByLabel('Race HUD')).toBeVisible({ timeout: 5000 })
  await page.keyboard.press('Escape')
  await expect(page.getByRole('heading', { name: 'PAUSED' })).toBeVisible()
  await page.getByRole('button', { name: 'RESUME' }).click()
  await expect(page.getByLabel('Race HUD')).toBeVisible()
})

test('persists settings after reload', async ({ page }) => {
  await page.goto('./?test=1')
  await page.getByRole('button', { name: 'SETTINGS' }).click()
  await page.getByRole('button', { name: 'low' }).click()
  await page.getByRole('button', { name: /apply/i }).click()
  await page.reload()
  await page.getByRole('button', { name: 'SETTINGS' }).click()
  await expect(page.getByRole('button', { name: 'low' })).toHaveClass(/active/)
})
