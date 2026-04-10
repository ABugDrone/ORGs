# Playwright — Comprehensive Testing Skill Reference

Source: https://playwright.dev/docs/intro

---

## What is Playwright?

Playwright is a modern end-to-end (E2E) testing framework by Microsoft. It bundles:
- Test runner
- Assertions with auto-retry
- Browser isolation per test
- Parallelization
- Tracing, screenshots, video recording
- Code generation (Codegen)

Supports: **Chromium, Firefox, WebKit** on Windows, macOS, Linux — headless or headed, locally or in CI.

---

## Installation

```bash
# Initialize in existing project
npm init playwright@latest

# Prompts:
# - TypeScript or JavaScript (default: TypeScript)
# - Tests folder (default: tests/)
# - Add GitHub Actions workflow
# - Install browsers (default: yes)
```

What gets created:
```
playwright.config.ts    # Central config
tests/
  example.spec.ts       # Starter test
```

Install browsers separately:
```bash
npx playwright install              # all browsers
npx playwright install chromium     # just Chromium
npx playwright install --with-deps  # browsers + OS deps (for CI)
```

---

## Writing Tests

### Basic structure

```typescript
import { test, expect } from '@playwright/test';

test('page has title', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example/);
});

test('button click works', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.getByRole('button', { name: 'Upload' }).click();
  await expect(page.getByText('File uploaded')).toBeVisible();
});
```

### Test hooks

```typescript
import { test, expect } from '@playwright/test';

test.describe('File Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test.afterEach(async ({ page }) => {
    // cleanup
  });

  test.beforeAll(async () => { /* runs once before all tests */ });
  test.afterAll(async () => { /* runs once after all tests */ });

  test('uploads a file', async ({ page }) => {
    // test body
  });
});
```

---

## Locators — Finding Elements

Playwright's locators auto-wait and auto-retry. Always prefer user-facing locators.

### Priority order (most to least preferred)

```typescript
// 1. By role (best — matches how users see the page)
page.getByRole('button', { name: 'Sign in' })
page.getByRole('heading', { name: 'Dashboard' })
page.getByRole('link', { name: 'Files' })
page.getByRole('checkbox', { name: 'Remember me' })
page.getByRole('textbox', { name: 'Search' })

// 2. By label (for form inputs)
page.getByLabel('Email address')
page.getByLabel('Password')

// 3. By placeholder
page.getByPlaceholder('Search files...')

// 4. By text content
page.getByText('Welcome to ORGs')
page.getByText('Upload', { exact: true })

// 5. By alt text (images)
page.getByAltText('ORGs logo')

// 6. By title attribute
page.getByTitle('Close dialog')

// 7. By test ID (most stable for automation)
page.getByTestId('file-upload-zone')
page.getByTestId('search-results')
```

### Chaining locators

```typescript
// Find inside a specific container
const sidebar = page.getByRole('navigation');
await sidebar.getByRole('link', { name: 'Files' }).click();

// Filter by text
page.getByRole('listitem').filter({ hasText: 'report.pdf' })

// nth element
page.getByRole('listitem').nth(0)
page.getByRole('listitem').first()
page.getByRole('listitem').last()
```

---

## Actions

```typescript
// Navigation
await page.goto('http://localhost:5173');
await page.goBack();
await page.goForward();
await page.reload();

// Clicking
await page.getByRole('button', { name: 'Upload' }).click();
await page.getByRole('button').dblclick();
await page.getByRole('button').click({ button: 'right' }); // right-click

// Typing
await page.getByLabel('Search').fill('report.pdf');
await page.getByLabel('Search').clear();
await page.getByLabel('Search').pressSequentially('hello', { delay: 50 });
await page.keyboard.press('Enter');
await page.keyboard.press('Control+A');

// File upload
await page.getByLabel('Upload file').setInputFiles('path/to/file.pdf');
await page.getByLabel('Upload file').setInputFiles(['file1.pdf', 'file2.docx']);

// Dropdowns
await page.getByRole('combobox').selectOption('PDF');
await page.getByRole('combobox').selectOption({ label: 'Documents' });

// Hover
await page.getByRole('button').hover();

// Drag and drop
await page.getByTestId('file').dragTo(page.getByTestId('folder'));

// Scroll
await page.getByTestId('file-list').evaluate(el => el.scrollTop = 500);

// Wait for element
await page.getByText('Upload complete').waitFor();
await page.getByText('Loading').waitFor({ state: 'hidden' });
```

