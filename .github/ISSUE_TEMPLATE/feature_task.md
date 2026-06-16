---
name: 기능 작업
about: 기능 추가, 화면 구현, 또는 기존 기능 개선 작업을 정리합니다.
title: "feat: "
labels: ""
assignees: ""
---

## 작업 내용

<!-- 어떤 문제를 해결하거나 어떤 기능을 구현하는지 간단히 적습니다. -->

## 관련 화면 또는 경로

<!-- 예: /splash, /login, Figma 화면명 또는 node id -->

## 범위

<!-- 구현할 항목을 목록으로 적습니다. -->

## 제외 범위

<!-- 이번 작업에서 의도적으로 제외할 항목을 적습니다. -->

## 완료 조건

- [ ] 피그마 기준 화면과 주요 배치, 색상, 타이포그래피가 일치합니다.
- [ ] 모바일 폭 360px~430px에서 가로 스크롤 또는 깨짐이 없습니다.
- [ ] 레이아웃은 absolute 배치를 지양하고 flex 또는 grid 기반으로 구성합니다.
- [ ] Pretendard 폰트를 사용합니다.
- [ ] 관련 테스트 또는 수동 검증 결과를 남깁니다.

## 검증 계획

- [ ] `npm run format`
- [ ] `npm run lint`
- [ ] `npm run type-check`
- [ ] `npm run test:unit -- --run`
- [ ] 필요한 경우 `npm run test:e2e -- --project=chromium`
- [ ] 필요한 경우 `npm run build`

## 참고 자료

<!-- Figma 링크, 기획 문서, 관련 이슈, API 명세 등을 적습니다. -->
