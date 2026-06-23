import { expect, test } from "@playwright/test";
import {
  addSessionCookie,
  assertServerIsRunning,
  baseUrl,
  cleanupSmokeData,
  createBranch,
  disconnectPrisma,
  findOwner,
  findProvinceWithWard,
  stamp,
} from "./helpers.mjs";

test.afterEach(async () => {
  await cleanupSmokeData();
});

test.afterAll(async () => {
  await disconnectPrisma();
});

test("staff form uses warmed province cache and loads wards on province select", async ({
  context,
  page,
  request,
}) => {
  await assertServerIsRunning(request);
  await page.setViewportSize({ width: 1280, height: 900 });

  const owner = await findOwner();
  await createBranch(owner.shopId, "staff-form");
  const province = await findProvinceWithWard();
  let provinceRequestCount = 0;
  let wardRequestCount = 0;

  page.on("request", (requestEvent) => {
    const url = requestEvent.url();
    if (url.includes("/api/locations/provinces")) {
      provinceRequestCount += 1;
    }
    if (url.includes("/api/locations/wards")) {
      wardRequestCount += 1;
    }
  });

  await addSessionCookie(context, owner);
  await page.goto(`${baseUrl}/owner/staff/new`);
  await expect(page.getByRole("heading", { name: "Thêm nhân viên" })).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: "Tỉnh/thành nơi ở hiện tại" }),
  ).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(provinceRequestCount).toBeLessThanOrEqual(1);

  if (!province) {
    test.info().annotations.push({
      description: "No active reference province with wards in local DB.",
      type: "smoke-skip-detail",
    });
    return;
  }

  await page.getByRole("combobox", { name: "Tỉnh/thành nơi ở hiện tại" }).click();
  await page.getByRole("option", { name: province.fullName }).click();
  await expect
    .poll(() => wardRequestCount, { timeout: 5000 })
    .toBeGreaterThanOrEqual(1);

  const ward = province.wards[0];
  await page.getByRole("combobox", { name: "Phường/xã nơi ở hiện tại" }).click();
  await expect(page.getByRole("option", { name: ward.fullName })).toBeVisible();

  await page.getByLabel("Họ tên đầy đủ").fill(`SMOKE UI Staff ${stamp}`);
  await page.getByLabel("Số điện thoại").fill(`05${stamp.slice(-8)}`);
  await page.getByLabel("Ngày tháng năm sinh").fill("1995-01-01");
  await page.getByRole("button", { name: "Chọn giới tính" }).click();
  await page.getByRole("option", { name: "Nam" }).click();
  await page.getByLabel("Tên đăng nhập").fill(`smoke.ui.form.${stamp}`);
  await page.getByLabel("Mật khẩu").fill(`SmokeForm${stamp}!`);
  await expect(page.getByRole("button", { name: "Tạo nhân viên" })).toBeEnabled();
});
