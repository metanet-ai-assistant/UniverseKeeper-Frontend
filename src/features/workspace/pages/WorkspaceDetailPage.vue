<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import logoApp from '@/assets/images/brand/Logo2.svg'
import editIcon from '@/assets/images/icons/edit.png'
import graphIcon from '@/assets/images/icons/graph.png'
import { mockWorkspaceDetails } from '@/features/workspace/mocks/workspaces'
import type { WorkspaceDetail, WorkspaceDetailTab } from '@/features/workspace/types'

const route = useRoute()
const selectedTab = ref<WorkspaceDetailTab>('episodes')
const isGraphOpen = ref(false)
const defaultWorkspace = mockWorkspaceDetails[0] as WorkspaceDetail

const workspace = computed<WorkspaceDetail>(() => {
  const workspaceId = String(route.params.workspaceId ?? '')

  return (
    mockWorkspaceDetails.find((workspaceDetail) => workspaceDetail.id === workspaceId) ??
    defaultWorkspace
  )
})

function selectTab(tab: WorkspaceDetailTab) {
  selectedTab.value = tab
}

function openGraph() {
  isGraphOpen.value = true
}

function closeGraph() {
  isGraphOpen.value = false
}
</script>

<template>
  <section class="workspace-detail-page" aria-labelledby="workspace-detail-title">
    <img class="workspace-detail-page__logo" :src="logoApp" alt="UniverseKeeper UVK" />

    <header class="workspace-detail-page__header">
      <RouterLink
        class="workspace-detail-page__back"
        to="/workspaces"
        aria-label="작품 목록으로 돌아가기"
      >
        <span class="workspace-detail-page__back-icon" aria-hidden="true"></span>
      </RouterLink>
      <h1 id="workspace-detail-title" class="workspace-detail-page__title">상세 보기</h1>
    </header>

    <article class="workspace-detail-page__summary">
      <div>
        <p class="workspace-detail-page__meta">
          {{ workspace.genre }} · 총 {{ workspace.episodeCount }}화
        </p>
        <h2 class="workspace-detail-page__work-title">{{ workspace.title }}</h2>
        <p class="workspace-detail-page__setting-count">설정 {{ workspace.settingCount }}개</p>
      </div>
      <span class="workspace-detail-page__conflict-pill">충돌 {{ workspace.conflictCount }}건</span>
    </article>

    <div class="workspace-detail-page__tabs" role="tablist" aria-label="상세 보기 탭">
      <button
        class="workspace-detail-page__tab"
        :class="{ 'workspace-detail-page__tab--selected': selectedTab === 'episodes' }"
        type="button"
        role="tab"
        :aria-selected="selectedTab === 'episodes'"
        @click="selectTab('episodes')"
      >
        회차
      </button>
      <button
        class="workspace-detail-page__tab"
        :class="{ 'workspace-detail-page__tab--selected': selectedTab === 'settings' }"
        type="button"
        role="tab"
        :aria-selected="selectedTab === 'settings'"
        @click="selectTab('settings')"
      >
        초기 설정
      </button>
    </div>

    <section v-if="selectedTab === 'episodes'" class="workspace-detail-page__episodes">
      <div class="workspace-detail-page__section-header">
        <h2 class="workspace-detail-page__section-title">회차 리스트</h2>
        <RouterLink
          class="workspace-detail-page__new-episode"
          :to="`/workspaces/${workspace.id}/episodes/new`"
        >
          + 새 회차
        </RouterLink>
      </div>

      <ul class="workspace-detail-page__episode-list" aria-label="회차 리스트">
        <li
          v-for="episode in workspace.episodes"
          :key="episode.id"
          class="workspace-detail-page__episode-item"
        >
          <button class="episode-card" type="button">
            <span class="episode-card__number">{{ episode.number }}화</span>
            <span class="episode-card__title">{{ episode.title }}</span>
            <span
              class="episode-card__status"
              :class="{
                'episode-card__status--conflict': episode.conflictStatus === 'conflict',
                'episode-card__status--clear': episode.conflictStatus === 'clear',
              }"
            >
              {{ episode.conflictStatus === 'conflict' ? '충돌 발생' : '충돌 없음' }}
            </span>
            <span class="episode-card__chevron" aria-hidden="true">›</span>
          </button>
        </li>
      </ul>
    </section>

    <section v-else class="settings-panel" aria-label="초기 설정">
      <header class="settings-panel__header">
        <h2 class="settings-panel__title">설정 보기</h2>
        <div class="settings-panel__actions">
          <button
            class="settings-panel__action settings-panel__action--graph"
            type="button"
            @click="openGraph"
          >
            그래프 보기
            <img class="settings-panel__action-icon" :src="graphIcon" alt="" aria-hidden="true" />
          </button>
          <button class="settings-panel__action settings-panel__action--edit" type="button">
            수정 및 그래프 재생성
            <img class="settings-panel__action-icon" :src="editIcon" alt="" aria-hidden="true" />
          </button>
        </div>
      </header>
      <div class="settings-panel__divider" aria-hidden="true"></div>
      <pre class="settings-panel__content">{{ workspace.initialSetting }}</pre>
    </section>

    <div
      v-if="isGraphOpen"
      class="graph-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="graph-modal-title"
    >
      <section class="graph-modal__panel">
        <h2 id="graph-modal-title" class="graph-modal__title">Graph</h2>
        <button
          class="graph-modal__close"
          type="button"
          aria-label="그래프 닫기"
          @click="closeGraph"
        >
          ×
        </button>
        <div class="graph-modal__canvas" aria-label="그래프 미리보기"></div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.workspace-detail-page {
  position: relative;
  min-height: 100dvh;
  padding: 20px 24px 14px;
  background: #fefefe;
  font-family: var(--font-family-base);
}

