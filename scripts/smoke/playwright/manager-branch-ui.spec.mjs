import { expect, test } from "@playwright/test";
import {
  addSessionCookie,
  assertServerIsRunning,
  baseUrl,
  cleanupSmokeData,
  createManagerWithBranches,
  disconnectPrisma,
  findOwner,
} from "./helpers.mjs";

test.afterEach(async () => {
  await cleanupSmokeData();
});

test.afterAll(async () => {
  await disconnectPrisma();
});

test("manager branch selection shows assigned branches and selects one", async ({
  context,
  page,
  request,
}) => {
  await assertServerIsRunning(request);
  await page.setViewportSize({ width: 1280, height: 900 });

  const owner = await findOwner();
  const { firstBranch, manager, secondBranch } = await createManagerWithBranches(
    owner.shopId,
  );
  await addSessionCookie(context, manager, null);

  await page.goto(`${baseUrl}/manager/select-branch`);
  await expect(page.getByRole("heading", { name: "Chọn chi nhánh" })).toBeVisible();
  await expect(page.getByText(firstBranch.name)).toBeVisible();
  await expect(page.getByText(secondBranch.name)).toBeVisible();

  await page
    .getByRole("button", { name: "Làm việc tại chi nhánh này" })
    .first()
    .click();

  await expect(page).toHaveURL(/\/dashboard$/);
});