---

## Assertions

### Auto-retrying (async — always await these)

```typescript
// Visibility
await expect(page.getByText('Welcome')).toBeVisible();
await expect(page.getByText('Error')).toBeHidden();

// Text content
await expect(page.getByRole('heading')).toHaveText('Dashboard');
await expect(page.getByRole('heading')).toContainText('ORGs');

// Input values
await expect(page.getByLabel('Search')).toHaveValue('report.pdf');
await expect(page.getByRole('checkbox')).toBeChecked();

// Element state
await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled();
await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled();
await expect(page.getByRole('button')).toBeFocused();

// Lists
await expect(page.getByRole('listitem')).toHaveCount(5);

// Page-level
await expect(page).toHaveTitle(/ORGs/);
await expect(page).toHaveURL('http://localhost:5173/files');

// CSS / attributes
await expect(page.getByRole('button')).toHaveClass(/primary/);
await expect(page.getByRole('img')).toHaveAttribute('alt', 'ORGs logo');

// Screenshots (visual regression)
await expect(page).toHaveScreenshot('dashboard.png');
await expect(page.getByTestId('file-card')).toHaveScreenshot();
```

### Non-retrying (sync — no await)

```typescript
expect(value).toBe(42);
expect(value).toEqual({ name: 'test' });
expect(array).toContain('item');
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(number).toBeGreaterThan(0);
expect(number).toBeLessThan(100);
```

### Polling assertions (for dynamic conditions)

```typescript
await expect.poll(async () => {
  const count = await page.getByRole('listitem').count();
  return count;
}).toBeGreaterThan(0);

await expect.poll(() => fetch('/api/status').then(r => r.json()))
  .toMatchObject({ status: 'ready' });
```

---

## Configuration (playwright.config.ts)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 30000,

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',     // record trace on first retry
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    headless: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Add more browsers when needed:
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  // Start dev server before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  expect: {
    timeout: 5000,
    toHaveScreenshot: { maxDiffPixels: 10 },
  },

  outputDir: 'test-results',
});
```

---

## Fixtures

Fixtures provide isolated, reusable test setup. Built-in fixtures:

| Fixture | Type | Description |
|---------|------|-------------|
| `page` | Page | Isolated browser page per test |
| `context` | BrowserContext | Isolated browser context (like a new profile) |
| `browser` | Browser | Shared browser instance |
| `browserName` | string | `'chromium'`, `'firefox'`, or `'webkit'` |
| `request` | APIRequestContext | For API testing |

### Custom fixtures

```typescript
import { test as base, expect } from '@playwright/test';

// Define custom fixture
const test = base.extend<{ settingsPage: SettingsPage }>({
  settingsPage: async ({ page }, use) => {
    const settings = new SettingsPage(page);
    await settings.goto();
    await use(settings);
    // teardown after test
  },
});

test('can change theme', async ({ settingsPage }) => {
  await settingsPage.selectTheme('dark');
  await expect(settingsPage.body).toHaveClass(/dark/);
});
```

### Page Object Model (POM)

```typescript
// pages/FilesPage.ts
import { Page, Locator } from '@playwright/test';

export class FilesPage {
  readonly page: Page;
  readonly uploadZone: Locator;
  readonly searchInput: Locator;
  readonly fileList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.uploadZone = page.getByTestId('file-upload-zone');
    this.searchInput = page.getByPlaceholder('Search files...');
    this.fileList = page.getByRole('list', { name: 'files' });
  }

  async goto() {
    await this.page.goto('/files');
  }

  async uploadFile(filePath: string) {
    await this.page.getByLabel('Upload file').setInputFiles(filePath);
    await this.page.getByRole('button', { name: 'Upload' }).click();
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.page.keyboard.press('Enter');
  }
}
```

---

## Running Tests

```bash
# Run all tests
npx playwright test

