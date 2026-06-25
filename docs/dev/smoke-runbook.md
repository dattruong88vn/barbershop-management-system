# Smoke Runbook

Runbook này dùng khi cần kiểm nhanh các flow chính trên dev server thật trước khi commit, sau khi merge nhánh lớn, hoặc trước khi đưa build lên staging.

## Chuẩn bị môi trường

1. Dùng Node theo repo, ví dụ `nvm use 24`.
2. Đảm bảo `.env.local` trỏ đúng DB dev và có `NEXTAUTH_SECRET`.
3. Generate reference client nếu vừa đổi schema/location data: `npm run reference:generate`.
4. Start dev server trên port mặc định: `npm run dev -- -p 3000`.
5. Cài browser Playwright nếu máy chưa có: `npx playwright install chromium`.

## Lệnh chạy nhanh

- Chạy toàn bộ smoke tuần tự: `npm run smoke:all`.
- Chỉ chạy API smoke: `npm run smoke:all -- --api-only`.
- Chỉ chạy UI smoke: `npm run smoke:all -- --ui-only`.
- Xem danh sách smoke sẽ chạy: `npm run smoke:all -- --list`.
- Chạy tiếp để gom đủ lỗi: `npm run smoke:all -- --continue-on-failure`.

Runner tổng luôn chạy tuần tự để tránh các script cùng tạo và cleanup dữ liệu smoke trên DB dev.

## Quy trình chạy full

1. Mở terminal dev server: `npm run dev -- -p 3000`.
2. Chờ Next.js báo `Ready`.
3. Mở terminal khác và chạy `npm run smoke:all`.
4. Giữ nguyên terminal dev server để đọc log request nếu runner fail.
5. Sau khi pass, dừng dev server để tránh dùng nhầm process cũ ở lần chạy sau.

Nếu chỉ muốn kiểm danh sách flow trước khi chạy thật, dùng `npm run smoke:all -- --list`. Lệnh này không cần dev server.

## Khi nào chạy nhóm nào

- Sửa auth, middleware, role redirect: chạy `npm run smoke:all -- --api-only`, tối thiểu phải pass `smoke:auth`.
- Sửa service, combo, staff, branch, location API: chạy `npm run smoke:management`.
- Sửa dashboard/report API, branch filter dashboard, khách mới/quay lại: chạy `npm run smoke:dashboard`.
- Sửa staff report API, filter, branch scope hoặc detail pagination: chạy `npm run smoke:reports`.
- Sửa visit API, pricing snapshot, haircut photo, staff assignment: chạy `npm run smoke:visits`.
- Sửa UI form visit, form staff, manager branch selection: chạy `npm run smoke:all -- --ui-only`.
- Trước commit lớn hoặc trước staging: chạy `npm run smoke:all`.

## Smoke Test Triggers

Sau khi `FIX` các phần dưới đây, agent phải chạy smoke tương ứng trừ khi user nói rõ không chạy test. Rule này là ngoại lệ của rule không tự chạy unit test/ESLint sau implementation.

- Auth, session, middleware, role redirect, manager branch scope: chạy `npm run smoke:management`; nếu có đổi login/change-password thì chạy thêm `npm run smoke:auth`.
- Dashboard/report API, metric doanh thu, khách mới/quay lại, branch-scoped report/dashboard: chạy `npm run smoke:dashboard`.
- Staff report API, date range, role/search filter hoặc detail pagination: chạy `npm run smoke:reports`.
- Service, combo, staff, branch, location API hoặc management role/scope: chạy `npm run smoke:management`.
- Visit create/update/detail, service-combo selection, pricing snapshot, haircut photo, staff assignment: chạy `npm run smoke:visits`.
- Manager branch selection UI: chạy `npm run smoke:ui:manager-branch`.
- Staff form UI: chạy `npm run smoke:ui:staff-form`.
- Visit UI: chạy `npm run smoke:ui:visits`.
- Thay đổi chạm nhiều nhóm hoặc trước `PUSH`: chạy `npm run smoke:all`.

Nếu smoke cần dev server, browser, dữ liệu dev hoặc network mà không chạy được, agent phải báo rõ lý do và không bỏ qua âm thầm.

## Đọc kết quả fail

API smoke in log theo dạng `[ok] ...`. Dòng fail đầu tiên thường là rule nghiệp vụ hoặc response status không đúng.

Playwright UI smoke tạo artefact trong `test-results/` khi fail. Xem `error-context.md` trước vì file này cho biết DOM thực tế, locator nào fail, và source line nào cần soi.

Nếu dev server log có lỗi sau khi test đã fail, kiểm tra xem request UI còn đang chạy trong lúc cleanup không. Trường hợp này thường là test timeout hoặc locator đợi sai element, không nhất thiết là lỗi API chính.

Khi `smoke:all` fail, runner mặc định dừng ở script lỗi đầu tiên. Không nên chạy lại full ngay lập tức nếu chưa hiểu lỗi, vì output sẽ dài và khó đọc. Chạy script riêng trước, ví dụ:

- `npm run smoke:auth` nếu fail ở auth.
- `npm run smoke:management` nếu fail ở service/combo/staff/branch/location.
- `npm run smoke:visits` nếu fail ở visit API.
- `npm run smoke:ui:visits` nếu fail ở Playwright visit UI.

Sau khi script riêng pass, chạy lại `npm run smoke:all` để đảm bảo thứ tự đầy đủ vẫn ổn.

## Dữ liệu smoke

- API smoke tạo dữ liệu prefix `SMOKE ...`.
- UI smoke tạo dữ liệu prefix `SMOKE UI ...`.
- Script phải cleanup dữ liệu tự tạo theo id đã ghi nhận, không xoá rộng theo prefix khi đang chạy song song.
- Không chạy smoke trên DB production.

## Yêu cầu riêng của Playwright

- Dev server phải đang chạy và truy cập được qua `SMOKE_BASE_URL` hoặc mặc định `http://localhost:3000`.
- Chromium phải được install cho Playwright.
- DB dev cần có ít nhất một owner active trong shop active.
- UI smoke dùng session cookie NextAuth trực tiếp để vào màn cần test, nên `NEXTAUTH_SECRET` trong `.env.local` phải đúng với app.

## Khi thêm smoke mới

1. Thêm script riêng vào `package.json`.
2. Nếu là API smoke, đặt file trong `scripts/smoke/`.
3. Nếu là UI smoke, đặt spec trong `scripts/smoke/playwright/`.
4. Mỗi function trong file smoke phải có comment tiếng Việt nêu mục đích flow.
5. Đăng ký script mới trong `scripts/smoke/run-all.ts`.
6. Cập nhật `docs/dev/smoke-tests.md` và runbook này nếu flow mới cần lưu ý vận hành.
