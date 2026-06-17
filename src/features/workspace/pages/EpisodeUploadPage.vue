<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import logoApp from '@/assets/images/brand/Logo2.svg'
import uploadIcon from '@/assets/images/icons/Upload.png'
import { useEpisodeAnalysisStore } from '@/features/workspace/stores/episodeAnalysisStore'

type EpisodeInputMode = 'manual' | 'upload'

const route = useRoute()
const router = useRouter()
const analysisStore = useEpisodeAnalysisStore()

const selectedMode = ref<EpisodeInputMode>('upload')
const episodeNumber = ref('')
const episodeTitle = ref('')
const episodeContent = ref('')
const selectedFile = ref<File | null>(null)
const isSubmitting = ref(false)
const feedbackMessage = ref('')
const feedbackType = ref<'error' | 'success'>('success')
const maxUploadBytes = 10 * 1024 * 1024

const workspaceId = computed(() => String(route.params.workspaceId ?? ''))
const analysisPath = computed(() => `/workspaces/${workspaceId.value}/episodes/analyzing`)
const selectedFileMeta = computed(() => {
  if (!selectedFile.value) {
    return ''
  }

  return `${selectedFile.value.name} · ${formatFileSize(selectedFile.value.size)}`
})

const inputModes: Array<{
  id: EpisodeInputMode
  title: string
  description: string
}> = [
  {
    id: 'manual',
    title: '직접 입력',
    description: '본문을 바로 붙여넣기',
  },
  {
    id: 'upload',
    title: '파일 업로드',
    description: '원고 파일로 분석',
  },
]

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes}B`
  }

  const kilobytes = bytes / 1024

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)}KB`
  }

  return `${(kilobytes / 1024).toFixed(1)}MB`
}

function selectMode(mode: EpisodeInputMode) {
  selectedMode.value = mode
  feedbackMessage.value = ''
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  selectedFile.value = input.files?.[0] ?? null
  feedbackMessage.value = selectedFile.value ? `${selectedFile.value.name} 파일을 선택했습니다.` : ''
  feedbackType.value = 'success'
}

function createManualEpisodeFile() {
  const fileName = `${episodeTitle.value.trim() || 'episode'}.txt`
  return new File([episodeContent.value.trim()], fileName, { type: 'text/plain' })
}

function validateEpisodeInput() {
  const numericWorkId = Number(workspaceId.value)

  if (!Number.isInteger(numericWorkId) || numericWorkId <= 0) {
    return '작품 정보를 확인할 수 없습니다.'
  }

  if (!episodeTitle.value.trim()) {
    return '회차 제목을 입력해주세요.'
  }

  if (selectedMode.value === 'manual' && !episodeContent.value.trim()) {
    return '회차 내용을 입력해주세요.'
  }

  if (selectedMode.value === 'upload') {
    const uploadFile = selectedFile.value

    if (!uploadFile) {
      return '업로드할 회차 파일을 선택해주세요.'
    }

    if (uploadFile.size > maxUploadBytes) {
      return '10MB 이하의 회차 파일만 업로드할 수 있습니다.'
    }
  }

  return ''
}

function resolveEpisodeFile() {
  if (selectedMode.value === 'manual') {
    return createManualEpisodeFile()
  }

  return selectedFile.value
}

async function handleSubmit() {
  if (isSubmitting.value) {
    return
  }

  const validationMessage = validateEpisodeInput()

  if (validationMessage) {
    feedbackType.value = 'error'
    feedbackMessage.value = validationMessage
    return
  }

  const file = resolveEpisodeFile()

  if (!file) {
    feedbackType.value = 'error'
    feedbackMessage.value = '분석할 파일을 확인할 수 없습니다.'
    return
  }

  isSubmitting.value = true
  feedbackMessage.value = ''

  analysisStore.queueAnalysis({
    workId: Number(workspaceId.value),
    episodeNumber: episodeNumber.value.trim(),
    title: episodeTitle.value.trim(),
    file,
  })

  await router.push(analysisPath.value)
  isSubmitting.value = false
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

    <form class="episode-upload-page__form" @submit.prevent="handleSubmit">
      <div class="episode-upload-page__field-row">
        <label class="episode-upload-page__field episode-upload-page__field--episode">
          <span class="episode-upload-page__label">회차</span>
          <input
            v-model="episodeNumber"
            class="episode-upload-page__input"
            name="episode-number"
            placeholder="회차"
            inputmode="numeric"
            type="text"
          />
        </label>

        <label class="episode-upload-page__field">
          <span class="episode-upload-page__label">제목</span>
          <input
            v-model="episodeTitle"
            class="episode-upload-page__input"
            name="episode-title"
            placeholder="제목"
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
        <span class="episode-upload-page__visually-hidden">회차 내용</span>
        <textarea
          v-model="episodeContent"
          class="episode-upload-page__textarea"
          name="episode-setting"
          placeholder="회차 내용을 입력해주세요."
          rows="6"
        ></textarea>
      </label>

      <div v-else class="episode-upload-page__upload-zone">
        <img class="episode-upload-page__upload-icon" :src="uploadIcon" alt="" aria-hidden="true" />
        <p class="episode-upload-page__upload-title">원고를 업로드하세요</p>
        <p class="episode-upload-page__upload-copy">TXT · MD · DOC · DOCX 파일, 최대 10MB</p>
        <p v-if="selectedFileMeta" class="episode-upload-page__file-meta" aria-live="polite">
          {{ selectedFileMeta }}
        </p>
        <label class="episode-upload-page__file-button">
          {{ selectedFile ? '파일 변경' : '파일 선택' }}
          <input type="file" accept=".txt,.md,.doc,.docx" @change="handleFileChange" />
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

      <p
        v-if="feedbackMessage"
        class="episode-upload-page__feedback"
        :class="{ 'episode-upload-page__feedback--error': feedbackType === 'error' }"
      >
        {{ feedbackMessage }}
      </p>

      <button class="episode-upload-page__submit" type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? '이동 중' : '분석 시작' }}
      </button>
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
  width: 72px;
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
  color: #2d2d2d;
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

.episode-upload-page__input::placeholder,
.episode-upload-page__textarea::placeholder {
  color: #a0a3ad;
  opacity: 1;
}

.episode-upload-page__field--episode .episode-upload-page__input {
  padding: 0 12px;
  text-align: center;
}

.episode-upload-page__field:not(.episode-upload-page__field--episode) {
  width: 190px;
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

.episode-upload-page__file-meta {
  width: min(100%, 260px);
  margin: 14px 0 0;
  padding: 10px 12px;
  overflow: hidden;
  color: #2d2d2d;
  background: #f5f8ff;
  border: 1px solid #dfe8ff;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  content: '- ';
}

.episode-upload-page__feedback {
  width: 338px;
  margin: 14px 0 0;
  color: var(--color-brand-blue);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: 0;
}

.episode-upload-page__feedback--error {
  color: #ff3131;
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
  border: 0;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0;
  cursor: pointer;
  text-decoration: none;
}

.episode-upload-page__submit:disabled {
  cursor: not-allowed;
  opacity: 0.7;
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
