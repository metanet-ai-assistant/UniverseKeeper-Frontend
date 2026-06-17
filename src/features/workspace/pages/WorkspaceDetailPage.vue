<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import logoApp from '@/assets/images/brand/Logo2.svg'
import graphIcon from '@/assets/images/icons/graph.png'
import {
  getEntities,
  getEntityDetails,
  getEntitySubgraph,
  type EntityDetailResponse,
  type EntitySubgraphResponse,
  type GraphEdge,
  type GraphNode,
} from '@/features/workspace/api/graphApi'
import {
  getWorkspaceDetail,
  getWorkspaceEpisodes,
  type WorkspaceDetailResponse,
  type WorkspaceEpisodeResponse,
} from '@/features/workspace/api/workspaceDetailApi'
import type { WorkspaceDetail, WorkspaceDetailTab, WorkspaceEpisode } from '@/features/workspace/types'

interface PositionedGraphNode extends GraphNode {
  x: number
  y: number
}

interface PositionedGraphEdge extends GraphEdge {
  sourceNode: PositionedGraphNode
  targetNode: PositionedGraphNode
}

const route = useRoute()
const selectedTab = ref<WorkspaceDetailTab>('episodes')
const isGraphOpen = ref(false)
const isLoading = ref(true)
const loadError = ref('')
const workspace = ref<WorkspaceDetail | null>(null)
const graphEntities = ref<string[]>([])
const selectedEntity = ref('')
const entityDetail = ref<EntityDetailResponse | null>(null)
const entitySubgraph = ref<EntitySubgraphResponse>({ nodes: [], edges: [] })
const selectedNodeId = ref('')
const graphZoom = ref(1)
const isGraphLoading = ref(false)
const graphError = ref('')

const workId = computed(() => Number(route.params.workspaceId))
const positionedGraphNodes = computed<PositionedGraphNode[]>(() =>
  entitySubgraph.value.nodes.map((node, index) => ({
    ...node,
    ...graphNodePosition(index, entitySubgraph.value.nodes.length),
  })),
)
const positionedGraphEdges = computed<PositionedGraphEdge[]>(() => {
  const nodeMap = new Map(positionedGraphNodes.value.map((node) => [node.id, node]))

  return entitySubgraph.value.edges.reduce<PositionedGraphEdge[]>((edges, edge) => {
    const sourceNode = nodeMap.get(edge.source)
    const targetNode = nodeMap.get(edge.target)

    if (sourceNode && targetNode) {
      edges.push({
        ...edge,
        sourceNode,
        targetNode,
      })
    }

    return edges
  }, [])
})
const selectedNode = computed(() =>
  positionedGraphNodes.value.find((node) => node.id === selectedNodeId.value),
)

function mapEpisode(workId: number, episode: WorkspaceEpisodeResponse): WorkspaceEpisode {
  const isConflict = episode.is_conflict

  return {
    id: `${workId}-${episode.episode_no}`,
    number: episode.episode_no,
    title: episode.title,
    conflictStatus: isConflict ? 'conflict' : 'clear',
    episodeId: episode.episode_id,
  }
}

function mapWorkspaceDetail(
  detail: WorkspaceDetailResponse,
  episodes: WorkspaceEpisodeResponse[],
): WorkspaceDetail {
  return {
    id: String(detail.work_id),
    title: detail.title,
    genre: detail.genre,
    episodeCount: detail.episode_count,
    conflictCount: detail.total_conflict_count,
    episodes: episodes.map((episode) => mapEpisode(detail.work_id, episode)),
    initialSetting: detail.original_text,
  }
}

