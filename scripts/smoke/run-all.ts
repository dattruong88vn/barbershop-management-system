import { spawn } from "node:child_process";

type SmokeGroup = "api" | "ui";

type SmokeScript = {
  description: string;
  group: SmokeGroup;
  name: string;
};

type RunnerOptions = {
  continueOnFailure: boolean;
  groups: SmokeGroup[];
  listOnly: boolean;
};

const smokeScripts: SmokeScript[] = [
  {
    description: "Auth flow qua NextAuth và đổi mật khẩu lần đầu",
    group: "api",
    name: "smoke:auth",
  },
  {
    description: "Service, combo, staff, branch, location management API",
    group: "api",
    name: "smoke:management",
  },
  {
    description: "Dashboard API branch scope và khách mới/quay lại",
    group: "api",
    name: "smoke:dashboard",
  },
  {
    description: "Staff/branch report API date range, scope, filters và pagination",
    group: "api",
    name: "smoke:reports",
  },
  {
    description: "Visit API với service/combo, ảnh haircut và staff assignment",
    group: "api",
    name: "smoke:visits",
  },
  {
    description: "UI chọn chi nhánh cho manager nhiều branch",
    group: "ui",
    name: "smoke:ui:manager-branch",
  },
  {
    description: "UI form nhân viên với province cache và ward lazy load",
    group: "ui",
    name: "smoke:ui:staff-form",
  },
  {
    description: "UI tạo visit mobile, service/combo clear nhau và submit",
    group: "ui",
    name: "smoke:ui:visits",
  },
];

// In hướng dẫn ngắn để người chạy biết các flag runner hỗ trợ.
function printHelp() {
  console.log(`Smoke runner

Usage:
  npm run smoke:all
  npm run smoke:all -- --api-only
  npm run smoke:all -- --ui-only
  npm run smoke:all -- --continue-on-failure
  npm run smoke:all -- --list

Options:
  --api-only             Chỉ chạy API smoke.
  --ui-only              Chỉ chạy Playwright UI smoke.
  --continue-on-failure  Chạy tiếp các smoke còn lại nếu một smoke fail.
  --list                 In danh sách smoke sẽ chạy rồi thoát.
  --help                 In hướng dẫn này.
`);
}

// Dừng runner với thông báo rõ ràng khi flag không hợp lệ.
function fail(message: string): never {
  throw new Error(message);
}

// Đọc CLI args để chọn nhóm smoke và chế độ xử lý khi có lỗi.
function parseOptions(args: string[]): RunnerOptions {
  const options: RunnerOptions = {
    continueOnFailure: false,
    groups: ["api", "ui"],
    listOnly: false,
  };

  for (const arg of args) {
    if (arg === "--api-only") {
      options.groups = ["api"];
      continue;
    }

    if (arg === "--ui-only") {
      options.groups = ["ui"];
      continue;
    }

    if (arg === "--continue-on-failure") {
      options.continueOnFailure = true;
      continue;
    }

    if (arg === "--list") {
      options.listOnly = true;
      continue;
    }

    if (arg === "--help") {
      printHelp();
      process.exit(0);
    }

    fail(`Unknown smoke runner option: ${arg}`);
  }

  return options;
}

// Lọc script theo nhóm người chạy yêu cầu.
function selectScripts(options: RunnerOptions) {
  return smokeScripts.filter((script) => options.groups.includes(script.group));
}

// In danh sách smoke theo thứ tự chạy để dễ review trước khi chạy thật.
function printScriptList(scripts: SmokeScript[]) {
  for (const script of scripts) {
    console.log(`- ${script.name} [${script.group}] ${script.description}`);
  }
}

// Chạy một npm script và trả exit code để runner tổng quyết định dừng hay chạy tiếp.
function runNpmScript(scriptName: string): Promise<number> {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const child = spawn(npmCommand, ["run", scriptName], {
    env: process.env,
    stdio: "inherit",
  });

  return new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("close", (code) => resolve(code ?? 1));
  });
}

// Chạy tuần tự từng smoke để tránh dữ liệu smoke và browser context giẫm lên nhau.
async function runScripts(scripts: SmokeScript[], options: RunnerOptions) {
  const failures: string[] = [];

  for (const script of scripts) {
    console.log(`\n[smoke] Running ${script.name}: ${script.description}`);
    const code = await runNpmScript(script.name);

    if (code === 0) {
      console.log(`[smoke] Passed ${script.name}`);
      continue;
    }

    failures.push(`${script.name} exited with code ${code}`);
    console.error(`[smoke] Failed ${script.name}`);

    if (!options.continueOnFailure) {
      break;
    }
  }

  if (failures.length > 0) {
    console.error("\n[smoke] Failed checks:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("\n[smoke] All selected smoke checks passed.");
}

// Điểm vào chính: parse option, in danh sách nếu cần, rồi chạy smoke đã chọn.
async function main() {
  const options = parseOptions(process.argv.slice(2));
  const scripts = selectScripts(options);

  if (options.listOnly) {
    printScriptList(scripts);
    return;
  }

  printScriptList(scripts);
  await runScripts(scripts, options);
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
