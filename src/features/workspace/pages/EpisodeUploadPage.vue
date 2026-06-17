<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import logoApp from '@/assets/images/brand/Logo2.svg'
import uploadIcon from '@/assets/images/icons/Upload.png'

type EpisodeInputMode = 'manual' | 'upload'

const route = useRoute()
const selectedMode = ref<EpisodeInputMode>('upload')
const episodeNumber = ref('19')
const episodeTitle = ref('침묵하는 왕관')
const settingText = ref('')

const workspaceId = computed(() => String(route.params.workspaceId ?? 'red-moon'))

const analysisPath = computed(() => `/workspaces/${workspaceId.value}/episodes/analyzing`)

const inputModes: Array<{
  id: EpisodeInputMode
  title: string
  description: string
}> = [
  {
    id: 'manual',
    title: '직접 입력',
    description: '빠르게 설정 작성',
  },
  {
    id: 'upload',
    title: '원고 업로드',
    description: 'AI가 설정 추출',
  },
]

function selectMode(mode: EpisodeInputMode) {
  selectedMode.value = mode
}
</script>

<template>
  <section class="episode-upload-page" aria-labelledby="episode-upload-title">
    <img class="episode-upload-page__logo" :src="logoApp" alt="UniverseKeeper UVK" />

    <header class="episode-upload-page__header">
      <RouterLink
        class="episode-upload-page__back"
        :to="`/workspaces/${workspaceId}`"
        aria-label="상세 보기로 돌아가기"
      >
        <span class="episode-upload-page__back-icon" aria-hidden="true"></span>
      </RouterLink>
      <h1 id="episode-upload-title" class="episode-upload-page__title">회차 업로드</h1>
    </header>

    <form class="episode-upload-page__form">
      <div class="episode-upload-page__field-row">
        <label class="episode-upload-page__field episode-upload-page__field--episode">
          <span class="episode-upload-page__label">회차</span>
          <input
            v-model="episodeNumber"
            class="episode-upload-page__input"
            name="episode-number"
            type="text"
          />
        </label>

        <label class="episode-upload-page__field">
          <span class="episode-upload-page__label">제목</span>
          <input
            v-model="episodeTitle"
            class="episode-upload-page__input"
            name="episode-title"
            type="text"
          />
        </label>
      </div>

      <div class="episode-upload-page__mode-list" role="radiogroup" aria-label="회차 입력 방식">
        <button
          v-for="mode in inputModes"
          :key="mode.id"
          class="episode-upload-page__mode-button"
          :class="{ 'episode-upload-page__mode-button--selected': selectedMode === mode.id }"
          type="button"
          role="radio"
          :aria-checked="selectedMode === mode.id"
          @click="selectMode(mode.id)"
        >
          <span class="episode-upload-page__radio" aria-hidden="true"></span>
          <span class="episode-upload-page__mode-title">{{ mode.title }}</span>
          <span class="episode-upload-page__mode-description">{{ mode.description }}</span>
        </button>
      </div>

      <label v-if="selectedMode === 'manual'" class="episode-upload-page__manual-field">
        <span class="episode-upload-page__visually-hidden">작품 설정</span>
        <textarea
          v-model="settingText"
          class="episode-upload-page__textarea"
          name="episode-setting"
          placeholder="작품 설정을 입력해주세요."
          rows="6"
        ></textarea>
      </label>

      <div v-else class="episode-upload-page__upload-zone">
        <img class="episode-upload-page__upload-icon" :src="uploadIcon" alt="" aria-hidden="true" />
        <p class="episode-upload-page__upload-title">원고를 업로드하거나 붙여넣으세요</p>
        <p class="episode-upload-page__upload-copy">TXT · MD 파일, 최대 10MB</p>
        <label class="episode-upload-page__file-button">
          파일 선택
          <input type="file" accept=".txt,.md" />
        </label>
      </div>

      <section class="episode-upload-page__checks" aria-label="검사 항목">
        <h2 class="episode-upload-page__checks-title">검사 항목</h2>
        <ul class="episode-upload-page__check-list">
          <li>인물 속성 충돌</li>
          <li>시간선 충돌</li>
          <li>캐릭터 지식 충돌</li>
        </ul>
      </section>

      <RouterLink class="episode-upload-page__submit" :to="analysisPath">분석 시작</RouterLink>
    </form>
  </section>
</template>

<style scoped>
.episode-upload-page {
  min-height: 100dvh;
  padding: 20px 24px 52px;
  background: #fefefe;
  font-family: var(--font-family-base);
}

.episode-upload-page__logo {
  width: 106px;
  height: 50px;
  object-fit: contain;
}

.episode-upload-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 53px;
  margin-top: 30px;
  border-bottom: 1px solid #eaf1ff;
}

.episode-upload-page__back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  color: #111;
}