async function loadWorkspaceDetail() {
  isLoading.value = true
  loadError.value = ''

  if (!Number.isInteger(workId.value) || workId.value <= 0) {
    workspace.value = null
    loadError.value = '작품 정보를 불러올 수 없는 주소입니다.'
    isLoading.value = false
    return
  }

  try {
    const [detail, episodes] = await Promise.all([
      getWorkspaceDetail(workId.value),
      getWorkspaceEpisodes(workId.value),
    ])
    workspace.value = mapWorkspaceDetail(detail, episodes)
  } catch {
    workspace.value = null
    loadError.value = '작품 상세 정보를 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

function selectTab(tab: WorkspaceDetailTab) {
  selectedTab.value = tab
}

function openGraph() {
  isGraphOpen.value = true
  void loadGraphEntities()
}

function closeGraph() {
  isGraphOpen.value = false
}

function isValidWorkId() {
  return Number.isInteger(workId.value) && workId.value > 0
}

function resetSelectedGraph() {
  selectedNodeId.value = ''
  entityDetail.value = null
  entitySubgraph.value = { nodes: [], edges: [] }
}

async function fetchSelectedEntityGraph() {
  if (!selectedEntity.value || !isValidWorkId()) {
    resetSelectedGraph()
    return
  }

  selectedNodeId.value = ''
  const [detail, subgraph] = await Promise.all([
    getEntityDetails(selectedEntity.value, workId.value),
    getEntitySubgraph(selectedEntity.value, workId.value),
  ])
  entityDetail.value = detail
  entitySubgraph.value = subgraph
}

async function loadGraphEntities() {
  graphError.value = ''
  resetSelectedGraph()

  if (!isValidWorkId()) {
    graphEntities.value = []
    selectedEntity.value = ''
    graphError.value = '그래프 조회는 숫자 작품 ID에서 사용할 수 있습니다.'
    return
  }

  isGraphLoading.value = true

  try {
    graphEntities.value = await getEntities(workId.value)
    selectedEntity.value = graphEntities.value[0] ?? ''

    if (selectedEntity.value) {
      await fetchSelectedEntityGraph()
    }
  } catch {
    graphError.value = '그래프 정보를 불러오지 못했습니다.'
  } finally {
    isGraphLoading.value = false
  }
}

async function loadSelectedEntityGraph() {
  graphError.value = ''
  isGraphLoading.value = true

  try {
    await fetchSelectedEntityGraph()
  } catch {
    graphError.value = '선택한 엔티티 그래프를 불러오지 못했습니다.'
  } finally {
    isGraphLoading.value = false
  }
}

function graphNodePosition(index: number, total: number) {
  const radius = total <= 1 ? 0 : 190
  const angle = (index / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2

  return {
    x: 300 + Math.cos(angle) * radius,
    y: 280 + Math.sin(angle) * radius,
  }
}

function selectGraphNode(nodeId: string) {
  selectedNodeId.value = nodeId
}

function zoomGraph(delta: number) {
  graphZoom.value = Math.min(1.8, Math.max(0.6, Number((graphZoom.value + delta).toFixed(1))))
}

function formatNodeLabel(label: string) {
  return label.length > 8 ? `${label.slice(0, 8)}...` : label
}

onMounted(() => {
  void loadWorkspaceDetail()
})
</script>

<template>
  <section class="workspace-detail-page" aria-labelledby="workspace-detail-title">
    <RouterLink
      class="workspace-detail-page__logo-link"
      to="/workspaces"
      aria-label="워크스페이스로 이동"
    >
      <img class="workspace-detail-page__logo" :src="logoApp" alt="UniverseKeeper UVK" />
    </RouterLink>

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

    <p v-if="isLoading" class="workspace-detail-page__state">
      작품 상세 정보를 불러오는 중입니다.
    </p>
    <p
      v-else-if="loadError"
      class="workspace-detail-page__state workspace-detail-page__state--error"
    >
      {{ loadError }}
    </p>

    <template v-else-if="workspace">
      <article class="workspace-detail-page__summary">
        <div>
          <p class="workspace-detail-page__meta">
            {{ workspace.genre }} · 총 {{ workspace.episodeCount }}화
          </p>
          <h2 class="workspace-detail-page__work-title">{{ workspace.title }}</h2>
          <p class="workspace-detail-page__setting-count">
            {{ workspace.initialSetting ? '초기 설정 조회 가능' : '초기 설정 없음' }}
          </p>
        </div>
        <span class="workspace-detail-page__conflict-pill">
          충돌 {{ workspace.conflictCount }}건
        </span>
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

        <p v-if="workspace.episodes.length === 0" class="workspace-detail-page__empty">
          등록된 회차가 없습니다.
        </p>

        <ul v-else class="workspace-detail-page__episode-list" aria-label="회차 리스트">
          <li
            v-for="episode in workspace.episodes"
            :key="episode.id"
            class="workspace-detail-page__episode-item"
          >
            <RouterLink
              v-if="episode.conflictStatus === 'conflict' && episode.episodeId"
              class="episode-card"
              :to="`/workspaces/${workspace.id}/reports/${episode.episodeId}`"
            >
              <span class="episode-card__number">{{ episode.number }}화</span>
              <span class="episode-card__title">{{ episode.title }}</span>
              <span class="episode-card__status episode-card__status--conflict">충돌 발생</span>
            </RouterLink>
            <div v-else class="episode-card episode-card--static">
              <span class="episode-card__number">{{ episode.number }}화</span>
              <span class="episode-card__title">{{ episode.title }}</span>
              <span class="episode-card__status episode-card__status--clear">충돌 없음</span>
            </div>
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
          </div>
        </header>
        <div class="settings-panel__divider" aria-hidden="true"></div>
        <pre class="settings-panel__content">{{
          workspace.initialSetting || '등록된 초기 설정이 없습니다.'
        }}</pre>
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
          <div class="graph-modal__toolbar">
            <select
              v-model="selectedEntity"
              class="graph-modal__select"
              :disabled="isGraphLoading || graphEntities.length === 0"
              aria-label="엔티티 선택"
              @change="loadSelectedEntityGraph"
            >
              <option v-for="entity in graphEntities" :key="entity" :value="entity">
                {{ entity }}
              </option>
            </select>
            <div class="graph-modal__zoom" aria-label="그래프 확대 축소">
              <button type="button" aria-label="축소" @click="zoomGraph(-0.1)">-</button>
              <span>{{ Math.round(graphZoom * 100) }}%</span>
              <button type="button" aria-label="확대" @click="zoomGraph(0.1)">+</button>
            </div>
          </div>

          <p v-if="isGraphLoading" class="graph-modal__state">그래프를 불러오는 중입니다.</p>
          <p v-else-if="graphError" class="graph-modal__state graph-modal__state--error">
            {{ graphError }}
          </p>
          <p v-else-if="graphEntities.length === 0" class="graph-modal__state">
            표시할 엔티티가 없습니다.
          </p>
          <p v-else-if="positionedGraphNodes.length === 0" class="graph-modal__state">
            표시할 그래프 노드가 없습니다.
          </p>

          <div v-else class="graph-modal__canvas" aria-label="그래프 미리보기">
            <svg class="graph-modal__svg" viewBox="0 0 600 560" role="img" aria-label="엔티티 관계 그래프">
              <g :transform="`translate(300 280) scale(${graphZoom}) translate(-300 -280)`">
                <line
                  v-for="edge in positionedGraphEdges"
                  :key="`${edge.source}-${edge.target}-${edge.label}`"
                  class="graph-modal__edge"
                  :x1="edge.sourceNode.x"
                  :y1="edge.sourceNode.y"
                  :x2="edge.targetNode.x"
                  :y2="edge.targetNode.y"
                />
                <g
                  v-for="node in positionedGraphNodes"
                  :key="node.id"
                  class="graph-modal__node"
                  :class="{ 'graph-modal__node--selected': selectedNodeId === node.id }"
                  :transform="`translate(${node.x} ${node.y})`"
                  role="button"
                  tabindex="0"
                  @click="selectGraphNode(node.id)"
                  @keyup.enter="selectGraphNode(node.id)"
                >
                  <circle r="34"></circle>
                  <text text-anchor="middle" dy="4">{{ formatNodeLabel(node.label) }}</text>
                </g>
              </g>
            </svg>
          </div>

          <aside v-if="selectedNode" class="graph-modal__node-detail">
            <h3>{{ selectedNode.label }}</h3>
            <p>ID: {{ selectedNode.id }}</p>
          </aside>
          <aside v-else-if="entityDetail" class="graph-modal__node-detail">
            <h3>{{ entityDetail.entity.name }}</h3>
            <p>{{ entityDetail.entity.description || '엔티티 설명이 없습니다.' }}</p>
          </aside>
        </section>
      </div>
    </template>
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

.workspace-detail-page__logo-link {
  display: inline-flex;
  width: 106px;
  height: 50px;
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

.workspace-detail-page__state {
  margin: 18px 0 0;
  padding: 20px 16px;
  color: #6f7280;
  background: #fefefe;
  border: 1px solid #e7e7ef;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0;
  text-align: center;
}

.workspace-detail-page__state--error {
  color: #ff3131;
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

.workspace-detail-page__empty {
  margin: 18px 5px 0;
  padding: 18px 14px;
  color: #6f7280;
  background: #fefefe;
  border: 1px solid #e7e7ef;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0;
  text-align: center;
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
  text-decoration: none;
}

.episode-card--static {
  cursor: default;
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
  height: 456px;
  margin-top: 14px;
  overflow: hidden;
  background: #2d2d2d;
  border-radius: 8px;
}

.graph-modal__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 20px;
}

.graph-modal__select {
  min-width: 0;
  height: 36px;
  flex: 1;
  padding: 0 10px;
  color: #2d2d2d;
  background: #fefefe;
  border: 1px solid #e7e7ef;
  border-radius: 8px;
  font-family: var(--font-family-base);
  font-size: 12px;
  font-weight: 700;
}

.graph-modal__zoom {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #2d2d2d;
  font-size: 12px;
  font-weight: 800;
}

.graph-modal__zoom button {
  display: inline-grid;
  width: 28px;
  height: 28px;
  place-items: center;
  color: #fefefe;
  background: var(--color-brand-blue);
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}

.graph-modal__state {
  display: grid;
  min-height: 456px;
  margin: 14px 0 0;
  place-items: center;
  color: #6f7280;
  background: #f3f9ff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0;
  text-align: center;
}

.graph-modal__state--error {
  color: #ff3131;
}

.graph-modal__svg {
  width: 100%;
  height: 100%;
}

.graph-modal__edge {
  stroke: #9ca3af;
  stroke-width: 2;
}

.graph-modal__node {
  cursor: pointer;
}

.graph-modal__node circle {
  fill: #ddedff;
  stroke: var(--color-brand-blue);
  stroke-width: 3;
}

.graph-modal__node--selected circle {
  fill: #fbffb9;
  stroke: var(--color-brand-lime);
}

.graph-modal__node text {
  fill: #2d2d2d;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
  pointer-events: none;
}

.graph-modal__node-detail {
  min-height: 72px;
  margin-top: 12px;
  padding: 12px;
  color: #2d2d2d;
  background: #f3f9ff;
  border-radius: 8px;
}

.graph-modal__node-detail h3,
.graph-modal__node-detail p {
  margin: 0;
}

.graph-modal__node-detail p {
  margin-top: 8px;
  color: #6f7280;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.35;
  letter-spacing: 0;
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