.workspace-detail-page__logo {
  width: 106px;
  height: 50px;
  object-fit: contain;
}

.workspace-detail-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 53px;
  margin-top: 30px;
  border-bottom: 1px solid #eaf1ff;
}

.workspace-detail-page__back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  color: #111;
}

.workspace-detail-page__back-icon {
  width: 17px;
  height: 17px;
  border-bottom: 2px solid currentColor;
  border-left: 2px solid currentColor;
  transform: rotate(45deg);
}

.workspace-detail-page__title {
  margin: 0;
  color: #2d2d2d;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.workspace-detail-page__summary {
  position: relative;
  min-height: 118px;
  margin-top: 10px;
  padding: 14px 16px 17px;
  background: #fefefe;
  border: 1px solid #e7e7ef;
  border-radius: 18px;
}

.workspace-detail-page__meta {
  margin: 0;
  color: #6f7280;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0;
}

.workspace-detail-page__work-title {
  max-width: 100%;
  margin: 20px 0 0;
  color: #2d2d2d;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.workspace-detail-page__setting-count {
  margin: 12px 0 0;
  color: var(--color-brand-blue);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0;
}

.workspace-detail-page__conflict-pill {
  position: absolute;
  top: 14px;
  right: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  min-width: 60px;
  min-height: 27px;
  padding: 0 11px;
  color: #d64545;
  background: #fdecec;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0;
}

.workspace-detail-page__tabs {
  display: flex;
  gap: 7px;
  margin-top: 11px;
}

.workspace-detail-page__tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 63px;
  min-height: 44px;
  padding: 0 18px;
  color: #6f7280;
  background: #fefefe;
  border: 1px solid #6f7280;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0;
  cursor: pointer;
}

.workspace-detail-page__tab--selected {
  color: var(--color-brand-blue);
  background: #ddedff;
  border-color: var(--color-brand-blue);
}

.workspace-detail-page__tab:focus-visible,
.settings-panel__action:focus-visible,
.graph-modal__close:focus-visible {
  outline: none;
}

.workspace-detail-page__episodes {
  margin-top: 17px;
}

