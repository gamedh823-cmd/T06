# 플랜두씨 다이어리 1 — 내 계획과 실제를 담는 앱

Plan(계획) → Do(실제로 한 일) → See(돌아보기)가 하나로 이어지는, 로그인 없는 다이어리 앱입니다.
자료는 Supabase(Postgres) 서버 데이터베이스에 저장되며, 새로고침해도 그대로 남습니다.

## 1. Supabase 프로젝트 만들기 (최초 1회, 직접 로그인 필요)

1. https://supabase.com 접속 → "Continue with GitHub"로 가입/로그인
2. "New project" → 이름 지정, 데이터베이스 비밀번호는 아무 값이나 (직접 기억해 둘 필요는 없음) → 리전은 Northeast Asia (Seoul) 추천
3. 프로젝트가 준비되면 왼쪽 메뉴 **SQL Editor** → New query
4. 이 저장소의 `supabase/schema.sql` 내용을 통째로 붙여넣고 **Run**
5. 왼쪽 메뉴 **Project Settings → API**에서 다음 두 값을 복사:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> 이 두 값은 브라우저에 노출되어도 되는 공개 키입니다(로그인이 없는 T06 설계상 RLS를 전체 공개로 열어 두었습니다). `service_role` 키는 이 프로젝트 어디에서도 쓰지 않습니다.

## 2. 로컬 실행

```bash
cp .env.example .env.local
# .env.local을 열어 위에서 복사한 두 값을 채워 넣기
npm install
npm run dev
```

http://localhost:3000 에서 확인합니다.

## 3. Vercel로 배포하기 (직접 로그인 필요)

1. https://vercel.com 접속 → "Continue with GitHub"로 가입/로그인
2. GitHub에 이 저장소를 먼저 push (아래 4번 참고)
3. Vercel에서 "Add New… → Project" → 방금 push한 저장소 선택
4. **Environment Variables**에 `.env.local`과 같은 두 값을 추가
5. Deploy — 완료되면 나오는 `https://*.vercel.app` 주소가 제출할 결과물 URL입니다

## 4. GitHub에 소스 올리기

```bash
git init
git add .
git commit -m "Initial commit: plan-do-see diary"
gh repo create <repo-이름> --private --source=. --remote=origin --push
```

제출 시 소스 주소는 `https://github.com/<계정>/<repo-이름>/commit/<커밋 해시>` 형식의 고정 URL로 제출합니다.

## 폴더 구조

- `src/app` — 페이지 (계획 목록/상세/수정, 할 일 수정, 돌아보기 및 드릴다운, 내보내기 API)
- `src/lib/actions.ts` — 계획/할 일 생성·수정·삭제, 완료 처리(멱등), 돌아보기 메모 서버 액션
- `src/lib/queries.ts` — Supabase 조회 및 집계 로직
- `supabase/schema.sql` — 테이블·RLS 정의 (Supabase SQL Editor에서 실행)
- `contracts/pds-schema-v2.json` — 최종 DB 스키마·집계 규칙 문서
