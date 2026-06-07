---
confluence_id: "2811822193"
title: "技术方案 - onepiece server side cache"
status: current
parent_id: "2583822375"
depth: 1
domain: migration
web_url: https://castlery.atlassian.net/wiki/spaces/EC/pages/2811822193
local_joyboy_doc: null
blog_post: null
---
## 背景

onepiece([castlery.com](http://castlery.com))前端目前没有对部分API做缓存, 在用户每次访问时, 都会重复发送相同的http请求, 造成了部分性能损耗, 并且增加后端服务压力. 

为提升前端页面性能, 减少后端服务压力, cache尤为重要.

## 方案

使用node-cache针对性的对部分页面/部分不需要实时性的api做缓存. 失效时间可以自定义.

## 实现

> helpers/Cache.js

```
import NodeCache from 'node-cache';

/**
 * Cache class
 * @docs https://www.npmjs.com/package/node-cache
 * @example
 * const Cache = new CacheFactory();
 * Cache.get('key');
 * Cache.set('key', 'value', 60);
 * Cache.del('key');
 */

export class Cache {
  constructor() {
    this.cache = new NodeCache();
  }

  get(key) {
    return this.cache.get(key);
  }

  // ttl: time to live in seconds (default: 300)
  set(key, value, ttl = 300) {
    return this.cache.set(key, value, ttl);
  }

  // myCache.mset(Array<{key, val, ttl?}>)
  mset(datas) {
    return this.cache.mset(datas);
  }

  del(key) {
    return this.cache.del(key);
  }

  flush() {
    return this.cache.flushAll();
  }

  has(key) {
    return this.cache.has(key);
  }

  keys() {
    return this.cache.keys();
  }
}

const cacheInstance = new Cache();

export default cacheInstance;
```

## 使用示例



设置cache

```
import Cache from 'helpers/Cache';

// 生成key时, 保证唯一性
const key = `product_${slug}_${shippingLocation.zipcode}_${shippingLocation.city}`;

// 设置cache
Cache.set(key, products);
```



读取cache

```
import Cache from 'helpers/Cache';

const key = `product_${slug}_${shippingLocation.zipcode}_${shippingLocation.city}`;

const product = Cache.get(key);
```