# Run specific file
npx playwright test tests/files.spec.ts

# Run with specific title
npx playwright test -g "uploads a file"

# Run in headed mode (see browser)
npx playwright test --headed

# Run on specific browser
npx playwright test --project=chromium

# Run in UI mode (best for development)
npx playwright test --ui

# Debug mode (step through)
npx playwright test --debug

# Run last failed tests only
npx playwright test --last-failed

# Generate code (Codegen)
npx playwright codegen http://localhost:5173

# Show HTML report
npx playwright show-report

# Run with trace
npx playwright test --trace on
```

---

## Codegen — Auto-generate Tests

```bash
npx playwright codegen http://localhost:5173
```

Opens a browser + Playwright Inspector. Interact with the app — Playwright writes the test code automatically. Best locators are chosen automatically (role > text > testId).

---

## Trace Viewer

Traces record every action, screenshot, network request, and console log.

```typescript
// playwright.config.ts
use: {
  trace: 'on-first-retry',  // record on first retry
  // or: 'on', 'off', 'retain-on-failure'
}
```

```bash
# Force trace recording
npx playwright test --trace on

# View trace
npx playwright show-report
# Click on a test → Traces tab
```

---

## CI Integration (GitHub Actions)

```yaml
name: Playwright Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

## Applying Playwright to ORGs App

### Setup for ORGs

```bash
npm init playwright@latest
# Choose: TypeScript, tests/ folder, add GitHub Actions, install browsers
```

### Key tests to write for ORGs

```typescript
// tests/setup.spec.ts — First-run setup
test('first run shows setup wizard', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Welcome — let\'s get set up')).toBeVisible();
});

test('can select primary folder', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Click to select a folder').click();
  // In Electron: dialog handled via IPC mock
});

// tests/files.spec.ts — File management
test('can upload a file', async ({ page }) => {
  await page.goto('/files');
  await page.getByRole('tab', { name: 'Upload' }).click();
  await page.getByLabel('Upload file').setInputFiles('test-fixtures/sample.pdf');
  await page.getByRole('button', { name: 'Upload' }).click();
  await expect(page.getByText('1 file uploaded')).toBeVisible();
});

test('uploaded file appears in Files tab', async ({ page }) => {
  await page.goto('/files');
  await page.getByRole('tab', { name: 'Files' }).click();
  await expect(page.getByText('sample.pdf')).toBeVisible();
});

// tests/search.spec.ts — Search
test('search finds files by name', async ({ page }) => {
  await page.goto('/search');
  await page.getByPlaceholder('Search files by name, type, date...').fill('sample');
  await expect(page.getByText('sample.pdf')).toBeVisible();
});

// tests/themes.spec.ts — Theme switching
test('dark mode toggle works', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /moon|sun/i }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
});

test('can apply neon theme', async ({ page }) => {
  await page.goto('/settings');
  await page.getByRole('tab', { name: 'Appearance' }).click();
  await page.getByText('Neon Glow').click();
  await expect(page.locator('body')).toHaveClass(/theme-neon/);
});
```

### Playwright config for ORGs

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  fullyParallel: false,  // ORGs uses localStorage — run sequentially
  retries: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
});
```

---

## Key Concepts Summary

| Concept | What it does |
|---------|-------------|
| `test()` | Define a test case |
| `expect()` | Assert a condition |
| `page` | Represents a browser tab |
| `locator` | Finds elements, auto-waits |
| `fixture` | Reusable test setup/teardown |
| `trace` | Records full test execution for debugging |
| `codegen` | Auto-generates test code from browser interaction |
| `--ui` | Visual test runner with time-travel debugging |
| `--debug` | Step-through debugger |
| `webServer` | Auto-starts dev server before tests |

---

*Content sourced from [playwright.dev/docs](https://playwright.dev/docs) — paraphrased for compliance with licensing restrictions.*
