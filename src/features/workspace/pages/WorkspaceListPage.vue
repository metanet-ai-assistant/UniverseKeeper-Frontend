<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import logoApp from '@/assets/images/brand/Logo2.svg'
import addIcon from '@/assets/images/icons/Add.png'
import checkmarkIcon from '@/assets/images/icons/Checkmark.png'
import errorIcon from '@/assets/images/icons/Error.png'
import { useAuthStore } from '@/features/auth/stores/authStore'
import {
  getKpiSummary,
  getWorkspaces,
  type KpiSummaryResponse,
  type WorkspaceListItemResponse,
} from '@/features/workspace/api/workspaceApi'
import type { WorkspaceDashboardStats, WorkspaceSummary } from '@/features/workspace/types'

const emptyDashboardStats: WorkspaceDashboardStats = {
  userName: '',
  totalWorks: 0,
  totalRequests: 0,
  mergeConflicts: 0,
}

const authStore = useAuthStore()
const router = useRouter()
const isLoggingOut = ref(false)
const isLoading = ref(true)
const loadError = ref('')
const dashboardStats = ref<WorkspaceDashboardStats>({ ...emptyDashboardStats })
const workspaces = ref<WorkspaceSummary[]>([])

const ownerName = computed(() => authStore.user?.user_name || '작가')
const greetingCopy = computed(
  () => `현재 ${dashboardStats.value.totalWorks}개 작품을 관리 중입니다.`,
)
const memberInfo = computed(() => {
  if (!authStore.user) {
    return ''
  }

  return `${authStore.user.email} · ${authStore.user.role}`
})

function progressPercent(conflictFreeCount: number, totalCount: number) {
  if (totalCount <= 0) {
    return 0
  }

  return Math.min(100, Math.round((conflictFreeCount / totalCount) * 100))
}

function mapDashboardStats(kpiSummary: KpiSummaryResponse): WorkspaceDashboardStats {
  return {
    userName: '',
    totalWorks: kpiSummary.total_works,
    totalRequests: kpiSummary.total_requests,
    mergeConflicts: kpiSummary.conflicted_episodes,
  }
}

function mapWorkspaceSummary(workspace: WorkspaceListItemResponse): WorkspaceSummary {
  const uncheckedIssueCount = Math.max(0, workspace.latest_version_conflict_count)

  return {
    id: String(workspace.work_id),
    title: workspace.title,
    genre: workspace.genre,
    episodeCount: workspace.episode_count,
    reviewStatus: uncheckedIssueCount > 0 ? 'unchecked' : 'complete',
    uncheckedIssueCount,
  }
}

function conflictFreeEpisodeCount(workspace: WorkspaceSummary) {
  return Math.max(0, workspace.episodeCount - workspace.uncheckedIssueCount)
}

async function loadWorkspaceDashboard() {
  isLoading.value = true
  loadError.value = ''

  try {
    const [kpiSummary, workspaceList] = await Promise.all([getKpiSummary(), getWorkspaces()])
    dashboardStats.value = mapDashboardStats(kpiSummary)
    workspaces.value = workspaceList.map(mapWorkspaceSummary)
  } catch {
    loadError.value = '작품 목록을 불러오지 못했습니다.'
    dashboardStats.value = { ...emptyDashboardStats }
    workspaces.value = []
  } finally {
    isLoading.value = false
  }
}

async function handleLogout() {
  if (isLoggingOut.value) {
    return
  }

  isLoggingOut.value = true

  try {
    await authStore.logoutCurrentSession()
    await router.push('/login')
  } finally {
    isLoggingOut.value = false
  }
}

onMounted(() => {
  void loadWorkspaceDashboard()
})
</script>

