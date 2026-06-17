<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import logoApp from '@/assets/images/brand/Logo2.svg'

const route = useRoute()
const workspaceId = computed(() => String(route.params.workspaceId ?? 'red-moon'))

const reportItems = [
  {
    id: 'memory-limit',
    title: '유진의 기억 회귀 제한',
    setting: '초기 설정에서는 최대 10분 전으로 되돌릴 수 있습니다.',
    manuscript: '19화 원고에서는 하루 전 기억까지 되돌리는 장면이 등장합니다.',
  },
  {
    id: 'crown-owner',
    title: '침묵하는 왕관의 소유자',
    setting: '왕관은 왕실 금고에 봉인되어 있습니다.',
    manuscript: '19화에서는 민호가 왕관을 이미 소지한 상태로 등장합니다.',
  },
]
</script>

<template>
  <section class="conflict-report-page" aria-labelledby="conflict-report-title">
    <img class="conflict-report-page__logo" :src="logoApp" alt="UniverseKeeper UVK" />

    <header class="conflict-report-page__header">
      <RouterLink
        class="conflict-report-page__back"
        :to="`/workspaces/${workspaceId}`"
        aria-label="상세 보기로 돌아가기"
      >
        <span class="conflict-report-page__back-icon" aria-hidden="true"></span>
      </RouterLink>
      <h1 id="conflict-report-title" class="conflict-report-page__title">충돌 리포트</h1>
    </header>

    <article class="conflict-report-page__summary">
      <p class="conflict-report-page__meta">19화 · 침묵하는 왕관</p>
      <h2 class="conflict-report-page__summary-title">분석 완료</h2>
      <p class="conflict-report-page__summary-copy">
        설정과 원문 사이에서 충돌 2건을 발견했습니다.
      </p>
    </article>

    <section class="conflict-report-page__list-section" aria-label="충돌 항목">
      <h2 class="conflict-report-page__section-title">충돌 항목</h2>
      <ul class="conflict-report-page__list">
        <li v-for="item in reportItems" :key="item.id" class="conflict-report-card">
          <h3 class="conflict-report-card__title">{{ item.title }}</h3>
          <dl class="conflict-report-card__compare">
            <div>
              <dt>설정</dt>
              <dd>{{ item.setting }}</dd>
            </div>
            <div>
              <dt>원문</dt>
              <dd>{{ item.manuscript }}</dd>
            </div>
          </dl>
        </li>
      </ul>
    </section>
  </section>
</template>

<style scoped>
.conflict-report-page {
  min-height: 100dvh;
  padding: 20px 24px 40px;
  background: #fefefe;
  font-family: var(--font-family-base);
}

.conflict-report-page__logo {
  width: 106px;
  height: 50px;
  object-fit: contain;
}

.conflict-report-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 53px;
  margin-top: 30px;
  border-bottom: 1px solid #eaf1ff;
}

.conflict-report-page__back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  color: #111;
}

.conflict-report-page__back-icon {
  width: 17px;
  height: 17px;
  border-bottom: 2px solid currentColor;
  border-left: 2px solid currentColor;
  transform: rotate(45deg);
}

.conflict-report-page__title {
  margin: 0;
  color: #2d2d2d;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.conflict-report-page__summary {
  min-height: 140px;
  margin-top: 14px;
  padding: 18px 16px;
  background: #fefefe;
  border: 1px solid #e7e7ef;
  border-radius: 18px;
}

.conflict-report-page__meta {
  margin: 0;
  color: #6f7280;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0;
}

.conflict-report-page__summary-title {
  margin: 22px 0 0;
  color: #2d2d2d;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.conflict-report-page__summary-copy {
  margin: 13px 0 0;
  color: #d64545;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.conflict-report-page__list-section {
  margin-top: 24px;
}

.conflict-report-page__section-title {
  margin: 0;
  color: #2d2d2d;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.conflict-report-page__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 13px 0 0;
  padding: 0;
  list-style: none;
}

.conflict-report-card {
  padding: 17px 15px;
  background: #fefefe;
  border: 1px solid #e7e7ef;
  border-radius: 14px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.18);
}

.conflict-report-card__title {
  margin: 0;
  color: #2d2d2d;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.conflict-report-card__compare {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 14px 0 0;
}

.conflict-report-card__compare div {
  padding: 12px;
  background: #f3f9ff;
  border-radius: 10px;
}

.conflict-report-card__compare dt {
  margin: 0;
  color: var(--color-brand-blue);
  font-size: 12px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.conflict-report-card__compare dd {
  margin: 8px 0 0;
  color: #2d2d2d;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.45;
  letter-spacing: 0;
}
</style>
