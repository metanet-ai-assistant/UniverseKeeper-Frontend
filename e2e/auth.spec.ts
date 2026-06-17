import { expect, test, type Page } from '@playwright/test'

async function mockAuthenticatedUser(page: Page) {
  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user_id: 1,
        email: 'user@example.com',
        user_name: '전찬혁',
        role: 'user',
      }),
    })
  })

  await page.addInitScript(() => {
    localStorage.setItem('uvk.accessToken', 'access-token')
    localStorage.setItem('uvk.refreshToken', 'refresh-token')
    localStorage.setItem('uvk.tokenType', 'bearer')
  })
}

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
  await expect(page.getByText('*인증번호를 입력해주세요.')).toBeVisible()
  await expect(page.getByText('*영어, 숫자, 특수문자 사용, 8자리 이상')).toBeVisible()
  await expect(page.getByText('*비밀번호가 일치하지 않습니다.')).toBeVisible()
  await expect(page.getByText('*닉네임을 입력해주세요.')).toBeVisible()
})

test('moves from find password to password reset state', async ({ page }) => {
  await page.setViewportSize({ width: 402, height: 874 })
  await page.route('**/api/v1/auth/email/send', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'ok' }),
    })
  })
  await page.goto('/findpw')

  await page.getByPlaceholder('이메일(아이디)을 입력해주세요').fill('user@example.com')
  await page.getByRole('button', { name: '인증번호 전송' }).click()

  await expect(page.getByRole('heading', { name: '비밀번호 재설정' })).toBeVisible()
  await expect(page.getByPlaceholder('인증번호를 입력해주세요')).toBeVisible()
  await expect(page.getByPlaceholder('새로운 비밀번호를 입력')).toBeVisible()
  await expect(page.getByPlaceholder('비밀번호를 재확인')).toBeVisible()
})

test('moves from workspace list to a single new workspace page', async ({ page }) => {
  await page.setViewportSize({ width: 402, height: 874 })
  await mockAuthenticatedUser(page)
  await page.goto('/workspaces')

  await expect(page.getByRole('heading', { name: /전찬혁 작가님/ })).toBeVisible()
  await expect(page.getByText('user@example.com · user')).toBeVisible()
  await expect(page.getByText('별이 꺼진 후의 기록작')).toBeVisible()

  await page.getByRole('link', { name: /새 작품/ }).click()
  await expect(page).toHaveURL(/\/workspaces\/new$/)
  await expect(page.getByRole('heading', { name: '새 작품 만들기' })).toBeVisible()

  await expect(page.getByPlaceholder('작품 설정을 입력해주세요.')).toBeVisible()

  await page.getByRole('button', { name: /원고 업로드/ }).click()
  await expect(page.getByRole('button', { name: /원고 업로드/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(page.getByText('원고를 업로드하거나 붙여넣으세요')).toBeVisible()

  await page.getByRole('button', { name: /직접 입력/ }).click()
  await expect(page.getByPlaceholder('작품 설정을 입력해주세요.')).toBeVisible()
  await expect(page.getByRole('button', { name: '작품 생성' })).toBeVisible()
})

test('moves from workspace list to workspace detail states', async ({ page }) => {
  await page.setViewportSize({ width: 402, height: 874 })
  await mockAuthenticatedUser(page)
  await page.goto('/workspaces')

  await page.getByRole('link', { name: /붉은 달의 기억/ }).click()

  await expect(page).toHaveURL(/\/workspaces\/red-moon$/)
  await expect(page.getByRole('heading', { name: '상세 보기' })).toBeVisible()
  await expect(page.getByText('침묵하는 왕관')).toBeVisible()
  await expect(page.getByText('충돌 발생')).toBeVisible()

  await page.getByRole('tab', { name: '초기 설정' }).click()

  await expect(page.getByText('설정 보기')).toBeVisible()
  await expect(page.getByText('# 초기 설정 - 붉은 달의 기억')).toBeVisible()

  await page.getByRole('button', { name: /그래프 보기/ }).click()

  await expect(page.getByRole('dialog', { name: 'Graph' })).toBeVisible()

  await page.getByRole('button', { name: '그래프 닫기' }).click()
  await expect(page.getByRole('dialog', { name: 'Graph' })).toBeHidden()
})

test('moves from episode upload to analysis and dummy conflict report', async ({ page }) => {
  await page.setViewportSize({ width: 402, height: 874 })
  await mockAuthenticatedUser(page)
  await page.goto('/workspaces/red-moon/episodes/new')

  await expect(page.getByRole('heading', { name: '회차 업로드' })).toBeVisible()
  await expect(page.getByText('원고를 업로드하거나 붙여넣으세요')).toBeVisible()

  await page.getByRole('radio', { name: /직접 입력/ }).click()
  await expect(page.getByPlaceholder('작품 설정을 입력해주세요.')).toBeVisible()

  await page.getByRole('radio', { name: /원고 업로드/ }).click()
  await expect(page.getByText('TXT · MD 파일, 최대 10MB')).toBeVisible()

  await page.getByRole('link', { name: '분석 시작' }).click()

  await expect(page).toHaveURL(/\/workspaces\/red-moon\/episodes\/analyzing$/)
  await expect(page.getByRole('heading', { name: '19화 분석 중' })).toBeVisible()
  await expect(page.getByText('설정과 원문을 비교하고 있습니다.')).toBeVisible()
  await expect(page.getByText('%')).toHaveCount(0)

  await expect(page).toHaveURL(/\/workspaces\/red-moon\/reports\/mock-episode-19$/, {
    timeout: 7000,
  })
  await expect(page.getByRole('heading', { name: '충돌 리포트' })).toBeVisible()
  await expect(page.getByText('유진의 기억 회귀 제한')).toBeVisible()
})
