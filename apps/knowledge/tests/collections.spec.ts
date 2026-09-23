import { test, expect } from '@playwright/test';
for (const width of [1440, 390]) {
  test(`collection projects and learning paths at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.getByRole('button', { name: '进入本地工作台' }).click();
    await expect(page.getByRole('heading', {name:'我的知识库', exact:true})).toBeVisible();
    if (width < 600) await page.getByRole('button', {name:'打开知识目录'}).click();
    await page.getByRole('button', {name:'项目', exact:true}).click();
    await page.locator('.collection-card').filter({has:page.getByRole('heading',{name:'Addx',exact:true})}).click();
    await expect(page.locator('.note-row')).toHaveCount(19);
    await expect(page.locator('.note-row h3').first()).toHaveText('复习索引');
    await page.locator('.note-row').first().click();
    await page.getByRole('button', {name:'学习路径 · Addx · 从面试准备到入职成长',exact:true}).click();
    await expect(page.locator('.note-row h3').first()).toHaveText('公司研究');
    await page.locator('.note-row').first().click();
    await page.getByRole('button', {name:/下一篇.*面试准备总览/}).click();
    await expect(page.locator('.reader h1')).toHaveText('面试准备总览');
    await page.getByRole('button', {name:'项目 · Addx',exact:true}).click();
    if (width < 600) await page.getByRole('button', {name:'打开知识目录'}).click();
    await page.getByRole('button', {name:'项目',exact:true}).click();
    await page.locator('.collection-card').filter({has:page.getByRole('heading',{name:'RightCapital',exact:true})}).click();
    await expect(page.locator('.note-row h3').first()).toHaveText('自我介绍');
    await page.locator('.note-row').first().click();
    await page.getByRole('button', {name:'学习路径 · RightCapital · 基础到工程实践',exact:true}).click();
    await expect(page.locator('.note-row h3').nth(1)).toHaveText('React+浏览器加载');
    await page.locator('.note-row').nth(1).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
