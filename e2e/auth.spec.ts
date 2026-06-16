import { expect, test } from '@playwright/test'

test('moves from splash to login and auth subpages', async ({ page }) => {
  await page.setViewportSize({ width: 402, height: 874 })
  await page.goto('/')

  await expect(page).toHaveURL(/\/splash$/)
  await expect(page.getByText('화면을 터치해주세요.')).toBeVisible()

  await page.getByText('화면을 터치해주세요.').click()
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible()

  await page.getByRole('link', { name: '회원가입' }).click()
  await expect(page).toHaveURL(/\/join$/)
  await expect(page.getByRole('heading', { name: '회원가입' })).toBeVisible()

  await page.goto('/login')
  await page.getByRole('link', { name: '비밀번호 찾기' }).click()
  await expect(page).toHaveURL(/\/findpw$/)
  await expect(page.getByRole('heading', { name: '비밀번호 찾기' })).toBeVisible()
})

test('shows join error messages after submit', async ({ page }) => {
  await page.setViewportSize({ width: 402, height: 874 })
  await page.goto('/join')

  await page.getByRole('button', { name: '회원가입' }).click()

  await expect(page.getByText('*이메일 형식이 아닙니다.')).toBeVisible()
  await expect(page.getByText('*인증번호가 틀렸습니다.')).toBeVisible()
  await expect(page.getByText('*비밀번호가 일치하지 않습니다.')).toBeVisible()
})
