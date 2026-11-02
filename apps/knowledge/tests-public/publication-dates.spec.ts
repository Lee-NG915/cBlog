import { test, expect } from '@playwright/test';
import fs from 'node:fs';
const marker=JSON.parse(fs.readFileSync('../web/out/publication.json','utf8'));
const entries=marker.publicNotes.filter((n:any)=>n.displayPublishedAt);
test('every published article exposes its editorial date without replacing edit metadata',async({request})=>{
 expect(entries.length).toBeGreaterThan(0);
 for(const n of entries){
  const response=await request.get('./'+n.route+'/');
  expect(response.status(),n.route).toBe(200);
  const html=await response.text();
  const times=[...html.matchAll(/<time\b[^>]+>[\s\S]*?<\/time>/g)].map(x=>x[0]);
  const published=times.find(x=>x.includes('data-article-date="published"'));
  expect(published,n.route).toContain(`dateTime="${n.displayPublishedAt}"`);
  expect(times.filter(x=>x.includes('data-article-date="edited"')).length).toBe(n.editedAt?1:0);
  if(n.editedAt)expect(times.find(x=>x.includes('data-article-date="edited"'))).toContain(`dateTime="${n.editedAt}"`);
 }
});
for(const width of [1440,390,320])test(`publication and edit dates are readable at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});
 const samples=[entries.find((n:any)=>n.route.startsWith('posts/')&&n.editedAt),entries.find((n:any)=>!n.route.startsWith('posts/'))].filter(Boolean);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const n of samples){
  await page.goto('./'+n.route+'/');
  await expect(page.locator('[data-article-date="published"]')).toBeVisible();
  if(n.editedAt){
   const edit=page.locator('[data-article-date="edited"]');
   await edit.scrollIntoViewIfNeeded();await expect(edit).toBeVisible();
   expect(await edit.evaluate(e=>!!(document.querySelector('[data-post-body]')!.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_FOLLOWING))).toBeTruthy();
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
  await page.screenshot({path:`test-results-public/dates-${width}-${n.route.split('/')[0]}.png`,fullPage:false});
 }
 expect(errors).toEqual([]);
});
