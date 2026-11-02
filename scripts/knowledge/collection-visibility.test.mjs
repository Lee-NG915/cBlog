import {test} from 'node:test';
import assert from 'node:assert/strict';
import {applyCollectionVisibility,assertCollectionOnlyChange,publicCollections} from './collection-visibility.mjs';
import {assertPublicContentPreserved,publicRoutes,publicInventory} from './legacy-content.mjs';
const model={posts:[{sourceId:'b',slug:'b',title:'B'}],categories:[],collections:[{slug:'series',name:'Series',noindex:false,items:[{sourceId:'a',slug:'a',contentMarkdown:'|a|b|\n|---|---|\n|1|2|'}]},{slug:'other',items:[{slug:'c',sourceId:'c'}]}]};
test('private removes only chosen directory and children; unlisted retains pages with noindex; original source stays intact',()=>{
 const hidden=applyCollectionVisibility(structuredClone(model),{series:{visibility:'private'}});
 assert.equal(publicRoutes(hidden).includes('series/a'),false);
 assert.equal(publicInventory(hidden).some(n=>n.id==='a'),false);
 assert.deepEqual(publicCollections(hidden).map(c=>c.slug),['other']);
 assert.throws(()=>assertPublicContentPreserved(model,hidden),/remove/);
 assertPublicContentPreserved(model,hidden,[],'series');
 const broken=structuredClone(hidden);broken.posts=[];
 assert.throws(()=>assertPublicContentPreserved(model,broken,[],'series'),/posts\/b/);
 const unlisted=applyCollectionVisibility(structuredClone(model),{series:{visibility:'unlisted'}});
 assert.deepEqual(publicRoutes(unlisted),publicRoutes(model));
 assert.equal(unlisted.collections[0].noindex,true);
 assert.deepEqual(unlisted.collections[0].items,model.collections[0].items);
 const restored=applyCollectionVisibility(structuredClone(model),{series:{visibility:'public'}});
 assert.deepEqual(publicInventory(restored),publicInventory(model));
 assert.equal(model.collections.length,2);
});
test('collection-only change rejects altered article, date, another collection or mismatched intent',()=>{
 const before={notes:[{body:'full technical content'}],publicationDates:{a:{publishedAt:'2026-01-01'}},collectionVisibility:{other:{visibility:'unlisted'}}};
 const next={...structuredClone(before),collectionVisibility:{...before.collectionVisibility,series:{visibility:'private'}},intent:{action:'collection-visibility',collectionSlug:'series',visibility:'private'}};
 assertCollectionOnlyChange(before,next);
 for(const mutate of [n=>n.notes[0].body='summary',n=>n.publicationDates.a.publishedAt='2026-11-01',n=>n.collectionVisibility.other.visibility='private',n=>n.intent.visibility='public']) {
  const bad=structuredClone(next); mutate(bad); assert.throws(()=>assertCollectionOnlyChange(before,bad));
 }
});
