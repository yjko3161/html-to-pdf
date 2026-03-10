# HTML to PDF

GPT/Gemini 등 AI가 생성한 HTML 코드를 온라인에서 바로 미리보기하고, PDF로 출력하며, 이전 내역을 저장/관리할 수 있는 웹 툴입니다.

## 주요 기능

### HTML 에디터
- CodeMirror 6 기반 코드 에디터
- HTML 신택스 하이라이팅, 자동완성, 괄호 매칭
- GPT/Gemini가 생성한 HTML 코드를 붙여넣기하여 바로 사용 가능

### 실시간 미리보기
- iframe 기반으로 입력한 HTML을 실시간 렌더링
- 에디터와 미리보기를 좌우 분할 레이아웃으로 동시에 확인
- 300ms 디바운스 적용으로 타이핑 중 성능 저하 방지

### PDF 다운로드
- 미리보기 내용을 A4 크기 PDF로 변환하여 다운로드
- 1페이지 내용은 A4에 맞춰서 깔끔하게 출력
- 긴 내용은 자동으로 멀티페이지로 분할
- 문서 제목 기반으로 파일명 자동 생성

### 문서 이력 관리
- 저장 버튼 클릭 시 현재 제목 + HTML 내용을 새 이력으로 저장
- 사이드바에서 저장된 문서 목록 확인
- 클릭하면 해당 이력의 HTML을 에디터에 불러오기
- 문서 제목으로 검색/필터 가능
- 개별 이력 삭제 가능
- localStorage 기반으로 브라우저에 데이터 유지 (새로고침해도 유지)

### 기타
- 다크모드 / 라이트모드 전환
- 사이드바 접기/펼치기
- 새 문서 버튼으로 에디터 초기화

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | React 19 + TypeScript |
| 빌드 도구 | Vite 7 |
| UI | shadcn/ui (Tailwind CSS v4 + Radix UI) |
| 코드 에디터 | CodeMirror 6 (@uiw/react-codemirror) |
| PDF 변환 | html2canvas + jsPDF |
| 저장소 | localStorage |

## 프로젝트 구조

```
src/
├── main.tsx                    # 앱 진입점
├── App.tsx                     # 메인 레이아웃 + 상태 관리
├── index.css                   # Tailwind v4 + shadcn 테마 설정
├── types/
│   └── index.ts                # HtmlDocument 타입 정의
├── hooks/
│   ├── useDebounce.ts          # 디바운스 훅
│   └── useLocalStorage.ts      # localStorage CRUD 훅
├── lib/
│   ├── utils.ts                # cn() 유틸리티
│   └── pdf.ts                  # PDF 생성 로직
└── components/
    ├── ui/                     # shadcn/ui 컴포넌트 (Button, Input, ScrollArea)
    ├── Header.tsx              # 상단바 (제목 입력, 새 문서/저장/PDF/다크모드 버튼)
    ├── Sidebar.tsx             # 사이드바 (저장 이력 목록, 검색, 삭제)
    ├── Editor.tsx              # CodeMirror HTML 에디터
    ├── Preview.tsx             # iframe 미리보기
    └── MainPanel.tsx           # 에디터 + 미리보기 분할 패널
```

## 화면 구조

```
┌─────────────────────────────────────────────────────┐
│  Header: [사이드바] 로고  제목입력  [새문서][저장][PDF][🌙] │
├────────┬────────────────────────────────────────────┤
│        │                                            │
│ 사이드 │   메인 영역 (좌우 분할)                      │
│ 바     │  ┌────────────────┬───────────────┐        │
│        │  │                │               │        │
│ [검색] │  │  HTML 에디터    │  미리보기      │        │
│        │  │  (CodeMirror)  │  (iframe)     │        │
│ 항목1  │  │                │               │        │
│ 항목2  │  │                │               │        │
│ 항목3  │  └────────────────┴───────────────┘        │
│        │                                            │
└────────┴────────────────────────────────────────────┘
```

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 원격 접속 허용 (같은 네트워크에서 접속 가능)
npx vite --host 0.0.0.0

# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview
```

## 사용 방법

1. `npm run dev`로 개발 서버를 실행합니다.
2. 브라우저에서 `http://localhost:5173`에 접속합니다.
3. 왼쪽 에디터에 HTML 코드를 입력하면 오른쪽에서 실시간으로 미리보기됩니다.
4. 상단에 문서 제목을 입력하고 **저장** 버튼을 누르면 이력이 저장됩니다.
5. **PDF** 버튼을 누르면 현재 내용을 A4 PDF로 다운로드합니다.
6. 사이드바에서 이전에 저장한 이력을 클릭하면 해당 내용을 불러옵니다.

## 데이터 모델

```typescript
interface HtmlDocument {
  id: string;          // UUID
  title: string;       // 문서 제목
  content: string;     // HTML 코드
  createdAt: string;   // 생성일 (ISO 8601)
  updatedAt: string;   // 수정일 (ISO 8601)
}
```

## 향후 계획 (Phase 2)

- Google Drive API 연동 (OAuth2 로그인, 클라우드 저장/불러오기)
- 로컬 저장소 ↔ 클라우드 저장소 선택 기능
