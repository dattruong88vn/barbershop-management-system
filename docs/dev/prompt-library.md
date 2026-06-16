# Prompt Library Cho Codex

Thư viện prompt mẫu để copy sang Codex khi làm việc trong repo hiện tại hoặc khi bắt đầu một dự án mới. File này là đủ để mang quy ước làm việc sang project khác: mở file, copy prompt phù hợp, thay placeholder, rồi gửi cho Codex.

## Quy Ước

- Prompt phải bắt đầu bằng keyword command tiếng Anh.
- Keyword không phân biệt chữ hoa/thường.
- Phần mô tả sau keyword nên viết bằng tiếng Việt.
- Nếu thiếu keyword, agent phải hỏi lại trước khi đọc thêm file, sửa code, chạy test, commit hoặc push.
- Format chuẩn: `<MODE> [AREA]: <mô tả yêu cầu bằng tiếng Việt>`.

Modes thường dùng:

- `ASK`: chỉ hỏi/giải thích.
- `PLAN`: đọc context và đề xuất kế hoạch, chưa sửa file.
- `FIX`: đọc context và sửa file.
- `REVIEW`: review bug, rủi ro, regression, test còn thiếu.
- `TEST`: chạy test được yêu cầu.
- `COMMIT`: commit các thay đổi hiện tại.
- `PUSH`: push branch và tạo PR.

Areas thường dùng:

- `DOCS`: tài liệu.
- `UI`: giao diện.
- `API`: API route/server logic.
- `DB`: Prisma/database.
- `VISIT`: module visits.
- `REPORT`: module reports.
- `GIT`: git workflow.

## Khởi Tạo Cấu Trúc Codex Cho Dự Án Mới

```text
PLAN DOCS: Tôi muốn tạo cấu trúc Codex/AI agent cho dự án {{PROJECT_NAME}}.

Hãy đề xuất cấu trúc thư mục gồm:
- AGENTS.md
- CONTEXT.md
- docs/dev/
- docs/ui/
- .codex/skills/

Yêu cầu:
- Prompt Commands dùng keyword tiếng Anh, mô tả tiếng Việt, không phân biệt hoa thường.
- Nếu thiếu keyword thì agent phải hỏi lại.
- Tách phần dùng chung và phần domain-specific.
- Có gợi ý nội dung cho AGENTS.md, CONTEXT.md, docs/dev/git-flow.md và các skills cơ bản.
- Chưa sửa file, chỉ đề xuất cấu trúc và nội dung mẫu.
```

```text
FIX DOCS: Tạo cấu trúc Codex/AI agent cho dự án {{PROJECT_NAME}}.

Hãy tạo các file nền tảng:
- AGENTS.md
- CONTEXT.md
- docs/dev/README.md
- docs/dev/git-flow.md
- .codex/skills/project-ui/SKILL.md
- .codex/skills/project-api/SKILL.md
- .codex/skills/project-db/SKILL.md
- .codex/skills/project-git/SKILL.md

Yêu cầu:
- Dùng placeholder cho thông tin chưa rõ: {{DOMAIN}}, {{STACK}}, {{DEV_BRANCH}}, {{MAIN_BRANCH}}.
- Prompt Commands dùng keyword tiếng Anh, mô tả tiếng Việt, không phân biệt hoa thường.
- Nếu thiếu keyword thì agent phải hỏi lại.
- Giữ tài liệu ngắn, rõ, dễ copy sang dự án khác.
- Không chạy test vì chỉ tạo tài liệu.
```

## Tạo AGENTS.md Từ Đầu Cho Dự Án Mới

```text
FIX DOCS: Tạo AGENTS.md cho dự án {{PROJECT_NAME}}.

Thông tin dự án:
- Domain: {{DOMAIN}}
- Stack: {{STACK}}
- Dev branch: {{DEV_BRANCH}}
- Main branch: {{MAIN_BRANCH}}
- Package manager: {{PACKAGE_MANAGER}}

Yêu cầu:
- File ngắn, bắt buộc, dễ đọc.
- Có Prompt Commands với keyword tiếng Anh, mô tả tiếng Việt, không phân biệt hoa thường.
- Nếu thiếu keyword thì agent phải hỏi lại.
- Có Read Order theo task: UI, API, DB, Git, bug fix.
- Có coding rules, testing rules và git rules.
- Dùng placeholder cho phần business rules tôi chưa cung cấp.
- Không chạy test vì chỉ tạo tài liệu.
```

## Viết Hoặc Cập Nhật AGENTS.md