.episode-upload-page__back-icon {
  width: 17px;
  height: 17px;
  border-bottom: 2px solid currentColor;
  border-left: 2px solid currentColor;
  transform: rotate(45deg);
}

.episode-upload-page__title {
  margin: 0;
  color: #2d2d2d;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.episode-upload-page__form {
  display: flex;
  flex-direction: column;
  padding-top: 20px;
}

.episode-upload-page__field-row {
  display: flex;
  gap: 10px;
}

.episode-upload-page__field {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.episode-upload-page__field--episode {
  width: 54px;
  flex: 0 0 auto;
}

.episode-upload-page__label {
  color: #6f7280;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0;
}

.episode-upload-page__input {
  height: 52px;
  color: #a0a3ad;
  background: #fefefe;
  border: 1px solid #e7e7ef;
  border-radius: 14px;
  outline: none;
  font-family: var(--font-family-base);
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0;
}

.episode-upload-page__field--episode .episode-upload-page__input {
  padding: 0;
  text-align: center;
}

.episode-upload-page__field:not(.episode-upload-page__field--episode) {
  width: 116px;
}

.episode-upload-page__field:not(.episode-upload-page__field--episode) .episode-upload-page__input {
  padding: 0 18px;
}

.episode-upload-page__mode-list {
  display: grid;
  grid-template-columns: repeat(2, 164px);
  gap: 10px;
  width: 338px;
  margin-top: 14px;
}

.episode-upload-page__mode-button {
  display: flex;
  height: 109px;
  flex-direction: column;
  align-items: flex-start;
  padding: 18px 14px 15px;
  color: #2d2d2d;
  background: #fefefe;
  border: 1px solid #e7e7ef;
  border-radius: 14px;
  cursor: pointer;
  text-align: left;
}

.episode-upload-page__mode-button--selected {
  background: #fbffb9;
  border-color: var(--color-brand-lime);
}

.episode-upload-page__radio {
  position: relative;
  width: 14px;
  height: 14px;
  border: 2px solid #6f7280;
  border-radius: 50%;
}

.episode-upload-page__mode-button--selected .episode-upload-page__radio {
  border-color: var(--color-brand-blue);
}

.episode-upload-page__mode-button--selected .episode-upload-page__radio::after {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 6px;
  height: 6px;
  background: var(--color-brand-blue);
  border-radius: 50%;
  content: '';
}

.episode-upload-page__mode-title {
  margin-top: 15px;
  color: #2d2d2d;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.episode-upload-page__mode-description {
  margin-top: 10px;
  color: #6f7280;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0;
}

.episode-upload-page__manual-field {
  display: block;
  width: 338px;
  margin-top: 14px;
}

.episode-upload-page__textarea {
  display: block;
  width: 100%;
  height: 130px;
  padding: 18px 15px;
  color: #2d2d2d;
  background: #fefefe;
  border: 1px solid #e7e7ef;
  border-radius: 14px;
  outline: none;
  resize: none;
  font-family: var(--font-family-base);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.35;
  letter-spacing: 0;
}

.episode-upload-page__textarea::placeholder {
  color: #a0a3ad;
  opacity: 1;
}

.episode-upload-page__upload-zone {
  display: flex;
  align-items: center;
  min-height: 240px;
  flex-direction: column;
  justify-content: center;
  margin-top: 14px;
  padding: 30px 16px 26px;
  background: #fefefe;
  border: 1px dashed var(--color-brand-lime);
  border-radius: 14px;
  text-align: center;
}

.episode-upload-page__upload-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.episode-upload-page__upload-title {
  margin: 17px 0 0;
  color: #2d2d2d;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.episode-upload-page__upload-copy {
  margin: 14px 0 0;
  color: #6f7280;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0;
}

.episode-upload-page__file-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
  min-height: 42px;
  margin-top: 14px;
  padding: 0 18px;
  color: #2d2d2d;
  background: #fefefe;
  border: 1px solid #e7e7ef;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0;
  cursor: pointer;
}

.episode-upload-page__file-button input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.episode-upload-page__checks {
  width: 338px;
  height: 116px;
  margin-top: 14px;
  padding: 18px 15px 16px;
  background: #fefefe;
  border: 1px solid #e7e7ef;
  border-radius: 14px;
}

.episode-upload-page__checks-title {
  margin: 0;
  color: #2d2d2d;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.episode-upload-page__check-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 10px 0 0;
  padding: 0;
  color: #6f7280;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0;
  list-style: none;
}

.episode-upload-page__check-list li::before {
  content: '✓ ';
}

.episode-upload-page__submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 99px;
  min-height: 53px;
  margin-top: 14px;
  color: #fefefe;
  background: var(--color-brand-blue);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0;
  text-decoration: none;
}

.episode-upload-page__visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