.workspace-detail-page__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 5px;
}

.workspace-detail-page__section-title {
  margin: 0;
  color: #2d2d2d;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.workspace-detail-page__new-episode {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0;
  color: var(--color-brand-blue);
  background: transparent;
  border: 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0;
  cursor: pointer;
  text-decoration: none;
}

.workspace-detail-page__episode-list {
  display: flex;
  flex-direction: column;
  gap: 11px;
  margin: 18px 0 0;
  padding: 0 5px;
  list-style: none;
}

.episode-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  min-height: 82px;
  padding: 15px 54px 14px 14px;
  background: #fefefe;
  border: 1px solid #e7e7ef;
  border-radius: 18px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  text-align: left;
}

.episode-card__number {
  color: var(--color-brand-blue);
  font-size: 12px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.episode-card__title {
  margin-top: 8px;
  color: #2d2d2d;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.episode-card__status {
  position: absolute;
  top: 13px;
  right: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  min-height: 27px;
  padding: 0 11px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0;
}

.episode-card__status--conflict {
  color: #d64545;
  background: #fdecec;
}

.episode-card__status--clear {
  color: #1f9d67;
  background: #e8f7f0;
}

.episode-card__chevron {
  position: absolute;
  right: 16px;
  bottom: 16px;
  color: #6f7280;
  font-size: 25px;
  font-weight: 500;
  line-height: 1;
}

.settings-panel {
  height: 509px;
  margin-top: 8px;
  padding: 16px 14px 0;
  background: #fefefe;
  border: 1px solid #e7e7ef;
  border-radius: 18px;
}

.settings-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.settings-panel__title {
  margin: 0;
  color: #2d2d2d;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
  white-space: nowrap;
}

.settings-panel__actions {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

.settings-panel__action {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  min-height: 28px;
  padding: 0;
  background: transparent;
  border: 0;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0;
  cursor: pointer;
  white-space: nowrap;
}

.settings-panel__action--graph {
  color: #65e645;
}

.settings-panel__action--edit {
  color: var(--color-brand-blue);
}

.settings-panel__action-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.settings-panel__divider {
  height: 1px;
  margin: 8px 0 4px;
  background-image: linear-gradient(to right, var(--color-brand-lime) 0 8px, transparent 8px 16px);
  background-repeat: repeat-x;
}

.settings-panel__content {
  height: 450px;
  margin: 0;
  padding: 8px 10px;
  overflow-y: auto;
  color: #2d2d2d;
  background: #f3f9ff;
  border-radius: 6px;
  font-family: var(--font-family-base);
  font-size: 10px;
  font-weight: 500;
  line-height: 1.45;
  letter-spacing: 0;
  white-space: pre-wrap;
}

.settings-panel__content::-webkit-scrollbar {
  width: 8px;
}

.settings-panel__content::-webkit-scrollbar-track {
  background: transparent;
}

.settings-panel__content::-webkit-scrollbar-thumb {
  background: #6f7280;
  border-radius: 999px;
}

.graph-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 80px;
  background: rgba(0, 0, 0, 0.4);
  z-index: 10;
}

.graph-modal__panel {
  position: relative;
  width: min(360px, calc(100vw - 42px));
  min-height: 714px;
  padding: 18px 20px 20px;
  background: #fff;
  border-radius: 8px;
}

.graph-modal__title {
  margin: 0;
  color: #000;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0;
  text-align: center;
}

.graph-modal__close {
  position: absolute;
  top: 17px;
  right: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  color: #444;
  background: transparent;
  border: 0;
  font-size: 34px;
  font-weight: 600;
  line-height: 0.7;
  cursor: pointer;
}

.graph-modal__canvas {
  height: 628px;
  margin-top: 24px;
  background: #2d2d2d;
  border-radius: 8px;
}

@media (max-width: 380px) {
  .settings-panel__actions {
    gap: 3px;
  }

  .settings-panel__action {
    font-size: 9px;
  }
}
</style>
