# 1987, 가려진 기록 — 방탈출 게임 (학생 로그인 없이 쓰는 버전)

역사·과학·영어 융합 프로젝트 수업용 방탈출 게임입니다.
made by. 나수진쌤 & 전소현쌤

- 학생: 링크를 열고 **반·번호·이름**만 입력하면 바로 시작해요. 로그인은 필요 없어요.
- 교사: 첫 화면 오른쪽 아래 **교사용 페이지** → 비밀번호 입력 → 반별 탭으로 실시간 진행 현황을 봐요.

## 폴더 구성

| 파일 | 하는 일 |
|---|---|
| `server.js` | 게임 화면을 보여 주고, 학생 진행 기록을 저장·조회해요 |
| `public/` | 게임 화면(`index.html`), 배경 이미지(`img/`), 3D 라이브러리(`lib/`) |
| `render.yaml` | Render에 서버와 데이터베이스를 한 번에 만드는 설정 |
| `package.json` | 서버 실행 설정 |

## 배포 순서

### 1. GitHub에 올리기
1. github.com에서 **New repository** → 이름 `escape1987` → Public 또는 Private → **Create repository**
2. 만들어진 저장소에서 **uploading an existing file** 클릭
3. 이 폴더 안의 내용(`server.js`, `package.json`, `render.yaml`, `README.md`, `.gitignore`, `public` 폴더)을 **통째로 끌어다 놓기** → **Commit changes**
   - `node_modules` 폴더가 있다면 올리지 마세요.

### 2. Render에서 배포하기
1. render.com → 오른쪽 위 **New +** → **Blueprint**
2. 방금 만든 `escape1987` 저장소 선택 → **Connect**
3. 설정 화면에 웹 서비스 `escape1987`과 데이터베이스 `escape1987-db`가 보이면 **Apply**
4. 몇 분 뒤 `https://escape1987-xxxx.onrender.com` 같은 주소가 생겨요. 이 주소를 학생들에게 나눠 주면 돼요.

## 알아 둘 점

- **교사 비밀번호**: 기본값은 `7891`이에요. Render → escape1987 → Environment → `TEACHER_PASSWORD`에서 바꿀 수 있어요.
- **무료 서버는 잠들어요**: 15분 동안 아무도 접속하지 않으면 꺼졌다가, 다음 접속 때 켜지느라 30초~1분 걸려요. 수업 시작 몇 분 전에 선생님이 먼저 한 번 열어 두세요.
- **무료 데이터베이스는 30일 뒤 만료돼요**: Render 무료 PostgreSQL은 만든 지 30일이 지나면 사용할 수 없어요. 수업이 끝나면 교사용 페이지의 **CSV 내보내기**로 기록을 저장해 두세요. 더 오래 쓰려면 Render에서 데이터베이스를 유료로 바꾸거나, 다른 PostgreSQL 주소를 `DATABASE_URL`에 넣으면 돼요.
- **반 기록 지우기**: 교사용 페이지에서 반 탭을 고른 뒤 **이 반 기록 지우기**로 그 반 기록만 지울 수 있어요.
- 학생 기록은 `반_번호`로 저장돼요. 같은 반·번호로 다시 들어오면 이어서 할 수 있고, `2`와 `02`는 같은 반으로 처리돼요.
