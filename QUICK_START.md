# Flet Brush 실행 가이드

## 빠른 시작

### 1단계: 의존성 설치 (처음 한 번만)
```bash
npm install
```

### 2단계: Electron 앱 실행
```bash
npm run dev:electron
```

이 명령어는:
- Vite 개발 서버를 시작합니다 (포트 5173)
- Electron 앱을 자동으로 실행합니다
- 투명한 전체 화면 윈도우가 열립니다

### 종료 방법
- `Cmd + Q` (macOS) 또는 윈도우를 닫으면 앱이 종료됩니다

---

## 다른 실행 방법

### 웹 브라우저에서 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:5173`으로 접속합니다.

### macOS 앱 번들 빌드 (배포용)
```bash
npm run build:app
```
`dist` 폴더에 `.dmg` 파일이 생성됩니다. 이를 더블클릭하여 설치할 수 있습니다.

---

## 문제 해결

### 포트가 이미 사용 중인 경우
다른 터미널에서 실행 중인 프로세스를 종료하거나, `vite.config.ts`에서 포트를 변경하세요.

### Electron이 실행되지 않는 경우
```bash
# 의존성을 다시 설치
npm install

# Electron 앱 의존성 설치
npm run postinstall
```

### 아이콘이 보이지 않는 경우
아이콘은 빌드된 앱에서만 표시됩니다. 개발 모드에서는 기본 Electron 아이콘이 표시될 수 있습니다.