```text
FIX DOCS: Cập nhật AGENTS.md cho dự án {{PROJECT_NAME}}.

Hãy bổ sung:
- Project summary.
- Read Order theo từng loại task.
- Prompt Commands với keyword tiếng Anh, mô tả tiếng Việt, không phân biệt hoa thường.
- Rule nếu thiếu keyword thì hỏi lại.
- Business rules quan trọng.
- Coding rules.
- Testing rules.
- Git rules.

Giữ file ngắn và bắt buộc; chi tiết dài đặt trong docs/dev/.
Không chạy test vì chỉ sửa tài liệu.
```

## Tạo Skill Mới

```text
PLAN DOCS: Tôi muốn tạo Codex skill mới cho module {{MODULE_NAME}}.

Hãy đề xuất:
- Khi nào skill này được dùng.
- File nào cần đọc trước.
- Business rules quan trọng.
- Coding rules.
- Checklist trước khi hoàn thành.

Chưa sửa file.
```

```text
FIX DOCS: Tạo Codex skill mới cho module {{MODULE_NAME}}.

Hãy tạo `.codex/skills/{{SKILL_NAME}}/SKILL.md`.
Skill cần có:
- name và description.
- Read First.
- Rules.
- Checklist.

Cập nhật AGENTS.md nếu cần để thêm read order cho module này.
Không chạy test vì chỉ sửa tài liệu.
```

## Sửa Bug Theo Module

```text
FIX {{AREA}}: {{MÔ_TẢ_LỖI}}

Hãy đọc đúng Read Order trong AGENTS.md.
Sửa code luôn.
Không viết test và không chạy test nếu tôi không yêu cầu.
Sau khi sửa, tóm tắt file đã thay đổi và rủi ro còn lại.
```

## Review Code

```text
REVIEW {{AREA}}: Review {{PHẠM_VI_REVIEW}}.

Tập trung vào:
- Bug.
- Rủi ro bảo mật hoặc phân quyền.
- Regression.
- Thiếu test quan trọng.
- Vi phạm coding rules trong AGENTS.md.

Không sửa file.
```

## Tạo UI

```text
FIX UI: Tạo hoặc cập nhật màn hình {{SCREEN_NAME}}.

Hãy đọc UI read order trong AGENTS.md.
Trước khi viết UI, tìm component dùng lại trong `src/components/global/`.
UI text đặt trong `src/constants/texts/`.
Không hardcode màu hoặc spacing.
Không viết test và không chạy test nếu tôi không yêu cầu.
```

## Tích Hợp Requirements Và v0 Component

```text
PLAN UI: Đánh giá component được generate từ v0.app trước khi tích hợp.

Requirements:
{{REQUIREMENTS}}

v0 component:
{{V0_COMPONENT_CODE_OR_FILE_PATH}}

Hãy review:
- Component này có đáp ứng requirements không.
- Cần tách thành những component nào.
- Có thể reuse component global nào trong repo.
- Có rủi ro responsive/accessibility/code structure không.
- Cần chỉnh gì để đúng design system và AGENTS.md.
- Cần thêm loading, empty, error states nào.

Chưa sửa file.
```

```text
FIX UI: Tích hợp component được generate từ v0.app vào repo.

Requirements:
{{REQUIREMENTS}}

v0 component:
{{V0_COMPONENT_CODE_OR_FILE_PATH}}

Mục tiêu:
- Dùng v0 output làm bản nháp UI.
- Refactor để đúng structure của repo.
- Reuse component trong `src/components/global/` nếu có.
- UI text đưa vào `src/constants/texts/`.
- Không hardcode màu/spacing; dùng design tokens.
- Dùng lucide icons nếu cần icon actions.
- Thêm loading, empty, error states nếu phù hợp.
- Không dùng fetch trực tiếp trong component.
- Không viết test và không chạy test nếu tôi không yêu cầu.

Sau khi xong:
- Tóm tắt file đã thay đổi.
- Nêu rõ phần nào giữ từ v0 và phần nào đã chỉnh để khớp repo.
```

```text
FIX UI: Chuyển v0 component thành global reusable component.

Requirements:
{{REQUIREMENTS}}

v0 component:
{{V0_COMPONENT_CODE_OR_FILE_PATH}}

Hãy:
- Đọc UI read order trong AGENTS.md.
- Kiểm tra `src/components/global/` trước.
- Tách component thành reusable component nếu phù hợp.
- Đặt component trong `src/components/global/{{COMPONENT_NAME}}/`.
- Thêm `index.ts` barrel export nếu folder có exports.
- Đưa text hiển thị vào `src/constants/texts/` nếu component có text cố định.
- Dùng design tokens, không hardcode màu/spacing.
- Thêm states: default, loading, disabled, empty, error nếu phù hợp.
- Không chạy test nếu tôi không yêu cầu.
```

