import { expect, test } from '@playwright/test'

test('shows the splash screen from the app root', async ({ page }) => {
  await page.setViewportSize({ width: 402, height: 874 })
  await page.goto('/')

  await expect(page).toHaveURL(/\/splash$/)
  await expect(page.getByRole('img', { name: 'UniverseKeeper UVK' })).toBeVisible()
  await expect(page.getByText('작가님의 세계가 무너지지 않도록')).toBeVisible()
  await expect(page.getByText('화면을 터치해주세요.')).toBeVisible()
})
