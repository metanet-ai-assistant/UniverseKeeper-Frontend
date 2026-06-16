<script setup lang="ts">
import logoApp from '@/assets/images/brand/Logo2.svg'
import addIcon from '@/assets/images/icons/Add.png'
import checkmarkIcon from '@/assets/images/icons/Checkmark.png'
import errorIcon from '@/assets/images/icons/Error.png'
import { mockWorkspaces, mockWorkspaceStats } from '@/features/workspace/mocks/workspaces'

function progressPercent(approvedCount: number, totalCount: number) {
  if (totalCount <= 0) {
    return 0
  }

  return Math.min(100, Math.round((approvedCount / totalCount) * 100))
}
</script>

<template>
  <section class="workspace-list-page" aria-labelledby="workspace-list-title">
    <img class="workspace-list-page__logo" :src="logoApp" alt="UniverseKeeper UVK" />

    <section class="workspace-list-page__greeting" aria-label="작가 정보">
      <div>
        <h1 id="workspace-list-title" class="workspace-list-page__greeting-title">
          안녕하세요, {{ mockWorkspaceStats.userName }} 작가님
        </h1>
        <p class="workspace-list-page__greeting-copy">현재 2개 작품을 관리 중입니다.</p>
      </div>
      <button class="workspace-list-page__logout" type="button">로그아웃</button>
    </section>

    <dl class="workspace-list-page__stats" aria-label="작품 통계">
      <div class="workspace-list-page__stat-card">
        <dt>{{ mockWorkspaceStats.totalWorks }}</dt>
        <dd>전체 작품</dd>
      </div>
      <div class="workspace-list-page__stat-card">
        <dt>{{ mockWorkspaceStats.totalRequests }}</dt>
        <dd>총 요청 수</dd>
      </div>
      <div class="workspace-list-page__stat-card">
        <dt>{{ mockWorkspaceStats.mergeConflicts }}</dt>
        <dd>미검토 충돌</dd>
      </div>
    </dl>

    <div class="workspace-list-page__section-header">
      <h2 class="workspace-list-page__section-title">
        {{ mockWorkspaceStats.userName.slice(1) }}님의 워크스페이스
      </h2>
      <RouterLink class="workspace-list-page__new-link" to="/workspaces/new">
        <img class="workspace-list-page__new-icon" :src="addIcon" alt="" aria-hidden="true" />
        <span>새 작품</span>
      </RouterLink>
    </div>

    <ul class="workspace-list-page__list" aria-label="워크스페이스 목록">
      <li v-for="workspace in mockWorkspaces" :key="workspace.id" class="workspace-list-page__item">
        <article class="workspace-card">
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
                width: `${progressPercent(workspace.approvedSettingCount, workspace.totalSettingCount)}%`,
              }"
            ></span>
          </div>

          <p class="workspace-card__approval">
            설정 승인 {{ workspace.approvedSettingCount }}/{{ workspace.totalSettingCount }}
          </p>
        </article>
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

.workspace-list-page__logout {
  margin-top: 3px;
  padding: 0;
  color: #828797;
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0;
  cursor: pointer;
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

.workspace-list-page__list {
  display: flex;
  flex-direction: column;
  gap: 11px;
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
}

.workspace-card {
  min-height: 120px;
  padding: 18px 14px 15px;
  background: #fefefe;
  border: 1px solid #e7e7ef;
  border-radius: 14px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.25);
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