```text
FIX UI: Chuyển v0 component thành screen/page trong repo.

Requirements:
{{REQUIREMENTS}}

v0 component:
{{V0_COMPONENT_CODE_OR_FILE_PATH}}

Route mong muốn:
{{ROUTE_OR_PAGE_PATH}}

Hãy:
- Đọc UI read order trong AGENTS.md.
- Route page chỉ giữ orchestration và page-level semantics.
- UI chính đặt trong `src/components/screens/{{SCREEN_NAME}}/` hoặc module phù hợp.
- Reuse global components trước khi tạo mới.
- Dùng `ROUTES` cho navigation.
- Dùng `API_ROUTES` nếu cần gọi API.
- Không dùng fetch trực tiếp trong component.
- Thêm loading, empty, error states.
- Không viết test và không chạy test nếu tôi không yêu cầu.
```

```text
REVIEW UI: Review v0 component trước khi dùng trong production.

Requirements:
{{REQUIREMENTS}}

v0 component:
{{V0_COMPONENT_CODE_OR_FILE_PATH}}

Tập trung vào:
- Có đáp ứng requirements không.
- Vi phạm design system không.
- Có hardcode màu, spacing, text, route, API path không.
- Có dùng component global hiện có chưa.
- Accessibility: label, keyboard, focus state, aria.
- Responsive/mobile.
- State handling: loading, empty, error, disabled.
- Có code/mock data nên tách ra constants/types/utils không.

Không sửa file.
```

```text
FIX UI: Refactor v0 component để khớp design system.

Requirements:
{{REQUIREMENTS}}

v0 component:
{{V0_COMPONENT_CODE_OR_FILE_PATH}}

Hãy refactor:
- Giữ layout và ý tưởng chính từ v0 nếu phù hợp.
- Thay màu/spacing hardcode bằng design tokens.
- Thay icon/custom SVG bằng lucide icons nếu có icon tương ứng.
- Thay native/hand-rolled control bằng global component nếu repo đã có.
- Tách text sang `src/constants/texts/`.
- Tách finite values sang `src/constants/common/`.
- Tách shared types sang `src/types/`.
- Tách shared helpers sang `src/utils/`.
- Không chạy test nếu tôi không yêu cầu.
```

```text
PLAN UI: Lập kế hoạch tích hợp nhiều v0 components.

Requirements:
{{REQUIREMENTS}}

Danh sách v0 components:
{{V0_COMPONENT_LIST_OR_PATHS}}

Hãy đề xuất:
- Component nào nên là global component.
- Component nào nên là module component.
- Component nào chỉ nên là screen-specific component.
- Thứ tự tích hợp.
- File/folder dự kiến tạo hoặc sửa.
- Rủi ro về duplication, responsive, accessibility, design consistency.

Chưa sửa file.
```

```text
FIX UI: Tích hợp v0 component vào repo.

Requirements:
{{REQUIREMENTS}}

v0 component:
{{V0_COMPONENT_CODE_OR_FILE_PATH}}

Dùng v0 output làm bản nháp UI, refactor để đúng AGENTS.md, design system và structure của repo.
Không viết test và không chạy test nếu tôi không yêu cầu.
```

## Tạo API

```text
FIX API: Tạo hoặc cập nhật API cho {{FEATURE_NAME}}.

Hãy đọc API read order trong AGENTS.md.
API route phải trả JSON.
Dùng Prisma, không dùng raw SQL.
Enforce tenant/shop_id nếu dữ liệu thuộc tenant.
Không viết test và không chạy test nếu tôi không yêu cầu.
```

## Tạo DB/Prisma

```text
PLAN DB: Thiết kế thay đổi database cho {{FEATURE_NAME}}.

Hãy đọc DB read order trong AGENTS.md.
Đề xuất model, relation, enum, constraint và migration cần thiết.
Chưa sửa file.
```

```text
FIX DB: Cập nhật Prisma schema cho {{FEATURE_NAME}}.

Hãy đọc DB read order trong AGENTS.md.
Tenant-owned table phải có và enforce shop_id.
Không chạy migration hoặc test nếu tôi không yêu cầu.
```

## Commit

```text
COMMIT: commit các thay đổi hiện tại.

Hãy kiểm tra git diff, chạy các bước bắt buộc theo AGENTS.md, commit theo format của repo, rồi dừng.
```

## Push/PR

```text
PUSH: push branch hiện tại và tạo PR vào develop.

Hãy commit nếu còn thay đổi chưa commit.
Push branch hiện tại.
Tạo PR vào `develop`.
Sau khi xong, gửi link PR.
```
