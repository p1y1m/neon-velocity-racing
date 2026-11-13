import { devices, expect, test } from '@playwright/test'

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

test.describe('mobile driving', () => {
  const iPhone = devices['iPhone 13']
  test.use({
    userAgent: iPhone.userAgent,
    deviceScaleFactor: iPhone.deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
    viewport: { width: 844, height: 390 },
    screen: { width: 844, height: 390 },
  })

  test('automatically accelerates while brake and nitro remain responsive', async ({ page }) => {
    await page.goto('./?test=mobile')
    await page.getByRole('button', { name: /enter the circuit/i }).click()
    await expect(page.getByLabel('Race HUD')).toBeVisible({ timeout: 5000 })

    const speed = page.locator('.speedometer strong')
    await expect.poll(async () => Number(await speed.textContent()), { timeout: 5000 }).toBeGreaterThan(55)
    const touch = await page.context().newCDPSession(page)

    const brake = page.getByRole('button', { name: 'BRAKE' })
    await expect(brake).toBeVisible()
    const brakeBox = await brake.boundingBox()
    expect(brakeBox).not.toBeNull()
    const speedBeforeBrake = Number(await speed.textContent())
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: brakeBox!.x + brakeBox!.width / 2, y: brakeBox!.y + brakeBox!.height / 2, id: 1 }] })
    await expect.poll(async () => Number(await speed.textContent()), { timeout: 3000 }).toBeLessThan(speedBeforeBrake - 5)
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })

    const speedAfterBrake = Number(await speed.textContent())
    await expect.poll(async () => Number(await speed.textContent()), { timeout: 3000 }).toBeGreaterThan(speedAfterBrake + 5)

    const nitro = page.getByRole('button', { name: 'NITRO' })
    const nitroBox = await nitro.boundingBox()
    expect(nitroBox).not.toBeNull()
    const nitroValue = page.locator('.meter').filter({ hasText: 'NITRO' }).locator('b')
    const nitroBefore = Number((await nitroValue.textContent())?.replace('%', ''))
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: nitroBox!.x + nitroBox!.width / 2, y: nitroBox!.y + nitroBox!.height / 2, id: 2 }] })
    await expect.poll(async () => Number((await nitroValue.textContent())?.replace('%', '')), { timeout: 3000 }).toBeLessThan(nitroBefore)
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  })
})