<template>
  <section class="workspace-list-page" aria-labelledby="workspace-list-title">
    <RouterLink class="workspace-list-page__logo-link" to="/workspaces" aria-label="워크스페이스로 이동">
      <img class="workspace-list-page__logo" :src="logoApp" alt="UniverseKeeper UVK" />
    </RouterLink>

    <section class="workspace-list-page__greeting" aria-label="작가 정보">
      <div>
        <h1 id="workspace-list-title" class="workspace-list-page__greeting-title">
          안녕하세요, {{ ownerName }} 작가님
        </h1>
        <p class="workspace-list-page__greeting-copy">{{ greetingCopy }}</p>
        <p v-if="memberInfo" class="workspace-list-page__member">{{ memberInfo }}</p>
      </div>
      <button
        class="workspace-list-page__logout"
        type="button"
        :disabled="isLoggingOut"
        @click="handleLogout"
      >
        {{ isLoggingOut ? '로그아웃 중' : '로그아웃' }}
      </button>
    </section>

    <dl class="workspace-list-page__stats" aria-label="작품 통계">
      <div class="workspace-list-page__stat-card">
        <dt>{{ dashboardStats.totalWorks }}</dt>
        <dd>전체 작품</dd>
      </div>
      <div class="workspace-list-page__stat-card">
        <dt>{{ dashboardStats.totalRequests }}</dt>
        <dd>총 요청 수</dd>
      </div>
      <div class="workspace-list-page__stat-card">
        <dt>{{ dashboardStats.mergeConflicts }}</dt>
        <dd>미검토 충돌</dd>
      </div>
    </dl>

    <div class="workspace-list-page__section-header">
      <h2 class="workspace-list-page__section-title">{{ ownerName }}님의 워크스페이스</h2>
      <RouterLink class="workspace-list-page__new-link" to="/workspaces/new">
        <img class="workspace-list-page__new-icon" :src="addIcon" alt="" aria-hidden="true" />
        <span>새 작품</span>
      </RouterLink>
    </div>

    <p v-if="isLoading" class="workspace-list-page__state">작품 목록을 불러오는 중입니다.</p>
    <p v-else-if="loadError" class="workspace-list-page__state workspace-list-page__state--error">
      {{ loadError }}
    </p>
    <p v-else-if="workspaces.length === 0" class="workspace-list-page__state">
      아직 등록된 작품이 없습니다.
    </p>

    <ul v-else class="workspace-list-page__list" aria-label="워크스페이스 목록">
      <li v-for="workspace in workspaces" :key="workspace.id" class="workspace-list-page__item">
        <RouterLink class="workspace-card" :to="`/workspaces/${workspace.id}`">
          <div class="workspace-card__topline">
            <h3 class="workspace-card__title">{{ workspace.title }}</h3>
            <span
              v-if="workspace.reviewStatus === 'complete'"
              class="workspace-card__status workspace-card__status--complete"
            >
              <img
                class="workspace-card__status-icon"
                :src="checkmarkIcon"
                alt=""
                aria-hidden="true"
              />
              검토 완료
            </span>
            <span v-else class="workspace-card__status workspace-card__status--unchecked">
              <img
                class="workspace-card__warning-icon"
                :src="errorIcon"
                alt=""
                aria-hidden="true"
              />
              미검토 {{ workspace.uncheckedIssueCount }}건
            </span>
          </div>

          <p class="workspace-card__meta">{{ workspace.genre }} · {{ workspace.episodeCount }}화</p>

          <div class="workspace-card__progress" aria-hidden="true">
            <span
              class="workspace-card__progress-value"
              :style="{
                width: `${progressPercent(conflictFreeEpisodeCount(workspace), workspace.episodeCount)}%`,
              }"
            ></span>
          </div>

          <p class="workspace-card__approval">총 회차 수 {{ workspace.episodeCount }}회</p>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.workspace-list-page {
  min-height: 100dvh;
  padding: 20px 24px 40px;
  background: #fefefe;
  font-family: var(--font-family-base);
}

.workspace-list-page__logo {
  width: 106px;
  height: 50px;
  object-fit: contain;
}

.workspace-list-page__logo-link {
  display: inline-flex;
  width: 106px;
  height: 50px;
}

.workspace-list-page__greeting {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  min-height: 91px;
  margin-top: 24px;
  padding: 21px 19px 18px;
  background: #fefefe;
  border: 1px solid #e7e7ef;
  border-radius: 18px;
}

.workspace-list-page__greeting-title {
  margin: 0;
  color: #2d2d2d;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.workspace-list-page__greeting-copy {
  margin: 11px 0 0;
  color: #6f7280;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0;
}

.workspace-list-page__member {
  margin: 6px 0 0;
  color: #828797;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0;
}

.workspace-list-page__logout {
  margin-top: 3px;
  padding: 0;
  color: #828797;
  background: transparent;
  border: 0;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0;
  cursor: pointer;
}

.workspace-list-page__logout:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.workspace-list-page__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 22px 0 0;
}

.workspace-list-page__stat-card {
  min-height: 80px;
  padding: 17px 14px 13px;
  background: #fefefe;
  border: 1px solid #e7e7ef;
  border-radius: 14px;
}

.workspace-list-page__stat-card dt {
  margin: 0;
  color: var(--color-brand-lime);
  font-size: 22px;
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: 0;
}

.workspace-list-page__stat-card dd {
  margin: 12px 0 0;
  color: #6f7280;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0;
}

.workspace-list-page__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 25px;
}

.workspace-list-page__section-title {
  margin: 0;
  color: #2d2d2d;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.workspace-list-page__new-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--color-brand-blue);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0;
  text-decoration: none;
  white-space: nowrap;
}

.workspace-list-page__new-icon {
  width: 21px;
  height: 21px;
  object-fit: contain;
}

.workspace-list-page__state {
  margin: 16px 0 0;
  padding: 18px 14px;
  color: #6f7280;
  background: #fefefe;
  border: 1px solid #e7e7ef;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: 0;
  text-align: center;
}

.workspace-list-page__state--error {
  color: #ff3131;
}

.workspace-list-page__list {
  display: flex;
  flex-direction: column;
  gap: 11px;
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
}

.workspace-card {
  display: block;
  min-height: 120px;
  padding: 18px 14px 15px;
  background: #fefefe;
  border: 1px solid #e7e7ef;
  border-radius: 14px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.25);
  text-decoration: none;
}

.workspace-card__topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.workspace-card__title {
  min-width: 0;
  margin: 0;
  color: #2d2d2d;
  overflow: hidden;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workspace-card__status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  min-height: 24px;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0;
}

.workspace-card__status--complete {
  color: #65e645;
}

.workspace-card__status--unchecked {
  color: #ff3131;
}

.workspace-card__status-icon,
.workspace-card__warning-icon {
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  object-fit: contain;
}

.workspace-card__meta {
  margin: 16px 0 0;
  color: #6f7280;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0;
}

.workspace-card__progress {
  position: relative;
  height: 7px;
  margin-top: 13px;
  overflow: hidden;
  background: var(--color-brand-blue);
  border-radius: 999px;
}

.workspace-card__progress-value {
  display: block;
  height: 100%;
  background: var(--color-brand-lime);
  border-radius: inherit;
}

.workspace-card__approval {
  margin: 11px 0 0;
  color: #6f7280;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0;
}
</style>
