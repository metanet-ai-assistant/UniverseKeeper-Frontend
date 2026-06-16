<script setup lang="ts">
import { computed, ref } from 'vue'

import logoApp from '@/assets/images/brand/Logo2.svg'
import uploadIcon from '@/assets/images/icons/Upload.png'

type CreationMode = 'manual' | 'upload'

const title = ref('')
const genre = ref('')
const description = ref('')
const settingText = ref('')
const selectedMode = ref<CreationMode>('manual')

const creationModes: Array<{
  id: CreationMode
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

const pageClass = computed(() => ({
  'new-workspace-page--upload': selectedMode.value === 'upload',
}))

function selectMode(mode: CreationMode) {
  selectedMode.value = mode
}

function handleCreate() {
  return {
    title: title.value.trim(),
    genre: genre.value.trim(),
    description: description.value.trim(),
    mode: selectedMode.value,
    settingText: settingText.value.trim(),
  }
}
</script>

<template>
  <section class="new-workspace-page" :class="pageClass" aria-labelledby="new-workspace-title">
    <img class="new-workspace-page__logo" :src="logoApp" alt="UniverseKeeper UVK" />

    <header class="new-workspace-page__header">
      <RouterLink
        class="new-workspace-page__back"
        to="/workspaces"
        aria-label="작품 목록으로 돌아가기"
      >
        <span class="new-workspace-page__back-icon" aria-hidden="true"></span>
      </RouterLink>
      <h1 id="new-workspace-title" class="new-workspace-page__title">새 작품 만들기</h1>
    </header>

    <form class="new-workspace-page__form" @submit.prevent="handleCreate">
      <div class="new-workspace-page__field-row">
        <label class="new-workspace-page__field">
          <span class="new-workspace-page__label"> <span aria-hidden="true">*</span>작품명 </span>
          <input
            v-model="title"
            class="new-workspace-page__input"
            name="workspace-title"
            placeholder="예: 붉은 달의 기억"
            type="text"
          />
        </label>

        <label class="new-workspace-page__field">
          <span class="new-workspace-page__label"> <span aria-hidden="true">*</span>장르 </span>
          <input
            v-model="genre"
            class="new-workspace-page__input"
            name="workspace-genre"
            placeholder="판타지, 로맨스 등"
            type="text"
          />
        </label>
      </div>

      <label class="new-workspace-page__field">
        <span class="new-workspace-page__label new-workspace-page__label--plain">작품 소개</span>
        <textarea
          v-model="description"
          class="new-workspace-page__textarea"
          name="workspace-description"
          placeholder="세계관과 핵심 배경을 간단히 입력해주세요."
          rows="4"
        ></textarea>
      </label>

      <fieldset class="new-workspace-page__mode-field">
        <legend class="new-workspace-page__label new-workspace-page__label--plain">
          초기 설정 입력 방식
        </legend>
        <div class="new-workspace-page__mode-list">
          <button
            v-for="mode in creationModes"
            :key="mode.id"
            class="new-workspace-page__mode-button"
            :class="{ 'new-workspace-page__mode-button--selected': selectedMode === mode.id }"
            type="button"
            :aria-pressed="selectedMode === mode.id"
            @click="selectMode(mode.id)"
          >
            <span class="new-workspace-page__radio" aria-hidden="true"></span>
            <span class="new-workspace-page__mode-title">{{ mode.title }}</span>
            <span class="new-workspace-page__mode-description">{{ mode.description }}</span>
          </button>
        </div>
      </fieldset>

      <label v-if="selectedMode === 'manual'" class="new-workspace-page__field">
        <span class="new-workspace-page__visually-hidden">작품 설정</span>
        <textarea
          v-model="settingText"
          class="new-workspace-page__settings-textarea"
          name="workspace-settings"
          placeholder="작품 설정을 입력해주세요."
          rows="4"
        ></textarea>
      </label>

      <div v-else class="new-workspace-page__upload-zone">
        <img class="new-workspace-page__upload-icon" :src="uploadIcon" alt="" aria-hidden="true" />
        <p class="new-workspace-page__upload-title">원고를 업로드하거나 붙여넣으세요</p>
        <p class="new-workspace-page__upload-copy">TXT · DOCS 파일, 최대 10MB</p>
        <label class="new-workspace-page__file-button">
          파일 선택
          <input type="file" accept=".txt,.doc,.docx" />
        </label>
      </div>

      <button class="new-workspace-page__submit" type="submit">작품 생성</button>
    </form>
  </section>
</template>

<style scoped>
.new-workspace-page {
  min-height: 100dvh;
  padding: 20px 24px 85px;
  background: #fefefe;
  font-family: var(--font-family-base);
}

.new-workspace-page--upload {
  min-height: 924px;
  padding-bottom: 25px;
}

.new-workspace-page__logo {
  width: 106px;
  height: 50px;
  object-fit: contain;
}

.new-workspace-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 53px;
  margin-top: 30px;
  border-bottom: 1px solid #eaf1ff;
}

