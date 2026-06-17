import { expect, test, type Page } from '@playwright/test'

type WorkspaceRouteOptions = {
  kpi?: {
    total_works: number
    total_requests: number
    conflicted_episodes: number
  }
  workspaces?: Array<{
    work_id: number
    genre: string
    title: string
    episode_count: number
    latest_version_conflict_count: number
  }>
  detail?: {
    work_id: number
    genre: string
    title: string
    episode_count: number
    total_conflict_count: number
    original_text: string
  }
  episodes?: Array<{
    episode_no: number
    title: string
    is_conflict: boolean
  }>
}

async function mockAuthenticatedUser(page: Page, options: WorkspaceRouteOptions = {}) {
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

  await page.route('**/api/v1/kpi/summary', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        options.kpi ?? {
          total_works: 2,
          total_requests: 48,
          conflicted_episodes: 7,
        },
      ),
    })
  })

  await page.route('**/api/v1/workspace', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        options.workspaces ?? [
          {
            work_id: 11,
            genre: '판타지',
            title: '별이 꺼진 뒤의 기록자',
            episode_count: 7,
            latest_version_conflict_count: 0,
          },
          {
            work_id: 12,
            genre: '판타지',
            title: '붉은 달의 기억',
            episode_count: 19,
            latest_version_conflict_count: 2,
          },
        ],
      ),
    })
  })

  await page.route('**/api/v1/workspace/12', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        options.detail ?? {
          work_id: 12,
          genre: '판타지',
          title: '붉은 달 아래 기억을 되돌리는 소녀의 이야기',
          episode_count: 19,
          total_conflict_count: 2,
          original_text: '# 초기 설정 - 붉은 달의 기억',
        },
      ),
    })
  })

  await page.route('**/api/v1/12/episode', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        options.episodes ?? [
          {
            episode_no: 19,
            title: '침묵하는 왕관',
            is_conflict: true,
          },
          {
            episode_no: 18,
            title: '붉은 달의 경계',
            is_conflict: false,
          },
        ],
      ),
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

test('shows an empty workspace state when the API has no works', async ({ page }) => {
  await page.setViewportSize({ width: 402, height: 874 })
  await mockAuthenticatedUser(page, {
    kpi: {
      total_works: 0,
      total_requests: 0,
      conflicted_episodes: 0,
    },
    workspaces: [],
  })
  await page.goto('/workspaces')

  await expect(page.getByRole('heading', { name: /전찬혁 작가님/ })).toBeVisible()
  await expect(page.getByText('현재 0개 작품을 관리 중입니다.')).toBeVisible()
  await expect(page.getByText('아직 등록된 작품이 없습니다.')).toBeVisible()
  await expect(page.getByText('별이 꺼진 후의 기록작')).toHaveCount(0)
  await expect(page.getByText('붉은 달의 기억')).toHaveCount(0)
})

test('moves from workspace list to a single new workspace page', async ({ page }) => {
  await page.setViewportSize({ width: 402, height: 874 })
  await mockAuthenticatedUser(page)
  await page.route('**/api/v1/workspace/ingest', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        episode_id: 20,
        work_id: 12,
        file_name: 'workspace-setting.txt',
        chunks_count: 1,
        entities_count: 0,
        relationships_count: 0,
        loaded_success: true,
      }),
    })
  })
  await page.goto('/workspaces')

  await expect(page.getByRole('heading', { name: /전찬혁 작가님/ })).toBeVisible()
  await expect(page.getByText('user@example.com · user')).toBeVisible()
  await expect(page.getByText('별이 꺼진 뒤의 기록자')).toBeVisible()

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

  await page.locator('input[type="file"]').setInputFiles({
    name: 'workspace-setting.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('abc'),
  })
  await expect(page.getByText('workspace-setting.txt · 3B')).toBeVisible()
  await expect(page.getByText('파일 변경')).toBeVisible()

  await page.locator('input[name="workspace-title"]').fill('새 세계관')
  await page.locator('input[name="workspace-genre"]').fill('판타지')
  await page.getByRole('button', { name: '작품 생성' }).click()
  await expect(page).toHaveURL(/\/workspaces$/)
})

test('moves from workspace list to workspace detail states', async ({ page }) => {
  await page.setViewportSize({ width: 402, height: 874 })
  await mockAuthenticatedUser(page)
  await page.goto('/workspaces')

  await page.getByRole('link', { name: /붉은 달의 기억/ }).click()

  await expect(page).toHaveURL(/\/workspaces\/12$/)
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
  await page.route('**/api/v1/episode/ingest', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify('ok'),
    })
  })
  await page.goto('/workspaces/12/episodes/new')

  await expect(page.getByRole('heading', { name: '회차 업로드' })).toBeVisible()
  await expect(page.getByText('원고를 업로드하거나 붙여넣으세요')).toBeVisible()

  await page.getByRole('radio', { name: /직접 입력/ }).click()
  await expect(page.getByPlaceholder('작품 설정을 입력해주세요.')).toBeVisible()
  await page.getByPlaceholder('작품 설정을 입력해주세요.').fill('새 회차 본문입니다.')

  await page.getByRole('radio', { name: /원고 업로드/ }).click()
  await expect(page.getByText('TXT · MD 파일, 최대 10MB')).toBeVisible()
  await page.locator('input[type="file"]').setInputFiles({
    name: 'episode-20.md',
    mimeType: 'text/markdown',
    buffer: Buffer.from('abc'),
  })
  await expect(page.getByText('episode-20.md · 3B')).toBeVisible()

  await page.getByRole('radio', { name: /직접 입력/ }).click()
  await page.getByRole('button', { name: '분석 시작' }).click()

  await expect(page).toHaveURL(/\/workspaces\/12\/episodes\/analyzing$/)
  await expect(page.getByRole('heading', { name: '19화 분석 중' })).toBeVisible()
  await expect(page.getByText('설정과 원문을 비교하고 있습니다.')).toBeVisible()
  await expect(page.getByText('%')).toHaveCount(0)

  await expect(page).toHaveURL(/\/workspaces\/12\/reports\/mock-episode-19$/, {
    timeout: 7000,
  })
  await expect(page.getByRole('heading', { name: '충돌 리포트' })).toBeVisible()
  await expect(page.getByText('유진의 기억 회귀 제한')).toBeVisible()
})
