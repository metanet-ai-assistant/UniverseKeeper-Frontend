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
  await expect(page.getByText('*영어, 숫자, 특수문자 사용, 8자리 이상')).toBeVisible()
  await expect(page.getByText('*비밀번호가 일치하지 않습니다.')).toBeVisible()
  await expect(page.getByText('*닉네임을 입력해주세요.')).toBeVisible()
})

test('moves from find password to password reset state', async ({ page }) => {
  await page.setViewportSize({ width: 402, height: 874 })
  await page.goto('/findpw')

  await page.getByPlaceholder('이메일(아이디)을 입력해주세요').fill('user@example.com')
  await page.getByRole('button', { name: '인증번호 전송' }).click()

  await expect(page.getByRole('heading', { name: '비밀번호 재설정' })).toBeVisible()
  await expect(page.getByPlaceholder('새로운 비밀번호를 입력')).toBeVisible()
  await expect(page.getByPlaceholder('비밀번호를 재확인')).toBeVisible()
})