.new-workspace-page__back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  color: #111;
}

.new-workspace-page__back-icon {
  width: 17px;
  height: 17px;
  border-bottom: 2px solid currentColor;
  border-left: 2px solid currentColor;
  transform: rotate(45deg);
}

.new-workspace-page__title {
  margin: 0;
  color: #2d2d2d;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.new-workspace-page__form {
  display: flex;
  flex-direction: column;
  padding-top: 15px;
}

.new-workspace-page__field-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
}

.new-workspace-page__field,
.new-workspace-page__mode-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  border: 0;
}

.new-workspace-page__field + .new-workspace-page__field,
.new-workspace-page__mode-field {
  margin-top: 18px;
}

.new-workspace-page__label {
  color: #2d2d2d;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0;
}

.new-workspace-page__label span {
  color: #ff3131;
}

.new-workspace-page__label--plain {
  font-size: 14px;
  font-weight: 700;
}

.new-workspace-page__input,
.new-workspace-page__textarea,
.new-workspace-page__settings-textarea {
  width: 100%;
  color: #2d2d2d;
  background: #fefefe;
  border: 1px solid #e7e7ef;
  border-radius: 14px;
  outline: none;
  font-family: var(--font-family-base);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.35;
  letter-spacing: 0;
}

.new-workspace-page__input {
  height: 52px;
  padding: 0 15px;
}

.new-workspace-page__textarea {
  min-height: 130px;
  padding: 18px 15px;
  resize: none;
}

.new-workspace-page__settings-textarea {
  min-height: 130px;
  margin-top: 17px;
  padding: 19px 15px;
  resize: none;
}

.new-workspace-page__input::placeholder,
.new-workspace-page__textarea::placeholder,
.new-workspace-page__settings-textarea::placeholder {
  color: #a0a3ad;
  opacity: 1;
}

.new-workspace-page__input:focus,
.new-workspace-page__textarea:focus,
.new-workspace-page__settings-textarea:focus {
  border-color: var(--color-brand-blue);
}

.new-workspace-page__mode-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.new-workspace-page__mode-button {
  display: grid;
  grid-template-rows: 22px auto auto;
  min-height: 109px;
  padding: 18px 14px 17px;
  color: #2d2d2d;
  background: #fefefe;
  border: 1px solid #e7e7ef;
  border-radius: 14px;
  cursor: pointer;
  text-align: left;
}

.new-workspace-page__mode-button--selected {
  background: #fbffb9;
  border-color: var(--color-brand-lime);
}

.new-workspace-page__radio {
  position: relative;
  width: 14px;
  height: 14px;
  border: 2px solid #828797;
  border-radius: 50%;
}

.new-workspace-page__mode-button--selected .new-workspace-page__radio {
  border-color: var(--color-brand-blue);
}

.new-workspace-page__mode-button--selected .new-workspace-page__radio::after {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 6px;
  height: 6px;
  background: var(--color-brand-blue);
  border-radius: 50%;
  content: '';
}

.new-workspace-page__mode-title {
  margin-top: 12px;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.new-workspace-page__mode-description {
  margin-top: 10px;
  color: #6f7280;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0;
}

.new-workspace-page__upload-zone {
  display: flex;
  align-items: center;
  min-height: 238px;
  flex-direction: column;
  justify-content: center;
  margin-top: 16px;
  padding: 28px 16px;
  background: #fefefe;
  border: 1px dashed var(--color-brand-lime);
  border-radius: 14px;
  text-align: center;
}

.new-workspace-page__upload-icon {
  width: 32px;
  height: 32px;
  margin-bottom: 17px;
  object-fit: contain;
}

.new-workspace-page__upload-title {
  margin: 0;
  color: #2d2d2d;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: 0;
}

.new-workspace-page__upload-copy {
  margin: 14px 0 0;
  color: #6f7280;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0;
}

.new-workspace-page__file-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 42px;
  margin-top: 14px;
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

.new-workspace-page__file-button input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.new-workspace-page__submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 99px;
  min-height: 53px;
  margin-top: 16px;
  padding: 0 18px;
  color: #fefefe;
  background: var(--color-brand-blue);
  border: 0;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0;
  cursor: pointer;
}

.new-workspace-page__visually-hidden {
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
