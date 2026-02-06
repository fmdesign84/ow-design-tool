# WaveNode

> Wave 노드 에디터 기반 AI 디자인 툴

**Live:** https://wavenode.vercel.app/
**Repo:** https://github.com/fmdesign84/ow-design-tool

---

## 개요

비주얼 노드 에디터로 AI 이미지/영상 파이프라인을 구성하는 도구.

```
Wave (오케스트레이터)
  ↓ 노드로 연결
기본 기능들 (빌딩 블록)
├── 이미지 생성 → 노드로 자동화
├── 이미지 편집 → 노드로 자동화
├── 영상 생성 → 노드로 자동화
└── 템플릿 → 노드로 자동화
```

---

## 실행

```bash
npm install
npm start       # 개발 서버 (localhost:3000)
npm run build   # 프로덕션 빌드
```

**API 테스트:** 로컬에서 불가 → Vercel 배포 후 테스트

---

## 노드 시스템

### 현재 노드 (20개+)

**입출력**
- `image-upload` - 이미지 업로드
- `text-input` - 텍스트 입력
- `image-output` - 이미지 출력
- `text-output` - 텍스트 출력
- `video-output` - 영상 출력

**생성**
- `text-to-image` - 텍스트 → 이미지
- `image-to-image` - 이미지 → 이미지
- `inpainting` - 부분 편집
- `id-photo` - 증명사진/자유사진
- `character-gen` - 캐릭터 생성 (나무캐릭터 스타일)
- `background-gen` - 배경 생성
- `location-composite` - 장소 합성
- `virtual-tryon` - 가상 피팅
- `portrait-staging` - 연출 생성
- `mockup` - 목업 생성
- `text-to-video` - 텍스트 → 영상
- `image-to-video` - 이미지 → 영상
- `multi-image-video` - 멀티 이미지 → 영상

**편집**
- `upscale-image` - 업스케일
- `remove-background` - 배경 제거
- `text-correct` - 텍스트 보정

**분석**
- `enhance-prompt` - 프롬프트 확장

### 스타일 참조 시스템

`character-gen` 노드는 스타일 참조 이미지를 자동으로 사용:

```
public/images/styles/
└── namoo-sample.png    # 나무캐릭터 스타일 참조
```

스타일 선택 시 해당 이미지를 Gemini에 함께 전달하여 일관된 스타일 출력.

---

## 기술 스택

| 서비스 | 역할 |
|--------|------|
| **Vercel** | 배포 + Serverless API |
| **Supabase** | 이미지/영상 저장소 + DB |
| **Gemini 3 Pro Image** | 이미지 생성 |
| **Gemini 3 Flash** | 프롬프트 확장, 이미지 분석 |
| **Veo 3.1** | 영상 생성 |
| **Replicate** | 업스케일, 배경 제거 |

### 주요 라이브러리

- `@xyflow/react` - 노드 에디터
- `zustand` - 상태 관리
- `@supabase/supabase-js` - 백엔드
- `png-chunks-*` - PNG 메타데이터

---

## 폴더 구조

```
src/
├── components/NodeEditor/   # Wave 노드 에디터
├── nodes/                   # 노드 정의 + 레지스트리 + 엔진
│   └── definitions/
│       ├── generation/      # 생성 노드
│       ├── editing/         # 편집 노드
│       └── io/              # 입출력 노드
├── pages/GenAI/             # AI Studio 페이지
├── stores/                  # Zustand 상태 관리
└── utils/                   # 유틸리티

api/                         # Vercel Serverless Functions
├── character-gen.js         # 캐릭터 생성 API
├── generate-image.js        # 이미지 생성 API
├── generate-video.js        # 영상 생성 API
└── ...

public/images/styles/        # 스타일 참조 이미지
```

---

## 환경 변수

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
GEMINI_API_KEY=
GOOGLE_PROJECT_ID=
REPLICATE_API_TOKEN=
```

---

## 메뉴 구조

```
홈
Wave (메인)
├── 노드 에디터
├── 저장된 워크플로우
└── 추천 웨이브

이미지 생성
├── 텍스트로 / 이미지로 / 부분 편집
├── 증명사진 / 자유사진
├── 장소 합성 / 가상 피팅 / 배경 생성
└── 캐릭터 생성

이미지 편집
├── 업스케일 / 배경제거 / 텍스트보정

영상 생성
├── 텍스트로 / 이미지로 / 멀티 이미지

템플릿
├── 목업 생성 (43종)
└── 연출 생성 (18종)

라이브러리
├── 전체 / 이미지 / 디자인 / 영상 / 즐겨찾기
```
