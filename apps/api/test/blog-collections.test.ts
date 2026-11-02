import { test } from "node:test";
import assert from "node:assert/strict";
import { app } from "../src/index";
import { hash } from "../src/security";
import { database } from "../../../scripts/knowledge/local-db.mjs";

test("collection visibility is verified before effective; hide/restore retain public versions and every draft", async t => {
  const {sqlite,DB}=database(":memory:");
  const env={DB,APP_ENV:"test",BUILD_PIPELINE_ENABLED:"true",BUILD_REPOSITORY:"owner/repo",BUILD_WORKFLOW:"publish.yml",BUILD_REF:"main",BUILD_DISPATCH_TOKEN:"test",BUILD_PIPELINE_SECRET:"ci",PUBLIC_ORIGIN:"https://blog.example"};
  sqlite.prepare("INSERT INTO sessions VALUES(?,?,?)").run(await hash("owner"),"csrf","2099-01-01");
  const request=(path:string,body?:unknown)=>app.fetch(new Request("https://admin.example"+path,{method:body?"POST":"GET",headers:{Cookie:"__Host-cblog_session=owner",Origin:"https://admin.example","X-CSRF-Token":"csrf",Authorization:"Bearer ci","X-Build-Run":"123","Content-Type":"application/json"},body:body?JSON.stringify(body):undefined}),env);
  const original={notes:[{id:"a",body:"PUBLIC VERSION",title:"A",route:"series/a"},{id:"b",body:"OTHER ARTICLE",title:"B",route:"posts/b"}],withdrawals:[],publicationDates:{},revision:0};
  const inventory=[{id:"a",route:"series/a",version:1,contentHash:"a"},{id:"b",route:"posts/b",version:1,contentHash:"b"}];
  sqlite.prepare("INSERT INTO publications(created_at,manifest) VALUES('2026-01-01',?)").run(JSON.stringify(original));
  sqlite.exec("INSERT INTO build_jobs(id,publication_id,status,created_at,updated_at) VALUES('old',1,'succeeded','2026-01-01','2026-01-01')");
  sqlite.prepare("INSERT INTO live_site VALUES(1,'old',1,?,'2026-01-01')").run(JSON.stringify(inventory));
  sqlite.prepare("INSERT INTO blog_collections(slug,name,members) VALUES('series','Series',?)").run(JSON.stringify([{id:"a",route:"series/a",position:0}]));
  sqlite.exec("INSERT INTO groups(id,name,kind) VALUES('topic','分类','topic')");
  await request('/api/v1/notes/a',{id:'a',title:'SECRET DRAFT',topic_id:'topic',body:'Do not publish',state:'draft',visibility:'owner',tags:[],expectedVersion:0,clientMutationId:crypto.randomUUID()});
  const before=sqlite.prepare('SELECT * FROM notes').all();
  let marker:any={},pageStatus=200,dispatches=0;
  t.mock.method(globalThis,"fetch",async(input:any)=>{
    if(String(input).includes("api.github.com")){dispatches++;return new Response(null,{status:204});}
    return String(input).includes("publication.json")?Response.json(marker):new Response(null,{status:pageStatus});
  });
  const state=async()=>(await(await request('/api/v1/publishing')).json());
  const change=(visibility:string,expectedPublicationId:number,requestId=crypto.randomUUID())=>request('/api/v1/blog-collections/series/visibility',{visibility,expectedPublicationId,requestId});
  const latest=()=>JSON.parse(String(sqlite.prepare('SELECT manifest FROM publications ORDER BY id DESC LIMIT 1').get()!.manifest));
  const claim=async(job:any)=>{
    assert.equal((await request(`/internal/builds/${job.id}/claim`,{runId:'123'})).status,200);
    assert.equal((await request(`/internal/builds/${job.id}/status`,{status:'deploying'})).status,200);
  };
  const finish=(job:any)=>request(`/internal/builds/${job.id}/status`,{status:'succeeded'});
  try {
    assert.equal((await state()).collections[0].visibility,'public');
    assert.equal((await change('private',99)).status,409);
    assert.equal((await change('invalid',1)).status,422);
    const requestId=crypto.randomUUID();
    const first=await change('private',1,requestId);assert.equal(first.status,202);
    const job=(await first.json()).data;
    assert.equal((await change('private',1,requestId)).status,202);
    assert.equal(dispatches,1);
    assert.equal((await change('unlisted',1,requestId)).status,409);
    assert.equal((await change('unlisted',1)).status,409);
    assert.equal((await state()).collections[0].visibility,'public');
    assert.deepEqual(latest().notes,original.notes);
    assert.deepEqual(latest().intent.expectedInventory,[inventory[1]]);
    await claim(job);
    marker={jobId:job.id,publicationId:job.publication_id,publicNotes:[inventory[1]],publicCollections:[]};
    assert.equal((await finish(job)).status,409); // Old public URL must be gone.
    pageStatus=404; marker.publicNotes=[];
    assert.equal((await finish(job)).status,409); // Never drop unrelated content.
    marker.publicNotes=[inventory[1]];
    assert.equal((await finish(job)).status,200);
    assert.equal((await state()).collections[0].visibility,'private');
    const blocked=await request('/api/v1/publishing',{noteId:'a',action:'publish',expectedVersion:1,requestId:crypto.randomUUID()});
    assert.equal(blocked.status,409);
    assert.match((await blocked.json()).error.message,/所属专栏仅后台/);
    assert.deepEqual(sqlite.prepare('SELECT * FROM notes').all(),before);
    const restored=await change('unlisted',job.publication_id);assert.equal(restored.status,202);
    const restoreJob=(await restored.json()).data;
    assert.deepEqual(latest().notes,original.notes);
    assert.deepEqual(latest().collectionVisibility.series.retainedInventory,[inventory[0]]);
    await claim(restoreJob);
    marker={jobId:restoreJob.id,publicationId:restoreJob.publication_id,publicNotes:inventory,publicCollections:[{slug:'series',visibility:'public',articleCount:1}]};pageStatus=200;
    assert.equal((await finish(restoreJob)).status,409); // Wrong discovery visibility cannot pass.
    marker.publicCollections[0].visibility='unlisted';
    assert.equal((await finish(restoreJob)).status,200);
    assert.equal((await state()).collections[0].visibility,'unlisted');
    const publicJob=(await(await change('public',restoreJob.publication_id)).json()).data;
    await claim(publicJob);
    marker={...marker,jobId:publicJob.id,publicationId:publicJob.publication_id,publicCollections:[{slug:'series',visibility:'public',articleCount:1}]};
    assert.equal((await finish(publicJob)).status,200);
    assert.equal((await change('public',publicJob.publication_id)).status,422);
    assert.deepEqual(sqlite.prepare('SELECT * FROM notes').all(),before);
  } finally {sqlite.close();}
});
