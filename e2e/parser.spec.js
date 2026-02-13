import { test, expect } from '@playwright/test';

test('應該能正確解析 JSON 中的 private_key', async ({ page }) => {
  await page.goto('http://localhost:8080');

  const testJson = JSON.stringify({
    "private_key": "test-private-key-123"
  });

  await page.fill('#rawJsonInput', testJson);
  await page.click('#processBtn');

  const resultKey = await page.inputValue('#resultKey');
  expect(resultKey).toBe('test-private-key-123');
  
  const statusMsg = page.locator('#statusMsg');
  await expect(statusMsg).toContainText('成功提取私鑰');
});

test('應該能從深層結構中提取 private_key', async ({ page }) => {
  await page.goto('http://localhost:8080');

  const testJson = JSON.stringify({
    "metadata": {
      "credentials": {
        "private_key": "nested-private-key-456"
      }
    }
  });

  await page.fill('#rawJsonInput', testJson);
  await page.click('#processBtn');

  const resultKey = await page.inputValue('#resultKey');
  expect(resultKey).toBe('nested-private-key-456');
  
  const statusMsg = page.locator('#statusMsg');
  await expect(statusMsg).toContainText('成功從深層結構中提取 Private Key');
});

test('無效 JSON 應該顯示錯誤訊息', async ({ page }) => {
  await page.goto('http://localhost:8080');

  await page.fill('#rawJsonInput', '{ invalid json }');
  await page.click('#processBtn');

  const statusMsg = page.locator('#statusMsg');
  await expect(statusMsg).toContainText('解析錯誤');
});

test('找不到 private_key 應該顯示錯誤訊息', async ({ page }) => {
  await page.goto('http://localhost:8080');

  await page.fill('#rawJsonInput', '{"hello": "world"}');
  await page.click('#processBtn');

  const statusMsg = page.locator('#statusMsg');
  await expect(statusMsg).toContainText('找不到 "private_key" 欄位');
});
