import { expect, test } from "@playwright/test";
import {
  addSessionCookie,
  assertServerIsRunning,
  baseUrl,
  cleanupSmokeData,
  collectVisitsForCustomer,
  createCombo,
  createCustomer,
  createManagerWithBranches,
  createService,
  createUser,
  disconnectPrisma,
  findOwner,
  stamp,
} from "./helpers.mjs";

test.afterEach(async () => {
  await cleanupSmokeData();
});

test.afterAll(async () => {
  await disconnectPrisma();
});

test("visit create UI clears service/combo selections and submits", async ({
  context,
  page,
  request,
}) => {
  await assertServerIsRunning(request);
  await page.setViewportSize({ width: 390, height: 844 });

  const owner = await findOwner();
  const { firstBranch, manager } = await createManagerWithBranches(owner.shopId);
  const barber = await createUser({
    branchId: firstBranch.id,
    fullName: `SMOKE UI Barber ${stamp}`,
    role: "barber",
    shopId: owner.shopId,
    username: `smoke.ui.barber.${stamp}`,
  });
  const skinner = await createUser({
    branchId: firstBranch.id,
    fullName: `SMOKE UI Skinner ${stamp}`,
    role: "skinner",
    shopId: owner.shopId,
    username: `smoke.ui.skinner.${stamp}`,
  });
  const customer = await createCustomer(owner.shopId);
  const service = await createService({
    branchId: firstBranch.id,
    createdBy: manager.id,
    isHaircut: true,
    name: `SMOKE UI Service ${stamp}`,
    price: 120000,
    responsibleRole: "barber",
    shopId: owner.shopId,
  });
  const comboService = await createService({
    branchId: firstBranch.id,
    createdBy: manager.id,
    name: `SMOKE UI Combo Service ${stamp}`,
    price: 90000,
    responsibleRole: "skinner",
    shopId: owner.shopId,
  });
  const combo = await createCombo({
    branchId: firstBranch.id,
    createdBy: manager.id,
    name: `SMOKE UI Combo ${stamp}`,
    price: 100000,
    serviceIds: [service.id, comboService.id],
    shopId: owner.shopId,
  });

  await addSessionCookie(context, manager, firstBranch.id);
  const params = new URLSearchParams({
    customerId: customer.id,
    name: customer.name,
    origin: "visits",
    phone: customer.phone,
  });

  await page.goto(`${baseUrl}/visits/create?${params.toString()}`);
  await expect(page.getByRole("heading", { name: "Tạo visit" })).toBeVisible();
  await expect(page.getByText(customer.name)).toBeVisible();

  const serviceCheckbox = page.getByLabel(service.name);
  const comboCheckbox = page.getByLabel(combo.name);
  await serviceCheckbox.check();
  await expect(serviceCheckbox).toBeChecked();
  await comboCheckbox.check();
  await expect(comboCheckbox).toBeChecked();
  await expect(serviceCheckbox).not.toBeChecked();

  await page.getByRole("combobox", { name: "Thợ cắt" }).click();
  await page.getByRole("option", { name: barber.fullName }).click();
  await page.getByRole("combobox", { name: "Skinner" }).click();
  await page.getByRole("option", { name: skinner.fullName }).click();
  await page.getByRole("button", { name: "Tạo visit" }).click();

  await expect(page).toHaveURL(/\/visits\/[0-9a-f-]+/i);
  await collectVisitsForCustomer(customer.id);
});
