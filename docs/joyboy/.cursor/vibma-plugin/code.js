(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // ../core/dist/utils/color.js
  function rgbaToHex(color) {
    if (typeof color === "string" && color.startsWith("#")) return color;
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    const a = color.a !== void 0 ? Math.round(color.a * 255) : 255;
    const hex = [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
    return a === 255 ? `#${hex}` : `#${hex}${a.toString(16).padStart(2, "0")}`;
  }
  var init_color = __esm({
    "../core/dist/utils/color.js"() {
    }
  });

  // src/utils/serialize-node.ts
  var serialize_node_exports = {};
  __export(serialize_node_exports, {
    DEFAULT_NODE_BUDGET: () => DEFAULT_NODE_BUDGET,
    serializeNode: () => serializeNode
  });
  function serializeNode(_0) {
    return __async(this, arguments, function* (node, depth = -1, currentDepth = 0, budget = { remaining: DEFAULT_NODE_BUDGET }) {
      if (budget.remaining <= 0) {
        return { id: node.id, name: node.name, type: node.type, _truncated: true };
      }
      budget.remaining--;
      if (node.type === "VECTOR") {
        return { id: node.id, name: node.name, type: node.type };
      }
      const out = {
        id: node.id,
        name: node.name,
        type: node.type
      };
      if (currentDepth === 0 && node.parent) {
        out.parentId = node.parent.id;
        out.parentName = node.parent.name;
        out.parentType = node.parent.type;
      }
      if ("fills" in node) {
        const fills = node.fills;
        if (fills !== figma.mixed && Array.isArray(fills) && fills.length > 0) {
          out.fills = fills.map(serializePaint);
        }
      }
      if ("strokes" in node) {
        const strokes = node.strokes;
        if (Array.isArray(strokes) && strokes.length > 0) {
          out.strokes = strokes.map(serializePaint);
        }
      }
      if ("cornerRadius" in node) {
        const cr = node.cornerRadius;
        if (cr !== void 0 && cr !== figma.mixed) out.cornerRadius = cr;
      }
      if ("absoluteBoundingBox" in node && node.absoluteBoundingBox) {
        out.absoluteBoundingBox = node.absoluteBoundingBox;
      } else if ("absoluteTransform" in node && "width" in node) {
        const t = node.absoluteTransform;
        if (t) {
          out.absoluteBoundingBox = {
            x: t[0][2],
            y: t[1][2],
            width: node.width,
            height: node.height
          };
        }
      }
      if ("characters" in node) {
        out.characters = node.characters;
      }
      if (node.type === "INSTANCE") {
        const inst = node;
        try {
          const main = yield inst.getMainComponentAsync();
          if (main) {
            out.componentId = main.id;
            out.componentName = main.name;
          }
        } catch (e) {
        }
        const cp = inst.componentProperties;
        if (cp && typeof cp === "object" && Object.keys(cp).length > 0) out.componentProperties = cp;
      }
      if ("componentPropertyReferences" in node) {
        const refs = node.componentPropertyReferences;
        if (refs && typeof refs === "object" && Object.keys(refs).length > 0) out.componentPropertyReferences = refs;
      }
      if (node.type === "TEXT") {
        const t = node;
        const style = {};
        if (t.fontName !== figma.mixed) {
          style.fontFamily = t.fontName.family;
          style.fontStyle = t.fontName.style;
        }
        if (t.fontSize !== figma.mixed) style.fontSize = t.fontSize;
        if (t.textAlignHorizontal) style.textAlignHorizontal = t.textAlignHorizontal;
        if (t.letterSpacing !== figma.mixed) {
          const ls = t.letterSpacing;
          style.letterSpacing = ls.unit === "PIXELS" ? ls.value : ls;
        }
        if (t.lineHeight !== figma.mixed) {
          const lh = t.lineHeight;
          if (lh.unit === "PIXELS") style.lineHeightPx = lh.value;
          else if (lh.unit !== "AUTO") style.lineHeight = lh;
        }
        if (Object.keys(style).length > 0) out.style = style;
      }
      if ("effects" in node) {
        const effects = node.effects;
        if (Array.isArray(effects) && effects.length > 0) {
          out.effects = effects.map((e) => {
            const eff = { type: e.type, visible: e.visible };
            if (e.radius !== void 0) eff.radius = e.radius;
            if (e.color) eff.color = rgbaToHex(e.color);
            if (e.offset) eff.offset = e.offset;
            if (e.spread !== void 0) eff.spread = e.spread;
            if (e.blendMode) eff.blendMode = e.blendMode;
            return eff;
          });
        }
      }
      if ("layoutMode" in node) {
        const lm = node.layoutMode;
        if (lm && lm !== "NONE") out.layoutMode = lm;
      }
      if ("itemSpacing" in node) {
        const is = node.itemSpacing;
        if (is !== void 0) out.itemSpacing = is;
      }
      if ("paddingLeft" in node) {
        const n = node;
        if (n.paddingLeft || n.paddingRight || n.paddingTop || n.paddingBottom) {
          out.padding = {
            left: n.paddingLeft,
            right: n.paddingRight,
            top: n.paddingTop,
            bottom: n.paddingBottom
          };
        }
      }
      if ("opacity" in node) {
        const op = node.opacity;
        if (op !== void 0 && op !== 1) out.opacity = op;
      }
      if ("visible" in node) {
        out.visible = node.visible;
      }
      if ("constraints" in node) {
        out.constraints = node.constraints;
      }
      if ("children" in node) {
        const children = node.children;
        if (depth >= 0 && currentDepth >= depth || budget.remaining <= 0) {
          out.children = children.map((c) => __spreadValues({
            id: c.id,
            name: c.name,
            type: c.type
          }, budget.remaining <= 0 ? { _truncated: true } : {}));
        } else {
          const serialized = [];
          for (const c of children) {
            serialized.push(yield serializeNode(c, depth, currentDepth + 1, budget));
          }
          out.children = serialized;
        }
      }
      return out;
    });
  }
  function serializePaint(paint) {
    var _a;
    const p = { type: paint.type };
    if (paint.visible !== void 0) p.visible = paint.visible;
    if (paint.opacity !== void 0) p.opacity = paint.opacity;
    if (paint.blendMode) p.blendMode = paint.blendMode;
    if (paint.color) {
      p.color = rgbaToHex(__spreadProps(__spreadValues({}, paint.color), { a: (_a = paint.opacity) != null ? _a : 1 }));
    }
    if (paint.gradientStops) {
      p.gradientStops = paint.gradientStops.map((stop) => ({
        position: stop.position,
        color: rgbaToHex(stop.color)
      }));
    }
    if (paint.gradientTransform) p.gradientTransform = paint.gradientTransform;
    if (paint.scaleMode) p.scaleMode = paint.scaleMode;
    return p;
  }
  var DEFAULT_NODE_BUDGET;
  var init_serialize_node = __esm({
    "src/utils/serialize-node.ts"() {
      init_color();
      DEFAULT_NODE_BUDGET = 200;
    }
  });

  // src/utils/base64.ts
  var base64_exports = {};
  __export(base64_exports, {
    customBase64Encode: () => customBase64Encode
  });
  function customBase64Encode(bytes) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let base64 = "";
    const byteLength = bytes.byteLength;
    const byteRemainder = byteLength % 3;
    const mainLength = byteLength - byteRemainder;
    for (let i = 0; i < mainLength; i += 3) {
      const chunk = bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];
      base64 += chars[(chunk & 16515072) >> 18] + chars[(chunk & 258048) >> 12] + chars[(chunk & 4032) >> 6] + chars[chunk & 63];
    }
    if (byteRemainder === 1) {
      const chunk = bytes[mainLength];
      base64 += chars[(chunk & 252) >> 2] + chars[(chunk & 3) << 4] + "==";
    } else if (byteRemainder === 2) {
      const chunk = bytes[mainLength] << 8 | bytes[mainLength + 1];
      base64 += chars[(chunk & 64512) >> 10] + chars[(chunk & 1008) >> 4] + chars[(chunk & 15) << 2] + "=";
    }
    return base64;
  }
  var init_base64 = __esm({
    "src/utils/base64.ts"() {
    }
  });

  // src/utils/figma-helpers.ts
  var figma_helpers_exports = {};
  __export(figma_helpers_exports, {
    appendToParentOrPage: () => appendToParentOrPage,
    applyDeferredFill: () => applyDeferredFill,
    delay: () => delay,
    generateCommandId: () => generateCommandId,
    getFontStyle: () => getFontStyle,
    getNode: () => getNode,
    getParentNode: () => getParentNode,
    sendProgressUpdate: () => sendProgressUpdate,
    setCharacters: () => setCharacters,
    solidPaint: () => solidPaint2
  });
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  function generateCommandId() {
    return "cmd_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  function sendProgressUpdate(commandId, commandType, status, progress, totalItems, processedItems, message, payload = null) {
    const update = {
      type: "command_progress",
      commandId,
      commandType,
      status,
      progress,
      totalItems,
      processedItems,
      message,
      timestamp: Date.now()
    };
    if (payload) {
      if (payload.currentChunk !== void 0 && payload.totalChunks !== void 0) {
        update.currentChunk = payload.currentChunk;
        update.totalChunks = payload.totalChunks;
        update.chunkSize = payload.chunkSize;
      }
      update.payload = payload;
    }
    figma.ui.postMessage(update);
    return update;
  }
  function solidPaint2(color) {
    var _a, _b, _c, _d;
    return {
      type: "SOLID",
      color: {
        r: (_a = color.r) != null ? _a : 0,
        g: (_b = color.g) != null ? _b : 0,
        b: (_c = color.b) != null ? _c : 0
      },
      opacity: (_d = color.a) != null ? _d : 1
    };
  }
  function getNode(nodeId) {
    return __async(this, null, function* () {
      const node = yield figma.getNodeByIdAsync(nodeId);
      if (!node) throw new Error(`Node not found: ${nodeId}`);
      return node;
    });
  }
  function getParentNode(parentId) {
    return __async(this, null, function* () {
      const node = yield getNode(parentId);
      if (!("appendChild" in node)) {
        throw new Error(`Node does not support children: ${parentId}`);
      }
      return node;
    });
  }
  function appendToParentOrPage(node, parentId) {
    return __async(this, null, function* () {
      if (parentId) {
        const parent = yield getParentNode(parentId);
        parent.appendChild(node);
      } else {
        figma.currentPage.appendChild(node);
      }
    });
  }
  function applyDeferredFill(node, deferH, deferV) {
    if (deferH) {
      try {
        node.layoutSizingHorizontal = "FILL";
      } catch (_) {
      }
    }
    if (deferV) {
      try {
        node.layoutSizingVertical = "FILL";
      } catch (_) {
      }
    }
  }
  function uniqBy(arr, predicate) {
    const cb = typeof predicate === "function" ? predicate : (o) => o[predicate];
    return [
      ...arr.reduce((map, item) => {
        const key = item === null || item === void 0 ? item : cb(item);
        map.has(key) || map.set(key, item);
        return map;
      }, /* @__PURE__ */ new Map()).values()
    ];
  }
  function setCharactersStrict(node, characters, fallbackFont) {
    return __async(this, null, function* () {
      const fontHashTree = {};
      for (let i = 1; i < node.characters.length; i++) {
        const startIdx = i - 1;
        const startCharFont = node.getRangeFontName(startIdx, i);
        const startVal = `${startCharFont.family}::${startCharFont.style}`;
        while (i < node.characters.length) {
          i++;
          const charFont = node.getRangeFontName(i - 1, i);
          if (startVal !== `${charFont.family}::${charFont.style}`) break;
        }
        fontHashTree[`${startIdx}_${i}`] = startVal;
      }
      yield figma.loadFontAsync(fallbackFont);
      node.fontName = fallbackFont;
      node.characters = characters;
      yield Promise.all(
        Object.keys(fontHashTree).map((range) => __async(null, null, function* () {
          const [start, end] = range.split("_");
          const [family, style] = fontHashTree[range].split("::");
          const matchedFont = { family, style };
          yield figma.loadFontAsync(matchedFont);
          return node.setRangeFontName(Number(start), Number(end), matchedFont);
        }))
      );
      return true;
    });
  }
  function getDelimiterPos(str, delimiter, startIdx = 0, endIdx = str.length) {
    const indices = [];
    let temp = startIdx;
    for (let i = startIdx; i < endIdx; i++) {
      if (str[i] === delimiter && i + startIdx !== endIdx && temp !== i + startIdx) {
        indices.push([temp, i + startIdx]);
        temp = i + startIdx + 1;
      }
    }
    if (temp !== endIdx) indices.push([temp, endIdx]);
    return indices;
  }
  function buildLinearOrder(node) {
    const fontTree = [];
    const newLinesPos = getDelimiterPos(node.characters, "\n");
    newLinesPos.forEach(([nlStart, nlEnd]) => {
      const nlFont = node.getRangeFontName(nlStart, nlEnd);
      if (nlFont === figma.mixed) {
        const spacesPos = getDelimiterPos(node.characters, " ", nlStart, nlEnd);
        spacesPos.forEach(([spStart, spEnd]) => {
          const spFont = node.getRangeFontName(spStart, spEnd);
          fontTree.push({ start: spStart, delimiter: " ", family: spFont.family, style: spFont.style });
        });
      } else {
        fontTree.push({ start: nlStart, delimiter: "\n", family: nlFont.family, style: nlFont.style });
      }
    });
    return fontTree.sort((a, b) => a.start - b.start).map(({ family, style, delimiter }) => ({ family, style, delimiter }));
  }
  function setCharactersSmart(node, characters, fallbackFont) {
    return __async(this, null, function* () {
      const rangeTree = buildLinearOrder(node);
      const fontsToLoad = uniqBy(rangeTree, ({ family, style }) => `${family}::${style}`).map(
        ({ family, style }) => ({ family, style })
      );
      yield Promise.all([...fontsToLoad, fallbackFont].map((f) => figma.loadFontAsync(f)));
      node.fontName = fallbackFont;
      node.characters = characters;
      let prevPos = 0;
      rangeTree.forEach(({ family, style, delimiter }) => {
        if (prevPos < node.characters.length) {
          const delimPos = node.characters.indexOf(delimiter, prevPos);
          const endPos = delimPos > prevPos ? delimPos : node.characters.length;
          node.setRangeFontName(prevPos, endPos, { family, style });
          prevPos = endPos + 1;
        }
      });
      return true;
    });
  }
  function getFontStyle(weight) {
    switch (weight) {
      case 100:
        return "Thin";
      case 200:
        return "Extra Light";
      case 300:
        return "Light";
      case 400:
        return "Regular";
      case 500:
        return "Medium";
      case 600:
        return "Semi Bold";
      case 700:
        return "Bold";
      case 800:
        return "Extra Bold";
      case 900:
        return "Black";
      default:
        return "Regular";
    }
  }
  var setCharacters;
  var init_figma_helpers = __esm({
    "src/utils/figma-helpers.ts"() {
      setCharacters = (node, characters, options) => __async(null, null, function* () {
        const fallbackFont = (options == null ? void 0 : options.fallbackFont) || { family: "Inter", style: "Regular" };
        try {
          if (node.fontName === figma.mixed) {
            if ((options == null ? void 0 : options.smartStrategy) === "prevail") {
              const fontHashTree = {};
              for (let i = 1; i < node.characters.length; i++) {
                const charFont = node.getRangeFontName(i - 1, i);
                const key = `${charFont.family}::${charFont.style}`;
                fontHashTree[key] = (fontHashTree[key] || 0) + 1;
              }
              const prevailed = Object.entries(fontHashTree).sort((a, b) => b[1] - a[1])[0];
              const [family, style] = prevailed[0].split("::");
              const prevailedFont = { family, style };
              yield figma.loadFontAsync(prevailedFont);
              node.fontName = prevailedFont;
            } else if ((options == null ? void 0 : options.smartStrategy) === "strict") {
              return setCharactersStrict(node, characters, fallbackFont);
            } else if ((options == null ? void 0 : options.smartStrategy) === "experimental") {
              return setCharactersSmart(node, characters, fallbackFont);
            } else {
              const firstCharFont = node.getRangeFontName(0, 1);
              yield figma.loadFontAsync(firstCharFont);
              node.fontName = firstCharFont;
            }
          } else {
            yield figma.loadFontAsync(node.fontName);
          }
        } catch (e) {
          yield figma.loadFontAsync(fallbackFont);
          node.fontName = fallbackFont;
        }
        try {
          node.characters = characters;
          return true;
        } catch (e) {
          return false;
        }
      });
    }
  });

  // src/handlers/connection.ts
  function ping() {
    return __async(this, null, function* () {
      return {
        status: "pong",
        documentName: figma.root.name,
        currentPage: figma.currentPage.name,
        timestamp: Date.now()
      };
    });
  }
  var figmaHandlers = {
    ping
  };

  // src/handlers/document.ts
  function getDocumentInfo() {
    return __async(this, null, function* () {
      return {
        name: figma.root.name,
        currentPageId: figma.currentPage.id,
        pages: figma.root.children.map((p) => ({ id: p.id, name: p.name }))
      };
    });
  }
  function getCurrentPage() {
    return __async(this, null, function* () {
      yield figma.currentPage.loadAsync();
      const page = figma.currentPage;
      return {
        id: page.id,
        name: page.name,
        children: page.children.map((node) => ({ id: node.id, name: node.name, type: node.type }))
      };
    });
  }
  function setCurrentPage(params) {
    return __async(this, null, function* () {
      let page;
      if (params.pageId) {
        page = yield figma.getNodeByIdAsync(params.pageId);
        if (!page || page.type !== "PAGE") throw new Error(`Page not found: ${params.pageId}`);
      } else if (params.pageName) {
        const name = params.pageName.toLowerCase();
        page = figma.root.children.find((p) => p.name.toLowerCase() === name);
        if (!page) page = figma.root.children.find((p) => p.name.toLowerCase().includes(name));
        if (!page) {
          const available = figma.root.children.map((p) => p.name);
          throw new Error(`Page not found: '${params.pageName}'. Available pages: [${available.join(", ")}]`);
        }
      }
      yield figma.setCurrentPageAsync(page);
      return { id: page.id, name: page.name };
    });
  }
  function createPage(params) {
    return __async(this, null, function* () {
      const name = (params == null ? void 0 : params.name) || "New Page";
      const page = figma.createPage();
      page.name = name;
      return { id: page.id };
    });
  }
  function renamePage(params) {
    return __async(this, null, function* () {
      if (!(params == null ? void 0 : params.newName)) throw new Error("Missing newName parameter");
      let page;
      if (params.pageId) {
        page = yield figma.getNodeByIdAsync(params.pageId);
        if (!page || page.type !== "PAGE") throw new Error(`Page not found: ${params.pageId}`);
      } else {
        page = figma.currentPage;
      }
      page.name = params.newName;
      return "ok";
    });
  }
  var figmaHandlers2 = {
    get_document_info: getDocumentInfo,
    get_current_page: getCurrentPage,
    set_current_page: setCurrentPage,
    create_page: createPage,
    rename_page: renamePage
  };

  // src/handlers/selection.ts
  function getSelection(params) {
    return __async(this, null, function* () {
      const sel = figma.currentPage.selection;
      if (sel.length === 0) {
        return { selectionCount: 0, selection: [] };
      }
      const depth = params == null ? void 0 : params.depth;
      if (depth === void 0 || depth === null) {
        return {
          selectionCount: sel.length,
          selection: sel.map((node) => ({
            id: node.id,
            name: node.name,
            type: node.type
          }))
        };
      }
      const { serializeNode: serializeNode2, DEFAULT_NODE_BUDGET: DEFAULT_NODE_BUDGET2 } = yield Promise.resolve().then(() => (init_serialize_node(), serialize_node_exports));
      const budget = { remaining: DEFAULT_NODE_BUDGET2 };
      const selection = [];
      for (const node of sel) {
        selection.push(yield serializeNode2(node, depth !== void 0 ? depth : -1, 0, budget));
      }
      const out = { selectionCount: selection.length, selection };
      if (budget.remaining <= 0) {
        out._truncated = true;
        out._notice = "Result was truncated (node budget exceeded). Nodes with _truncated: true are stubs. To inspect them, call get_node_info with their IDs directly, or use a shallower depth.";
      }
      return out;
    });
  }
  function setSelection(params) {
    return __async(this, null, function* () {
      const nodeIds = params == null ? void 0 : params.nodeIds;
      if (!nodeIds || !Array.isArray(nodeIds) || nodeIds.length === 0) {
        throw new Error("Missing or empty nodeIds");
      }
      const nodes = [];
      const notFound = [];
      for (const id of nodeIds) {
        const node = yield figma.getNodeByIdAsync(id);
        if (node) nodes.push(node);
        else notFound.push(id);
      }
      if (nodes.length === 0) throw new Error(`No valid nodes found: ${nodeIds.join(", ")}`);
      figma.currentPage.selection = nodes;
      figma.viewport.scrollAndZoomIntoView(nodes);
      return {
        count: nodes.length,
        selectedNodes: nodes.map((n) => ({ name: n.name, id: n.id })),
        notFoundIds: notFound.length > 0 ? notFound : void 0
      };
    });
  }
  var figmaHandlers3 = {
    get_selection: getSelection,
    set_selection: setSelection
  };

  // src/handlers/node-info.ts
  init_serialize_node();
  function pickFields(node, keep) {
    if (!node || typeof node !== "object") return node;
    const out = {};
    for (const key of Object.keys(node)) {
      if (keep.has(key) || key.startsWith("_")) {
        out[key] = key === "children" && Array.isArray(node.children) ? node.children.map((c) => pickFields(c, keep)) : node[key];
      }
    }
    return out;
  }
  function getNodeInfo(params) {
    return __async(this, null, function* () {
      const nodeIds = params.nodeIds || (params.nodeId ? [params.nodeId] : []);
      const depth = params.depth;
      const fields = params.fields;
      const keep = (fields == null ? void 0 : fields.length) ? /* @__PURE__ */ new Set([...fields, "id", "name", "type", "children"]) : null;
      const budget = { remaining: DEFAULT_NODE_BUDGET };
      const results = [];
      for (const nodeId of nodeIds) {
        const node = yield figma.getNodeByIdAsync(nodeId);
        if (!node) {
          results.push({ nodeId, error: `Node not found: ${nodeId}` });
          continue;
        }
        let serialized = yield serializeNode(node, depth !== void 0 ? depth : -1, 0, budget);
        if (keep && serialized) serialized = pickFields(serialized, keep);
        results.push(serialized);
      }
      const out = { results };
      if (budget.remaining <= 0) {
        out._truncated = true;
        out._notice = "Result was truncated (node budget exceeded). Nodes with _truncated: true are stubs. To inspect them, call get_node_info with their IDs directly, or use a shallower depth.";
      }
      return out;
    });
  }
  function searchNodes(params) {
    return __async(this, null, function* () {
      if (!params) throw new Error("Missing parameters");
      let scopeNode;
      if (params.scopeNodeId) {
        scopeNode = yield figma.getNodeByIdAsync(params.scopeNodeId);
        if (!scopeNode) throw new Error(`Scope node not found: ${params.scopeNodeId}`);
      } else {
        yield figma.currentPage.loadAsync();
        scopeNode = figma.currentPage;
      }
      if (!("findAll" in scopeNode)) throw new Error("Scope node does not support searching");
      let results;
      if (params.types && !params.query) {
        results = scopeNode.findAllWithCriteria({ types: params.types });
      } else {
        results = scopeNode.findAll((node) => {
          var _a;
          if (((_a = params.types) == null ? void 0 : _a.length) && !params.types.includes(node.type)) return false;
          if (params.query) {
            const q = params.query.toLowerCase();
            return params.caseSensitive ? node.name.includes(params.query) : node.name.toLowerCase().includes(q);
          }
          return true;
        });
      }
      const totalCount = results.length;
      const limit = params.limit || 50;
      const offset = params.offset || 0;
      results = results.slice(offset, offset + limit);
      return {
        totalCount,
        returned: results.length,
        offset,
        limit,
        results: results.map((node) => {
          const entry = { id: node.id, name: node.name, type: node.type };
          if (node.parent) {
            entry.parentId = node.parent.id;
            entry.parentName = node.parent.name;
          }
          if ("absoluteBoundingBox" in node && node.absoluteBoundingBox) {
            entry.bounds = node.absoluteBoundingBox;
          } else if ("x" in node) {
            entry.x = node.x;
            entry.y = node.y;
            if ("width" in node) {
              entry.width = node.width;
              entry.height = node.height;
            }
          }
          return entry;
        })
      };
    });
  }
  function exportNodeAsImage(params) {
    return __async(this, null, function* () {
      const { customBase64Encode: customBase64Encode2 } = yield Promise.resolve().then(() => (init_base64(), base64_exports));
      const { nodeId, scale = 1 } = params || {};
      const format = params.format || "PNG";
      if (!nodeId) throw new Error("Missing nodeId");
      const node = yield figma.getNodeByIdAsync(nodeId);
      if (!node) throw new Error(`Node not found: ${nodeId}`);
      if (!("exportAsync" in node)) throw new Error(`Node does not support export: ${nodeId}`);
      const bytes = yield node.exportAsync({
        format,
        constraint: { type: "SCALE", value: scale }
      });
      const mimeMap = {
        PNG: "image/png",
        JPG: "image/jpeg",
        SVG: "image/svg+xml",
        PDF: "application/pdf"
      };
      return {
        mimeType: mimeMap[format] || "application/octet-stream",
        imageData: customBase64Encode2(bytes)
      };
    });
  }
  var figmaHandlers4 = {
    get_node_info: getNodeInfo,
    // Legacy single-node alias
    get_nodes_info: (params) => __async(null, null, function* () {
      return getNodeInfo({ nodeIds: params.nodeIds, depth: params.depth });
    }),
    search_nodes: searchNodes,
    export_node_as_image: exportNodeAsImage
  };

  // src/handlers/helpers.ts
  init_serialize_node();
  function nodeSnapshot(id, depth) {
    return __async(this, null, function* () {
      const node = yield figma.getNodeByIdAsync(id);
      if (!node) return null;
      const budget = { remaining: DEFAULT_NODE_BUDGET };
      const result = yield serializeNode(node, depth, 0, budget);
      if (budget.remaining <= 0) {
        result._truncated = true;
        result._notice = "Snapshot truncated (node budget exceeded). Nodes with _truncated: true are stubs. Call get_node_info with their IDs to inspect, or use a shallower depth.";
      }
      return result;
    });
  }
  function batchHandler(params, fn) {
    return __async(this, null, function* () {
      const items = params.items || [params];
      const depth = params.depth;
      const results = [];
      const warningSet = /* @__PURE__ */ new Set();
      for (const item of items) {
        try {
          let result = yield fn(item);
          if (depth !== void 0 && (result == null ? void 0 : result.id)) {
            const snapshot = yield nodeSnapshot(result.id, depth);
            if (snapshot) result = __spreadValues(__spreadValues({}, result), snapshot);
          }
          if (result == null ? void 0 : result.warning) {
            warningSet.add(result.warning);
            delete result.warning;
          }
          if (result && typeof result === "object" && Object.keys(result).length === 0) {
            results.push("ok");
          } else {
            results.push(result);
          }
        } catch (e) {
          results.push({ error: e.message });
        }
      }
      const out = { results };
      if (warningSet.size > 0) out.warnings = [...warningSet];
      return out;
    });
  }
  function appendToParent(node, parentId) {
    return __async(this, null, function* () {
      if (parentId) {
        const parent = yield figma.getNodeByIdAsync(parentId);
        if (!parent) throw new Error(`Parent not found: ${parentId}`);
        if (!("appendChild" in parent))
          throw new Error(`Parent does not support children: ${parentId}. Only FRAME, COMPONENT, GROUP, SECTION, and PAGE nodes can have children.`);
        parent.appendChild(node);
        return parent;
      }
      figma.currentPage.appendChild(node);
      return null;
    });
  }
  function solidPaint(c) {
    var _a, _b, _c, _d;
    return { type: "SOLID", color: { r: (_a = c.r) != null ? _a : 0, g: (_b = c.g) != null ? _b : 0, b: (_c = c.b) != null ? _c : 0 }, opacity: (_d = c.a) != null ? _d : 1 };
  }
  function findVariableById(id) {
    return __async(this, null, function* () {
      const direct = yield figma.variables.getVariableByIdAsync(id);
      if (direct) return direct;
      const all = yield figma.variables.getLocalVariablesAsync();
      return all.find((v) => v.id === id) || null;
    });
  }
  function styleNotFoundHint(param, value, available, limit = 20) {
    if (available.length === 0) return `${param} '${value}' not found (no local styles of this type exist).`;
    const names = available.slice(0, limit);
    const suffix = available.length > limit ? `, \u2026 and ${available.length - limit} more` : "";
    return `${param} '${value}' not found. Available: [${names.join(", ")}${suffix}]`;
  }
  function suggestStyleForColor(color, styleParam) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d, _e, _f;
      const hex = `#${[color.r, color.g, color.b].map((v) => Math.round((v != null ? v : 0) * 255).toString(16).padStart(2, "0")).join("")}`;
      const eps = 0.02;
      const cr = (_a = color.r) != null ? _a : 0, cg = (_b = color.g) != null ? _b : 0, cb = (_c = color.b) != null ? _c : 0, ca = (_d = color.a) != null ? _d : 1;
      const styles = yield figma.getLocalPaintStylesAsync();
      for (const style of styles) {
        const paints = style.paints;
        if (paints.length === 1 && paints[0].type === "SOLID") {
          const sc = paints[0].color;
          const so = (_e = paints[0].opacity) != null ? _e : 1;
          if (Math.abs(sc.r - cr) < eps && Math.abs(sc.g - cg) < eps && Math.abs(sc.b - cb) < eps && Math.abs(so - ca) < eps) {
            return `Hardcoded color ${hex} matches style '${style.name}'. Use ${styleParam}: '${style.name}' to link to the design token.`;
          }
        }
      }
      const colorVars = yield figma.variables.getLocalVariablesAsync("COLOR");
      if (colorVars.length > 0) {
        const collections = yield figma.variables.getLocalVariableCollectionsAsync();
        const defaultModes = new Map(collections.map((c) => [c.id, c.defaultModeId]));
        for (const v of colorVars) {
          const modeId = defaultModes.get(v.variableCollectionId);
          if (!modeId) continue;
          const val = v.valuesByMode[modeId];
          if (!val || typeof val !== "object" || "type" in val) continue;
          const vc = val;
          if (Math.abs(vc.r - cr) < eps && Math.abs(vc.g - cg) < eps && Math.abs(vc.b - cb) < eps && Math.abs(((_f = vc.a) != null ? _f : 1) - ca) < eps) {
            return `Hardcoded color ${hex} matches variable '${v.name}' (${v.id}). Use set_variable_binding to bind to the design token.`;
          }
        }
      }
      return `Hardcoded color ${hex} has no matching paint style or color variable. Create one with styles(method: "create", type: "paint") or variables(method: "create"), then use ${styleParam} for design token consistency.`;
    });
  }
  function suggestTextStyle(fontSize, fontWeight) {
    return __async(this, null, function* () {
      const styles = yield figma.getLocalTextStylesAsync();
      const matching = styles.filter((s) => s.fontSize === fontSize);
      if (matching.length > 0) {
        const names = matching.map((s) => s.name).slice(0, 5);
        return `Manual font (${fontSize}px / ${fontWeight}w) \u2014 text styles at same size: [${names.join(", ")}]. Use textStyleName to link to a design token.`;
      }
      return `Manual font (${fontSize}px / ${fontWeight}w) has no text style. Create one with styles(method: "create", type: "text"), then use textStyleName for design token consistency.`;
    });
  }

  // src/handlers/create-shape.ts
  function resolvePaintStyle(name) {
    return __async(this, null, function* () {
      var _a;
      const styles = yield figma.getLocalPaintStylesAsync();
      const available = styles.map((s) => s.name);
      const exact = styles.find((s) => s.name === name);
      if (exact) return { id: exact.id, available };
      const fuzzy = styles.find((s) => s.name.toLowerCase().includes(name.toLowerCase()));
      return { id: (_a = fuzzy == null ? void 0 : fuzzy.id) != null ? _a : null, available };
    });
  }
  function createSingleSection(p) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d;
      const section = figma.createSection();
      section.x = (_a = p.x) != null ? _a : 0;
      section.y = (_b = p.y) != null ? _b : 0;
      section.resizeWithoutConstraints((_c = p.width) != null ? _c : 500, (_d = p.height) != null ? _d : 500);
      section.name = p.name || "Section";
      section.fills = [];
      const hints = [];
      if (p.fillVariableId) {
        const v = yield findVariableById(p.fillVariableId);
        if (v) {
          section.fills = [solidPaint(p.fillColor || { r: 0, g: 0, b: 0 })];
          const bound = figma.variables.setBoundVariableForPaint(section.fills[0], "color", v);
          section.fills = [bound];
        } else {
          hints.push(`fillVariableId '${p.fillVariableId}' not found.`);
        }
      } else if (p.fillStyleName) {
        const { id: sid, available } = yield resolvePaintStyle(p.fillStyleName);
        if (sid) {
          try {
            yield section.setFillStyleIdAsync(sid);
          } catch (e) {
            hints.push(`fillStyleName '${p.fillStyleName}' matched but failed to apply: ${e.message}`);
          }
        } else hints.push(styleNotFoundHint("fillStyleName", p.fillStyleName, available));
      } else if (p.fillColor) {
        section.fills = [solidPaint(p.fillColor)];
        const suggestion = yield suggestStyleForColor(p.fillColor, "fillStyleName");
        if (suggestion) hints.push(suggestion);
      }
      yield appendToParent(section, p.parentId);
      const result = { id: section.id };
      if (hints.length > 0) result.warning = hints.join(" ");
      return result;
    });
  }
  function createSingleSvg(p) {
    return __async(this, null, function* () {
      var _a, _b;
      const node = figma.createNodeFromSvg(p.svg);
      node.x = (_a = p.x) != null ? _a : 0;
      node.y = (_b = p.y) != null ? _b : 0;
      if (p.name) node.name = p.name;
      yield appendToParent(node, p.parentId);
      return {};
    });
  }
  var figmaHandlers5 = {
    create_section: (p) => batchHandler(p, createSingleSection),
    create_node_from_svg: (p) => batchHandler(p, createSingleSvg)
  };

  // ../core/dist/utils/wcag.js
  function srgbRelativeLuminance(r, g, b) {
    const linearize = (c) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
  }
  function contrastRatio(l1, l2) {
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }
  function alphaComposite(fgR, fgG, fgB, fgA, bgR, bgG, bgB) {
    return {
      r: fgR * fgA + bgR * (1 - fgA),
      g: fgG * fgA + bgG * (1 - fgA),
      b: fgB * fgA + bgB * (1 - fgA)
    };
  }
  function checkContrastPair(fg, bg, large = false) {
    const fgLum = srgbRelativeLuminance(fg.r, fg.g, fg.b);
    const bgLum = srgbRelativeLuminance(bg.r, bg.g, bg.b);
    const ratio = contrastRatio(fgLum, bgLum);
    const aaRequired = large ? 3 : 4.5;
    const aaaRequired = large ? 4.5 : 7;
    return {
      ratio: Math.round(ratio * 100) / 100,
      passesAA: ratio >= aaRequired,
      passesAAA: ratio >= aaaRequired,
      aaRequired,
      aaaRequired
    };
  }
  function isLargeText(fontSize, fontWeight) {
    if (fontSize >= 24) return true;
    if (fontSize >= 18.66 && fontWeight >= 700) return true;
    return false;
  }
  function inferFontWeight(fontStyle) {
    const s = fontStyle.toLowerCase();
    if (s.includes("thin") || s.includes("hairline")) return 100;
    if (s.includes("extralight") || s.includes("extra light") || s.includes("ultralight")) return 200;
    if (s.includes("light")) return 300;
    if (s.includes("regular") || s.includes("normal") || s === "roman") return 400;
    if (s.includes("medium")) return 500;
    if (s.includes("semibold") || s.includes("semi bold") || s.includes("demibold")) return 600;
    if (s.includes("extrabold") || s.includes("extra bold") || s.includes("ultrabold")) return 800;
    if (s.includes("bold")) return 700;
    if (s.includes("black") || s.includes("heavy")) return 900;
    return 400;
  }
  var INTERACTIVE_NAME_PATTERN = /\b(button|btn|link|tab|toggle|switch|checkbox|radio|chip|badge|tag|cta|menu[-_]?item|nav[-_]?item|input|select|dropdown|close|action|icon[-_]?button)\b/i;
  function looksInteractive(node) {
    if (node.type === "COMPONENT" || node.type === "INSTANCE") return true;
    if (node.type === "FRAME" && INTERACTIVE_NAME_PATTERN.test(node.name)) return true;
    return false;
  }

  // src/handlers/create-frame.ts
  function resolvePaintStyle2(name) {
    return __async(this, null, function* () {
      var _a;
      const styles = yield figma.getLocalPaintStylesAsync();
      const available = styles.map((s) => s.name);
      const exact = styles.find((s) => s.name === name);
      if (exact) return { id: exact.id, available };
      const fuzzy = styles.find((s) => s.name.toLowerCase().includes(name.toLowerCase()));
      return { id: (_a = fuzzy == null ? void 0 : fuzzy.id) != null ? _a : null, available };
    });
  }
  function createSingleFrame(p) {
    return __async(this, null, function* () {
      const {
        x = 0,
        y = 0,
        width = 100,
        height = 100,
        name = "Frame",
        parentId,
        fillColor,
        strokeColor,
        strokeWeight,
        cornerRadius,
        layoutMode = "NONE",
        layoutWrap = "NO_WRAP",
        paddingTop = 0,
        paddingRight = 0,
        paddingBottom = 0,
        paddingLeft = 0,
        primaryAxisAlignItems = "MIN",
        counterAxisAlignItems = "MIN",
        layoutSizingHorizontal = "FIXED",
        layoutSizingVertical = "FIXED",
        itemSpacing = 0,
        fillStyleName,
        strokeStyleName,
        fillVariableId,
        strokeVariableId
      } = p;
      const frame = figma.createFrame();
      frame.x = x;
      frame.y = y;
      frame.resize(width, height);
      frame.name = name;
      frame.fills = [];
      if (cornerRadius !== void 0) frame.cornerRadius = cornerRadius;
      const deferH = parentId && layoutSizingHorizontal === "FILL";
      const deferV = parentId && layoutSizingVertical === "FILL";
      if (layoutMode !== "NONE") {
        frame.layoutMode = layoutMode;
        frame.layoutWrap = layoutWrap;
        frame.paddingTop = paddingTop;
        frame.paddingRight = paddingRight;
        frame.paddingBottom = paddingBottom;
        frame.paddingLeft = paddingLeft;
        frame.primaryAxisAlignItems = primaryAxisAlignItems;
        frame.counterAxisAlignItems = counterAxisAlignItems;
        frame.layoutSizingHorizontal = deferH ? "FIXED" : layoutSizingHorizontal;
        frame.layoutSizingVertical = deferV ? "FIXED" : layoutSizingVertical;
        frame.itemSpacing = itemSpacing;
      }
      const hints = [];
      let fillTokenized = false;
      if (fillVariableId) {
        const v = yield findVariableById(fillVariableId);
        if (v) {
          frame.fills = [solidPaint(fillColor || { r: 0, g: 0, b: 0 })];
          const bound = figma.variables.setBoundVariableForPaint(frame.fills[0], "color", v);
          frame.fills = [bound];
          fillTokenized = true;
        } else {
          hints.push(`fillVariableId '${fillVariableId}' not found.`);
        }
      } else if (fillStyleName) {
        const { id: sid, available } = yield resolvePaintStyle2(fillStyleName);
        if (sid) {
          try {
            yield frame.setFillStyleIdAsync(sid);
            fillTokenized = true;
          } catch (e) {
            hints.push(`fillStyleName '${fillStyleName}' matched but failed to apply: ${e.message}`);
          }
        } else hints.push(styleNotFoundHint("fillStyleName", fillStyleName, available));
      } else if (fillColor) {
        frame.fills = [solidPaint(fillColor)];
        const suggestion = yield suggestStyleForColor(fillColor, "fillStyleName");
        if (suggestion) hints.push(suggestion);
      }
      let strokeTokenized = false;
      if (strokeVariableId) {
        const v = yield findVariableById(strokeVariableId);
        if (v) {
          frame.strokes = [solidPaint(strokeColor || { r: 0, g: 0, b: 0 })];
          const bound = figma.variables.setBoundVariableForPaint(frame.strokes[0], "color", v);
          frame.strokes = [bound];
          strokeTokenized = true;
        } else {
          hints.push(`strokeVariableId '${strokeVariableId}' not found.`);
        }
      } else if (strokeStyleName) {
        const { id: sid, available } = yield resolvePaintStyle2(strokeStyleName);
        if (sid) {
          try {
            yield frame.setStrokeStyleIdAsync(sid);
            strokeTokenized = true;
          } catch (e) {
            hints.push(`strokeStyleName '${strokeStyleName}' matched but failed to apply: ${e.message}`);
          }
        } else hints.push(styleNotFoundHint("strokeStyleName", strokeStyleName, available));
      } else if (strokeColor) {
        frame.strokes = [solidPaint(strokeColor)];
        const suggestion = yield suggestStyleForColor(strokeColor, "strokeStyleName");
        if (suggestion) hints.push(suggestion);
      }
      if (strokeWeight !== void 0) frame.strokeWeight = strokeWeight;
      const parent = yield appendToParent(frame, parentId);
      if (parent) {
        if (deferH) {
          try {
            frame.layoutSizingHorizontal = "FILL";
          } catch (e) {
          }
        }
        if (deferV) {
          try {
            frame.layoutSizingVertical = "FILL";
          } catch (e) {
          }
        }
      }
      if (looksInteractive(frame) && (frame.width < 24 || frame.height < 24)) {
        hints.push("WCAG: Min 24x24px for touch targets.");
      }
      const result = { id: frame.id };
      if (hints.length > 0) result.warning = hints.join(" ");
      return result;
    });
  }
  function createSingleAutoLayout(p) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d, _e, _f;
      if (!((_a = p.nodeIds) == null ? void 0 : _a.length)) throw new Error("Missing nodeIds");
      const nodes = [];
      for (const id of p.nodeIds) {
        const node = yield figma.getNodeByIdAsync(id);
        if (!node) throw new Error(`Node not found: ${id}`);
        nodes.push(node);
      }
      const originalParent = nodes[0].parent || figma.currentPage;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const n of nodes) {
        if ("x" in n && "y" in n && "width" in n && "height" in n) {
          const nx = n.x, ny = n.y, nw = n.width, nh = n.height;
          if (nx < minX) minX = nx;
          if (ny < minY) minY = ny;
          if (nx + nw > maxX) maxX = nx + nw;
          if (ny + nh > maxY) maxY = ny + nh;
        }
      }
      const frame = figma.createFrame();
      frame.name = p.name || "Auto Layout";
      frame.fills = [];
      if (minX !== Infinity) {
        frame.x = minX;
        frame.y = minY;
        frame.resize(maxX - minX, maxY - minY);
      }
      if ("appendChild" in originalParent) originalParent.appendChild(frame);
      for (const node of nodes) frame.appendChild(node);
      frame.layoutMode = p.layoutMode || "VERTICAL";
      frame.itemSpacing = (_b = p.itemSpacing) != null ? _b : 0;
      frame.paddingTop = (_c = p.paddingTop) != null ? _c : 0;
      frame.paddingRight = (_d = p.paddingRight) != null ? _d : 0;
      frame.paddingBottom = (_e = p.paddingBottom) != null ? _e : 0;
      frame.paddingLeft = (_f = p.paddingLeft) != null ? _f : 0;
      if (p.primaryAxisAlignItems) frame.primaryAxisAlignItems = p.primaryAxisAlignItems;
      if (p.counterAxisAlignItems) frame.counterAxisAlignItems = p.counterAxisAlignItems;
      frame.layoutSizingHorizontal = p.layoutSizingHorizontal || "HUG";
      frame.layoutSizingVertical = p.layoutSizingVertical || "HUG";
      if (p.layoutWrap) frame.layoutWrap = p.layoutWrap;
      return { id: frame.id };
    });
  }
  var figmaHandlers6 = {
    create_frame: (p) => batchHandler(p, createSingleFrame),
    create_auto_layout: (p) => batchHandler(p, createSingleAutoLayout)
  };

  // src/handlers/create-text.ts
  function getFontStyle2(weight) {
    const map = {
      100: "Thin",
      200: "Extra Light",
      300: "Light",
      400: "Regular",
      500: "Medium",
      600: "Semi Bold",
      700: "Bold",
      800: "Extra Bold",
      900: "Black"
    };
    return map[weight] || "Regular";
  }
  function prepCreateText(params) {
    return __async(this, null, function* () {
      const items = params.items || [params];
      const fontKeys = /* @__PURE__ */ new Set();
      for (const p of items) {
        const family = p.fontFamily || "Inter";
        const style = p.fontStyle || getFontStyle2(p.fontWeight || 400);
        fontKeys.add(`${family}::${style}`);
      }
      const styleNames = /* @__PURE__ */ new Set();
      for (const p of items) {
        if (p.textStyleName && !p.textStyleId) styleNames.add(p.textStyleName);
      }
      let textStyles = null;
      if (styleNames.size > 0) {
        textStyles = yield figma.getLocalTextStylesAsync();
      }
      const hasFontColorStyle = items.some((p) => p.fontColorStyleName);
      let paintStyles = null;
      if (hasFontColorStyle) {
        paintStyles = yield figma.getLocalPaintStylesAsync();
      }
      const resolvedTextStyleMap = /* @__PURE__ */ new Map();
      for (const p of items) {
        let sid = p.textStyleId;
        if (!sid && p.textStyleName && textStyles) {
          const exact = textStyles.find((s) => s.name === p.textStyleName);
          if (exact) sid = exact.id;
          else {
            const fuzzy = textStyles.find((s) => s.name.toLowerCase().includes(p.textStyleName.toLowerCase()));
            if (fuzzy) sid = fuzzy.id;
          }
        }
        if (sid && !resolvedTextStyleMap.has(sid)) {
          const s = yield figma.getStyleByIdAsync(sid);
          if ((s == null ? void 0 : s.type) === "TEXT") {
            resolvedTextStyleMap.set(sid, s);
            const fn = s.fontName;
            if (fn) fontKeys.add(`${fn.family}::${fn.style}`);
          }
        }
      }
      yield Promise.all(
        [...fontKeys].map((key) => {
          const [family, style] = key.split("::");
          return figma.loadFontAsync({ family, style });
        })
      );
      const { setCharacters: setCharacters2 } = yield Promise.resolve().then(() => (init_figma_helpers(), figma_helpers_exports));
      return { textStyles, paintStyles, resolvedTextStyleMap, setCharacters: setCharacters2 };
    });
  }
  function createTextSingle(p, ctx) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const {
        x = 0,
        y = 0,
        text = "Text",
        fontSize = 14,
        fontWeight = 400,
        fontFamily = "Inter",
        fontStyle,
        fontColor,
        fontColorVariableId,
        fontColorStyleName,
        name = "",
        parentId,
        textStyleId,
        textStyleName,
        textAlignHorizontal,
        textAlignVertical,
        layoutSizingHorizontal,
        layoutSizingVertical,
        textAutoResize
      } = p;
      const textNode = figma.createText();
      textNode.x = x;
      textNode.y = y;
      textNode.name = name || text;
      const style = fontStyle || getFontStyle2(fontWeight);
      textNode.fontName = { family: fontFamily, style };
      textNode.fontSize = parseInt(String(fontSize));
      yield ctx.setCharacters(textNode, text);
      if (textAlignHorizontal) textNode.textAlignHorizontal = textAlignHorizontal;
      if (textAlignVertical) textNode.textAlignVertical = textAlignVertical;
      const hints = [];
      let colorTokenized = false;
      if (fontColorVariableId) {
        const v = yield findVariableById(fontColorVariableId);
        if (v) {
          const fc = fontColor || { r: 0, g: 0, b: 0, a: 1 };
          textNode.fills = [{ type: "SOLID", color: { r: (_a = fc.r) != null ? _a : 0, g: (_b = fc.g) != null ? _b : 0, b: (_c = fc.b) != null ? _c : 0 }, opacity: (_d = fc.a) != null ? _d : 1 }];
          const bound = figma.variables.setBoundVariableForPaint(textNode.fills[0], "color", v);
          textNode.fills = [bound];
          colorTokenized = true;
        } else {
          hints.push(`fontColorVariableId '${fontColorVariableId}' not found.`);
        }
      } else if (fontColorStyleName && ctx.paintStyles) {
        const exact = ctx.paintStyles.find((s) => s.name === fontColorStyleName);
        const match = exact || ctx.paintStyles.find((s) => s.name.toLowerCase().includes(fontColorStyleName.toLowerCase()));
        if (match) {
          try {
            yield textNode.setFillStyleIdAsync(match.id);
            colorTokenized = true;
          } catch (e) {
            hints.push(`fontColorStyleName '${fontColorStyleName}' matched '${match.name}' but failed to apply: ${e.message}`);
          }
        } else {
          hints.push(styleNotFoundHint("fontColorStyleName", fontColorStyleName, ctx.paintStyles.map((s) => s.name)));
        }
      }
      if (!colorTokenized) {
        const fc = fontColor || { r: 0, g: 0, b: 0, a: 1 };
        textNode.fills = [{ type: "SOLID", color: { r: (_e = fc.r) != null ? _e : 0, g: (_f = fc.g) != null ? _f : 0, b: (_g = fc.b) != null ? _g : 0 }, opacity: (_h = fc.a) != null ? _h : 1 }];
        if (fontColor) {
          const suggestion = yield suggestStyleForColor(fontColor, "fontColorStyleName");
          if (suggestion) hints.push(suggestion);
        }
      }
      let resolvedStyleId = textStyleId;
      if (!resolvedStyleId && textStyleName && ctx.textStyles) {
        const exact = ctx.textStyles.find((s) => s.name === textStyleName);
        if (exact) resolvedStyleId = exact.id;
        else {
          const fuzzy = ctx.textStyles.find((s) => s.name.toLowerCase().includes(textStyleName.toLowerCase()));
          if (fuzzy) resolvedStyleId = fuzzy.id;
        }
      }
      if (resolvedStyleId) {
        const cached = ctx.resolvedTextStyleMap.get(resolvedStyleId);
        if (cached) {
          try {
            yield textNode.setTextStyleIdAsync(cached.id);
          } catch (e) {
            hints.push(`textStyleName '${textStyleName || resolvedStyleId}' matched but failed to apply: ${e.message}`);
          }
        } else {
          hints.push(`textStyleName '${textStyleName || resolvedStyleId}' matched style ID '${resolvedStyleId}' but the style could not be loaded. It may be from a remote library or deleted.`);
        }
      } else if (textStyleName) {
        hints.push(styleNotFoundHint("textStyleName", textStyleName, ctx.textStyles.map((s) => s.name)));
      } else {
        hints.push(yield suggestTextStyle(fontSize, fontWeight));
      }
      yield appendToParent(textNode, parentId);
      if (fontSize < 12) {
        hints.push("WCAG: Min 12px text recommended.");
      }
      if (textAutoResize) {
        textNode.textAutoResize = textAutoResize;
      } else if (layoutSizingHorizontal === "FILL" || layoutSizingHorizontal === "FIXED") {
        textNode.textAutoResize = "HEIGHT";
      }
      if (layoutSizingHorizontal) {
        try {
          textNode.layoutSizingHorizontal = layoutSizingHorizontal;
        } catch (e) {
        }
      }
      if (layoutSizingVertical) {
        try {
          textNode.layoutSizingVertical = layoutSizingVertical;
        } catch (e) {
        }
      }
      const result = { id: textNode.id };
      if (hints.length > 0) result.warning = hints.join(" ");
      return result;
    });
  }
  function createTextBatch(params) {
    return __async(this, null, function* () {
      const ctx = yield prepCreateText(params);
      return batchHandler(params, (item) => createTextSingle(item, ctx));
    });
  }
  var figmaHandlers7 = {
    create_text: createTextBatch
  };

  // src/handlers/modify-node.ts
  function moveSingle(p) {
    return __async(this, null, function* () {
      const node = yield figma.getNodeByIdAsync(p.nodeId);
      if (!node) throw new Error(`Node not found: ${p.nodeId}`);
      if (!("x" in node)) throw new Error(`Node does not support position: ${p.nodeId}`);
      node.x = p.x;
      node.y = p.y;
      return {};
    });
  }
  function resizeSingle(p) {
    return __async(this, null, function* () {
      const node = yield figma.getNodeByIdAsync(p.nodeId);
      if (!node) throw new Error(`Node not found: ${p.nodeId}`);
      const savedH = "layoutSizingHorizontal" in node ? node.layoutSizingHorizontal : void 0;
      const savedV = "layoutSizingVertical" in node ? node.layoutSizingVertical : void 0;
      if ("resize" in node) node.resize(p.width, p.height);
      else if ("resizeWithoutConstraints" in node) node.resizeWithoutConstraints(p.width, p.height);
      else throw new Error(`Node does not support resize: ${p.nodeId}`);
      if (savedH === "HUG") node.layoutSizingHorizontal = "HUG";
      if (savedV === "HUG") node.layoutSizingVertical = "HUG";
      return {};
    });
  }
  function deleteSingle(p) {
    return __async(this, null, function* () {
      const node = yield figma.getNodeByIdAsync(p.nodeId);
      if (!node) throw new Error(`Node not found: ${p.nodeId}`);
      node.remove();
      return {};
    });
  }
  function cloneSingle(p) {
    return __async(this, null, function* () {
      const node = yield figma.getNodeByIdAsync(p.nodeId);
      if (!node) throw new Error(`Node not found: ${p.nodeId}`);
      const clone = node.clone();
      if (p.x !== void 0 && "x" in clone) {
        clone.x = p.x;
        clone.y = p.y;
      }
      if (p.parentId) {
        const parent = yield figma.getNodeByIdAsync(p.parentId);
        if (!parent || !("appendChild" in parent)) throw new Error(`Invalid parent: ${p.parentId}`);
        parent.appendChild(clone);
      } else if (node.parent) {
        node.parent.appendChild(clone);
      } else {
        figma.currentPage.appendChild(clone);
      }
      return { id: clone.id };
    });
  }
  function insertSingle(p) {
    return __async(this, null, function* () {
      const parent = yield figma.getNodeByIdAsync(p.parentId);
      if (!parent) throw new Error(`Parent not found: ${p.parentId}`);
      if (!("insertChild" in parent)) throw new Error(`Parent does not support children: ${p.parentId}. Only FRAME, COMPONENT, GROUP, SECTION, and PAGE nodes can have children.`);
      const child = yield figma.getNodeByIdAsync(p.childId);
      if (!child) throw new Error(`Child not found: ${p.childId}`);
      if (p.index !== void 0) parent.insertChild(p.index, child);
      else parent.appendChild(child);
      return {};
    });
  }
  var figmaHandlers8 = {
    move_node: (p) => batchHandler(p, moveSingle),
    resize_node: (p) => batchHandler(p, resizeSingle),
    delete_node: (p) => batchHandler(p, deleteSingle),
    // Legacy alias
    delete_multiple_nodes: (p) => __async(null, null, function* () {
      return batchHandler({ items: (p.nodeIds || []).map((id) => ({ nodeId: id })) }, deleteSingle);
    }),
    clone_node: (p) => batchHandler(p, cloneSingle),
    insert_child: (p) => batchHandler(p, insertSingle)
  };

  // src/handlers/fill-stroke.ts
  function resolveStyle(name) {
    return __async(this, null, function* () {
      const styles = yield figma.getLocalPaintStylesAsync();
      const available = styles.map((s) => s.name);
      const exact = styles.find((s) => s.name === name);
      if (exact) return { match: { id: exact.id, name: exact.name }, available };
      const fuzzy = styles.find((s) => s.name.toLowerCase().includes(name.toLowerCase()));
      if (fuzzy) return { match: { id: fuzzy.id, name: fuzzy.name }, available };
      return { match: null, available };
    });
  }
  function setFillSingle(p) {
    return __async(this, null, function* () {
      const node = yield figma.getNodeByIdAsync(p.nodeId);
      if (!node) throw new Error(`Node not found: ${p.nodeId}`);
      if (!("fills" in node)) throw new Error(`Node does not support fills: ${p.nodeId}`);
      if (p.clear) {
        node.fills = [];
        return {};
      }
      if (p.styleName) {
        const { match, available } = yield resolveStyle(p.styleName);
        if (match) {
          yield node.setFillStyleIdAsync(match.id);
          const result = { matchedStyle: match.name };
          if (p.color) result.warning = "Both styleName and color provided \u2014 used styleName, ignored color. Pass only one.";
          return result;
        }
        throw new Error(styleNotFoundHint("styleName", p.styleName, available));
      } else if (p.color) {
        const { r = 0, g = 0, b = 0, a = 1 } = p.color;
        node.fills = [{ type: "SOLID", color: { r, g, b }, opacity: a }];
        const suggestion = yield suggestStyleForColor(p.color, "styleName");
        if (suggestion) return { warning: suggestion };
      }
      return {};
    });
  }
  function setStrokeSingle(p) {
    return __async(this, null, function* () {
      const node = yield figma.getNodeByIdAsync(p.nodeId);
      if (!node) throw new Error(`Node not found: ${p.nodeId}`);
      if (!("strokes" in node)) throw new Error(`Node does not support strokes: ${p.nodeId}`);
      if (p.styleName) {
        const { match, available } = yield resolveStyle(p.styleName);
        if (match) {
          yield node.setStrokeStyleIdAsync(match.id);
          const result2 = { matchedStyle: match.name };
          if (p.color) result2.warning = "Both styleName and color provided \u2014 used styleName, ignored color. Pass only one.";
          if (p.strokeWeight !== void 0 && "strokeWeight" in node) node.strokeWeight = p.strokeWeight;
          return result2;
        }
        throw new Error(styleNotFoundHint("styleName", p.styleName, available));
      } else if (p.color) {
        const { r = 0, g = 0, b = 0, a = 1 } = p.color;
        node.strokes = [{ type: "SOLID", color: { r, g, b }, opacity: a }];
      }
      if (p.strokeWeight !== void 0 && "strokeWeight" in node) node.strokeWeight = p.strokeWeight;
      const result = {};
      if (p.color) {
        const suggestion = yield suggestStyleForColor(p.color, "styleName");
        if (suggestion) result.warning = suggestion;
      }
      return result;
    });
  }
  function setCornerSingle(p) {
    return __async(this, null, function* () {
      const node = yield figma.getNodeByIdAsync(p.nodeId);
      if (!node) throw new Error(`Node not found: ${p.nodeId}`);
      if (!("cornerRadius" in node)) throw new Error(`Node does not support corner radius: ${p.nodeId}`);
      const corners = p.corners || [true, true, true, true];
      if ("topLeftRadius" in node && Array.isArray(corners) && corners.length === 4) {
        if (corners[0]) node.topLeftRadius = p.radius;
        if (corners[1]) node.topRightRadius = p.radius;
        if (corners[2]) node.bottomRightRadius = p.radius;
        if (corners[3]) node.bottomLeftRadius = p.radius;
      } else {
        node.cornerRadius = p.radius;
      }
      return {};
    });
  }
  function setOpacitySingle(p) {
    return __async(this, null, function* () {
      const node = yield figma.getNodeByIdAsync(p.nodeId);
      if (!node) throw new Error(`Node not found: ${p.nodeId}`);
      if (!("opacity" in node)) throw new Error(`Node does not support opacity`);
      node.opacity = p.opacity;
      return {};
    });
  }
  var figmaHandlers9 = {
    set_fill_color: (p) => batchHandler(p, setFillSingle),
    set_stroke_color: (p) => batchHandler(p, setStrokeSingle),
    set_corner_radius: (p) => batchHandler(p, setCornerSingle),
    set_opacity: (p) => batchHandler(p, setOpacitySingle)
  };

  // src/handlers/effects.ts
  function setEffectsSingle(p) {
    return __async(this, null, function* () {
      const node = yield figma.getNodeByIdAsync(p.nodeId);
      if (!node) throw new Error(`Node not found: ${p.nodeId}`);
      if (!("effects" in node)) throw new Error(`Node does not support effects: ${p.nodeId}`);
      const result = {};
      if (p.effectStyleName) {
        const styles = yield figma.getLocalEffectStylesAsync();
        const exact = styles.find((s) => s.name === p.effectStyleName);
        const match = exact || styles.find((s) => s.name.toLowerCase().includes(p.effectStyleName.toLowerCase()));
        if (!match) {
          const available = styles.map((s) => s.name);
          const names = available.slice(0, 20);
          const suffix = available.length > 20 ? `, \u2026 and ${available.length - 20} more` : "";
          throw new Error(`effectStyleName '${p.effectStyleName}' not found. Available: [${names.join(", ")}${suffix}]`);
        }
        yield node.setEffectStyleIdAsync(match.id);
        result.matchedStyle = match.name;
        if (p.effects) result.warning = "Both effectStyleName and effects provided \u2014 used effectStyleName, ignored effects. Pass only one.";
      } else if (p.effects) {
        const mapped = p.effects.map((e) => {
          var _a, _b, _c, _d, _e, _f, _g;
          const eff = { type: e.type, radius: e.radius, visible: (_a = e.visible) != null ? _a : true };
          if (e.type === "DROP_SHADOW" || e.type === "INNER_SHADOW") eff.blendMode = e.blendMode || "NORMAL";
          if (e.color) eff.color = { r: (_b = e.color.r) != null ? _b : 0, g: (_c = e.color.g) != null ? _c : 0, b: (_d = e.color.b) != null ? _d : 0, a: (_e = e.color.a) != null ? _e : 1 };
          if (e.offset) eff.offset = { x: (_f = e.offset.x) != null ? _f : 0, y: (_g = e.offset.y) != null ? _g : 0 };
          if (e.spread !== void 0) eff.spread = e.spread;
          return eff;
        });
        node.effects = mapped;
      }
      return result;
    });
  }
  function setConstraintsSingle(p) {
    return __async(this, null, function* () {
      const node = yield figma.getNodeByIdAsync(p.nodeId);
      if (!node) throw new Error(`Node not found: ${p.nodeId}`);
      if (!("constraints" in node)) throw new Error(`Node does not support constraints: ${p.nodeId}`);
      node.constraints = { horizontal: p.horizontal, vertical: p.vertical };
      return {};
    });
  }
  function setExportSettingsSingle(p) {
    return __async(this, null, function* () {
      const node = yield figma.getNodeByIdAsync(p.nodeId);
      if (!node) throw new Error(`Node not found: ${p.nodeId}`);
      if (!("exportSettings" in node)) throw new Error(`Node does not support exportSettings: ${p.nodeId}`);
      node.exportSettings = p.settings;
      return {};
    });
  }
  function setNodePropertiesSingle(p) {
    return __async(this, null, function* () {
      const node = yield figma.getNodeByIdAsync(p.nodeId);
      if (!node) throw new Error(`Node not found: ${p.nodeId}`);
      for (const [key, value] of Object.entries(p.properties)) {
        if (key in node) node[key] = value;
      }
      return {};
    });
  }
  var figmaHandlers10 = {
    set_effects: (p) => batchHandler(p, setEffectsSingle),
    set_constraints: (p) => batchHandler(p, setConstraintsSingle),
    set_export_settings: (p) => batchHandler(p, setExportSettingsSingle),
    set_node_properties: (p) => batchHandler(p, setNodePropertiesSingle)
  };

  // src/handlers/update-frame.ts
  var LAYOUT_TYPES = ["FRAME", "COMPONENT", "COMPONENT_SET", "INSTANCE"];
  function updateFrameSingle(p) {
    return __async(this, null, function* () {
      const node = yield figma.getNodeByIdAsync(p.nodeId);
      if (!node) throw new Error(`Node not found: ${p.nodeId}`);
      const isLayoutType = LAYOUT_TYPES.includes(node.type);
      const settingLayoutMode = p.layoutMode !== void 0;
      const hasAutoLayout = settingLayoutMode ? p.layoutMode !== "NONE" : isLayoutType && node.layoutMode !== "NONE";
      if (settingLayoutMode) {
        if (!isLayoutType) throw new Error(`Node type ${node.type} does not support layoutMode`);
        node.layoutMode = p.layoutMode;
        if (p.layoutMode !== "NONE" && p.layoutWrap) node.layoutWrap = p.layoutWrap;
      } else if (p.layoutWrap !== void 0) {
        if (!isLayoutType) throw new Error(`Node type ${node.type} does not support layoutWrap`);
        if (!hasAutoLayout) throw new Error("layoutWrap requires auto-layout (layoutMode !== NONE)");
        node.layoutWrap = p.layoutWrap;
      }
      const hasPadding = p.paddingTop !== void 0 || p.paddingRight !== void 0 || p.paddingBottom !== void 0 || p.paddingLeft !== void 0;
      if (hasPadding) {
        if (!isLayoutType) throw new Error(`Node type ${node.type} does not support padding`);
        if (!hasAutoLayout) throw new Error("Padding requires auto-layout (layoutMode !== NONE)");
        if (p.paddingTop !== void 0) node.paddingTop = p.paddingTop;
        if (p.paddingRight !== void 0) node.paddingRight = p.paddingRight;
        if (p.paddingBottom !== void 0) node.paddingBottom = p.paddingBottom;
        if (p.paddingLeft !== void 0) node.paddingLeft = p.paddingLeft;
      }
      if (p.primaryAxisAlignItems !== void 0 || p.counterAxisAlignItems !== void 0) {
        if (!isLayoutType) throw new Error(`Node type ${node.type} does not support axis alignment`);
        if (!hasAutoLayout) throw new Error("Axis alignment requires auto-layout (layoutMode !== NONE)");
        if (p.primaryAxisAlignItems !== void 0) node.primaryAxisAlignItems = p.primaryAxisAlignItems;
        if (p.counterAxisAlignItems !== void 0) node.counterAxisAlignItems = p.counterAxisAlignItems;
      }
      if (p.layoutSizingHorizontal !== void 0) node.layoutSizingHorizontal = p.layoutSizingHorizontal;
      if (p.layoutSizingVertical !== void 0) node.layoutSizingVertical = p.layoutSizingVertical;
      if (p.itemSpacing !== void 0) {
        if (!isLayoutType) throw new Error(`Node type ${node.type} does not support item spacing`);
        if (!hasAutoLayout) throw new Error("Item spacing requires auto-layout (layoutMode !== NONE)");
        node.itemSpacing = p.itemSpacing;
      }
      if (p.counterAxisSpacing !== void 0) {
        if (!isLayoutType) throw new Error(`Node type ${node.type} does not support counter-axis spacing`);
        if (!hasAutoLayout) throw new Error("Counter-axis spacing requires auto-layout");
        const wrap = p.layoutWrap || node.layoutWrap;
        if (wrap !== "WRAP") throw new Error("counterAxisSpacing requires layoutWrap=WRAP");
        node.counterAxisSpacing = p.counterAxisSpacing;
      }
      return {};
    });
  }
  var figmaHandlers11 = {
    update_frame: (p) => batchHandler(p, updateFrameSingle)
  };

  // src/handlers/text.ts
  function getFontStyle3(weight) {
    const map = {
      100: "Thin",
      200: "Extra Light",
      300: "Light",
      400: "Regular",
      500: "Medium",
      600: "Semi Bold",
      700: "Bold",
      800: "Extra Bold",
      900: "Black"
    };
    return map[weight] || "Regular";
  }
  function prepSetTextContent(params) {
    return __async(this, null, function* () {
      const items = params.items || [params];
      const nodeMap = /* @__PURE__ */ new Map();
      const fontsToLoad = /* @__PURE__ */ new Map();
      fontsToLoad.set("Inter::Regular", { family: "Inter", style: "Regular" });
      for (const p of items) {
        const node = yield figma.getNodeByIdAsync(p.nodeId);
        if ((node == null ? void 0 : node.type) === "TEXT") {
          nodeMap.set(p.nodeId, node);
          const fn = node.fontName;
          if (fn !== figma.mixed && fn) {
            fontsToLoad.set(`${fn.family}::${fn.style}`, fn);
          }
        }
      }
      yield Promise.all([...fontsToLoad.values()].map((f) => figma.loadFontAsync(f)));
      const { setCharacters: setCharacters2 } = yield Promise.resolve().then(() => (init_figma_helpers(), figma_helpers_exports));
      return { nodeMap, setCharacters: setCharacters2 };
    });
  }
  function setTextContentSingle(p, ctx) {
    return __async(this, null, function* () {
      const node = ctx.nodeMap.get(p.nodeId);
      if (!node) {
        const raw = yield figma.getNodeByIdAsync(p.nodeId);
        if (!raw) throw new Error(`Node not found: ${p.nodeId}`);
        throw new Error(`Node is not a text node: ${p.nodeId}`);
      }
      yield ctx.setCharacters(node, p.text);
      return {};
    });
  }
  function setTextContentBatch(params) {
    return __async(this, null, function* () {
      const ctx = yield prepSetTextContent(params);
      return batchHandler(params, (item) => setTextContentSingle(item, ctx));
    });
  }
  function prepSetTextProperties(params) {
    return __async(this, null, function* () {
      const items = params.items || [params];
      const nodeMap = /* @__PURE__ */ new Map();
      const fontsToLoad = /* @__PURE__ */ new Map();
      for (const p of items) {
        const node = yield figma.getNodeByIdAsync(p.nodeId);
        if ((node == null ? void 0 : node.type) === "TEXT") {
          const tn = node;
          nodeMap.set(p.nodeId, tn);
          const fn = tn.fontName;
          if (fn !== figma.mixed && fn) {
            fontsToLoad.set(`${fn.family}::${fn.style}`, fn);
          }
          if (p.fontWeight !== void 0) {
            const style = getFontStyle3(p.fontWeight);
            const family = fn !== figma.mixed && fn ? fn.family : "Inter";
            fontsToLoad.set(`${family}::${style}`, { family, style });
          }
        }
      }
      yield Promise.all([...fontsToLoad.values()].map((f) => figma.loadFontAsync(f)));
      let textStyles = null;
      const styleNames = /* @__PURE__ */ new Set();
      for (const p of items) {
        if (p.textStyleName && !p.textStyleId) styleNames.add(p.textStyleName);
      }
      if (styleNames.size > 0) textStyles = yield figma.getLocalTextStylesAsync();
      return { nodeMap, textStyles };
    });
  }
  function setTextPropertiesSingle(p, ctx) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d, _e, _f;
      const node = ctx.nodeMap.get(p.nodeId);
      if (!node) {
        const raw = yield figma.getNodeByIdAsync(p.nodeId);
        if (!raw) throw new Error(`Node not found: ${p.nodeId}`);
        throw new Error(`Not a text node: ${p.nodeId}`);
      }
      let resolvedStyleId = p.textStyleId;
      if (!resolvedStyleId && p.textStyleName && ctx.textStyles) {
        const exact = ctx.textStyles.find((s) => s.name === p.textStyleName);
        if (exact) resolvedStyleId = exact.id;
        else {
          const fuzzy = ctx.textStyles.find((s) => s.name.toLowerCase().includes(p.textStyleName.toLowerCase()));
          if (fuzzy) resolvedStyleId = fuzzy.id;
        }
      }
      if (resolvedStyleId) {
        const s = yield figma.getStyleByIdAsync(resolvedStyleId);
        if ((s == null ? void 0 : s.type) === "TEXT") yield node.setTextStyleIdAsync(s.id);
      } else {
        if (p.fontWeight !== void 0) {
          const family = node.fontName !== figma.mixed && node.fontName ? node.fontName.family : "Inter";
          node.fontName = { family, style: getFontStyle3(p.fontWeight) };
        }
        if (p.fontSize !== void 0) node.fontSize = p.fontSize;
      }
      if (p.fontColor) {
        node.fills = [{
          type: "SOLID",
          color: { r: (_a = p.fontColor.r) != null ? _a : 0, g: (_b = p.fontColor.g) != null ? _b : 0, b: (_c = p.fontColor.b) != null ? _c : 0 },
          opacity: (_d = p.fontColor.a) != null ? _d : 1
        }];
      }
      if (p.textAlignHorizontal) node.textAlignHorizontal = p.textAlignHorizontal;
      if (p.textAlignVertical) node.textAlignVertical = p.textAlignVertical;
      if (p.textAutoResize) node.textAutoResize = p.textAutoResize;
      if (p.layoutSizingHorizontal) {
        try {
          node.layoutSizingHorizontal = p.layoutSizingHorizontal;
        } catch (e) {
        }
      }
      if (p.layoutSizingVertical) {
        try {
          node.layoutSizingVertical = p.layoutSizingVertical;
        } catch (e) {
        }
      }
      const warnings = [];
      if (p.textStyleName && p.textStyleId) {
        warnings.push("Both textStyleName and textStyleId provided \u2014 used textStyleId. Pass only one.");
      }
      if (!resolvedStyleId && !p.textStyleName && !p.textStyleId && (p.fontSize !== void 0 || p.fontWeight !== void 0)) {
        const fs = (_e = p.fontSize) != null ? _e : typeof node.fontSize === "number" ? node.fontSize : 14;
        const fw = (_f = p.fontWeight) != null ? _f : 400;
        warnings.push(yield suggestTextStyle(fs, fw));
      }
      if (p.fontColor) {
        const suggestion = yield suggestStyleForColor(p.fontColor, "fontColorStyleName");
        if (suggestion) warnings.push(suggestion);
      }
      const result = {};
      if (warnings.length > 0) result.warning = warnings.join(" ");
      return result;
    });
  }
  function setTextPropertiesBatch(params) {
    return __async(this, null, function* () {
      const ctx = yield prepSetTextProperties(params);
      return batchHandler(params, (item) => setTextPropertiesSingle(item, ctx));
    });
  }
  function scanTextSingle(p) {
    return __async(this, null, function* () {
      var _a;
      const node = yield figma.getNodeByIdAsync(p.nodeId);
      if (!node) throw new Error(`Node not found: ${p.nodeId}`);
      const limit = (_a = p.limit) != null ? _a : 50;
      const opts = { includePath: p.includePath !== false, includeGeometry: p.includeGeometry !== false };
      const textNodes = [];
      yield collectTextNodes(node, [], [], 0, textNodes, limit, opts);
      const truncated = textNodes.length >= limit;
      return { nodeId: p.nodeId, count: textNodes.length, truncated, textNodes };
    });
  }
  function collectTextNodes(node, namePath, idPath, depth, out, limit, opts) {
    return __async(this, null, function* () {
      var _a, _b, _c;
      if (out.length >= limit) return;
      if (node.visible === false) return;
      const names = [...namePath, node.name || `Unnamed ${node.type}`];
      const ids = [...idPath, node.id];
      if (node.type === "TEXT") {
        let fontFamily = "", fontStyle = "";
        if (node.fontName && typeof node.fontName === "object") {
          if ("family" in node.fontName) fontFamily = node.fontName.family;
          if ("style" in node.fontName) fontStyle = node.fontName.style;
        }
        const entry = {
          id: node.id,
          name: node.name || "Text",
          characters: node.characters,
          fontSize: typeof node.fontSize === "number" ? node.fontSize : 0,
          fontFamily,
          fontStyle
        };
        if (opts.includeGeometry) {
          const bounds = (_a = node.absoluteBoundingBox) != null ? _a : node.absoluteRenderBounds;
          entry.absoluteX = bounds ? bounds.x : null;
          entry.absoluteY = bounds ? bounds.y : null;
          entry.width = bounds ? bounds.width : (_b = node.width) != null ? _b : 0;
          entry.height = bounds ? bounds.height : (_c = node.height) != null ? _c : 0;
        }
        if (opts.includePath) {
          entry.path = names.join(" > ");
          entry.pathIds = ids.join(" > ");
          entry.depth = depth;
        }
        out.push(entry);
      }
      if ("children" in node) {
        for (const child of node.children) {
          if (out.length >= limit) break;
          yield collectTextNodes(child, names, ids, depth + 1, out, limit, opts);
        }
      }
    });
  }
  function setMultipleTextContentsFigma(params) {
    return __async(this, null, function* () {
      const items = params.text || params.items || [];
      return setTextContentBatch({ items, depth: params.depth });
    });
  }
  var figmaHandlers12 = {
    set_text_content: setTextContentBatch,
    set_text_properties: setTextPropertiesBatch,
    scan_text_nodes: (p) => batchHandler(p, scanTextSingle),
    // Legacy alias
    set_multiple_text_contents: setMultipleTextContentsFigma
  };

  // src/handlers/patch-nodes.ts
  function patchSingleNode(item, textCtx) {
    return __async(this, null, function* () {
      const result = {};
      if (item.x !== void 0 || item.y !== void 0) {
        yield moveSingle({ nodeId: item.nodeId, x: item.x, y: item.y });
      }
      if (item.width !== void 0 || item.height !== void 0) {
        if (item.width === void 0 || item.height === void 0) {
          throw new Error("width and height must both be provided for resize");
        }
        yield resizeSingle({ nodeId: item.nodeId, width: item.width, height: item.height });
      }
      if (item.fill) {
        const r = yield setFillSingle(__spreadValues({ nodeId: item.nodeId }, item.fill));
        if (r.matchedStyle) result.matchedFillStyle = r.matchedStyle;
        if (r.warning) result.warning = appendWarning(result.warning, r.warning);
      }
      if (item.stroke) {
        const r = yield setStrokeSingle({
          nodeId: item.nodeId,
          color: item.stroke.color,
          strokeWeight: item.stroke.weight,
          styleName: item.stroke.styleName
        });
        if (r.matchedStyle) result.matchedStrokeStyle = r.matchedStyle;
        if (r.warning) result.warning = appendWarning(result.warning, r.warning);
      }
      if (item.cornerRadius) {
        yield setCornerSingle(__spreadValues({ nodeId: item.nodeId }, item.cornerRadius));
      }
      if (item.opacity !== void 0) {
        yield setOpacitySingle({ nodeId: item.nodeId, opacity: item.opacity });
      }
      if (item.effects) {
        const r = yield setEffectsSingle({
          nodeId: item.nodeId,
          effects: item.effects.effects,
          effectStyleName: item.effects.styleName
        });
        if (r.matchedStyle) result.matchedEffectStyle = r.matchedStyle;
        if (r.warning) result.warning = appendWarning(result.warning, r.warning);
      }
      if (item.constraints) {
        yield setConstraintsSingle(__spreadValues({ nodeId: item.nodeId }, item.constraints));
      }
      if (item.exportSettings) {
        yield setExportSettingsSingle({ nodeId: item.nodeId, settings: item.exportSettings });
      }
      if (item.layout) {
        yield updateFrameSingle(__spreadValues({ nodeId: item.nodeId }, item.layout));
      }
      if (item.text && textCtx) {
        const r = yield setTextPropertiesSingle(__spreadValues({ nodeId: item.nodeId }, item.text), textCtx);
        if (r.warning) result.warning = appendWarning(result.warning, r.warning);
      }
      if (item.properties) {
        yield setNodePropertiesSingle({ nodeId: item.nodeId, properties: item.properties });
      }
      return result;
    });
  }
  function appendWarning(existing, addition) {
    return existing ? `${existing} ${addition}` : addition;
  }
  function patchNodesBatch(params) {
    return __async(this, null, function* () {
      const items = params.items || [params];
      let textCtx = null;
      const textItems = items.filter((item) => item.text);
      if (textItems.length > 0) {
        const syntheticItems = textItems.map((item) => __spreadValues({
          nodeId: item.nodeId
        }, item.text));
        textCtx = yield prepSetTextProperties({ items: syntheticItems });
      }
      return batchHandler(params, (item) => patchSingleNode(item, textCtx));
    });
  }
  var figmaHandlers13 = {
    patch_nodes: patchNodesBatch
  };

  // src/handlers/fonts.ts
  function getAvailableFonts(params) {
    return __async(this, null, function* () {
      const fonts = yield figma.listAvailableFontsAsync();
      let result = fonts;
      if (params == null ? void 0 : params.query) {
        const q = params.query.toLowerCase();
        result = fonts.filter((f) => f.fontName.family.toLowerCase().includes(q));
      }
      const familyMap = {};
      for (const f of result) {
        const fam = f.fontName.family;
        if (!familyMap[fam]) familyMap[fam] = [];
        familyMap[fam].push(f.fontName.style);
      }
      return {
        count: Object.keys(familyMap).length,
        fonts: Object.entries(familyMap).map(([family, styles]) => ({ family, styles }))
      };
    });
  }
  var figmaHandlers14 = {
    get_available_fonts: getAvailableFonts
  };

  // ../core/dist/tools/endpoint.js
  function pickFields2(obj, fields) {
    if (fields.includes("*")) return obj;
    const keep = /* @__PURE__ */ new Set([...fields, "id", "name", "type"]);
    const out = {};
    for (const key of Object.keys(obj)) {
      if (keep.has(key)) out[key] = obj[key];
    }
    return out;
  }
  function paginate(items, offset = 0, limit = 100) {
    const sliced = items.slice(offset, offset + limit);
    return { totalCount: items.length, returned: sliced.length, offset, limit, items: sliced };
  }
  function createDispatcher(handlers) {
    const supported = Object.keys(handlers).join(", ");
    return (params) => __async(null, null, function* () {
      var _a;
      const method = params.method;
      const handler = handlers[method];
      if (!handler) throw new Error(`Method '${method}' not supported. Available: ${supported}`);
      let result = yield handler(params);
      if (method === "get" && ((_a = params.fields) == null ? void 0 : _a.length) && result && typeof result === "object") {
        result = pickFields2(result, params.fields);
      }
      return result;
    });
  }

  // src/handlers/components.ts
  function resolvePaintStyle3(name) {
    return __async(this, null, function* () {
      var _a;
      const styles = yield figma.getLocalPaintStylesAsync();
      const available = styles.map((s) => s.name);
      const exact = styles.find((s) => s.name === name);
      if (exact) return { id: exact.id, available };
      const fuzzy = styles.find((s) => s.name.toLowerCase().includes(name.toLowerCase()));
      return { id: (_a = fuzzy == null ? void 0 : fuzzy.id) != null ? _a : null, available };
    });
  }
  function bindFillVariable(node, variableId, fallbackColor) {
    return __async(this, null, function* () {
      const v = yield findVariableById(variableId);
      if (!v) return false;
      node.fills = [solidPaint(fallbackColor || { r: 0, g: 0, b: 0 })];
      const bound = figma.variables.setBoundVariableForPaint(node.fills[0], "color", v);
      node.fills = [bound];
      return true;
    });
  }
  function bindStrokeVariable(node, variableId, fallbackColor) {
    return __async(this, null, function* () {
      const v = yield findVariableById(variableId);
      if (!v) return false;
      node.strokes = [solidPaint(fallbackColor || { r: 0, g: 0, b: 0 })];
      const bound = figma.variables.setBoundVariableForPaint(node.strokes[0], "color", v);
      node.strokes = [bound];
      return true;
    });
  }
  function findTextNodes(node) {
    if (node.type === "TEXT") return [node];
    if ("children" in node) {
      const result = [];
      for (const child of node.children) result.push(...findTextNodes(child));
      return result;
    }
    return [];
  }
  function warnUnboundText(comp, hints) {
    const textNodes = findTextNodes(comp);
    if (textNodes.length > 0) {
      hints.push(`Component has ${textNodes.length} text node${textNodes.length > 1 ? "s" : ""} \u2014 use components(method: "create", type: "from_node", exposeText: true) or components(method: "update") to expose text as editable properties on instances.`);
    }
  }
  function serializeComponent(node) {
    const r = { id: node.id, name: node.name, type: node.type };
    if ("description" in node) r.description = node.description;
    if (node.parent) {
      r.parentId = node.parent.id;
      r.parentName = node.parent.name;
    }
    if ("componentPropertyDefinitions" in node) r.propertyDefinitions = node.componentPropertyDefinitions;
    if (node.type === "COMPONENT_SET" && "variantGroupProperties" in node) r.variantGroupProperties = node.variantGroupProperties;
    if (node.type === "COMPONENT" && "variantProperties" in node) r.variantProperties = node.variantProperties;
    if ("children" in node && node.children) {
      if (node.type === "COMPONENT_SET") {
        r.variantCount = node.children.length;
        r.children = node.children.map((c) => ({ id: c.id, name: c.name, type: c.type }));
      } else {
        r.children = node.children.map((c) => ({ id: c.id, name: c.name, type: c.type }));
      }
    }
    return r;
  }
  function createComponentSingle(p) {
    return __async(this, null, function* () {
      if (!p.name) throw new Error("Missing name");
      const {
        x = 0,
        y = 0,
        width = 100,
        height = 100,
        name,
        parentId,
        fillColor,
        fillStyleName,
        fillVariableId,
        strokeColor,
        strokeStyleName,
        strokeVariableId,
        strokeWeight,
        cornerRadius,
        layoutMode = "NONE",
        layoutWrap = "NO_WRAP",
        paddingTop = 0,
        paddingRight = 0,
        paddingBottom = 0,
        paddingLeft = 0,
        primaryAxisAlignItems = "MIN",
        counterAxisAlignItems = "MIN",
        layoutSizingHorizontal = "FIXED",
        layoutSizingVertical = "FIXED",
        itemSpacing = 0
      } = p;
      const deferH = parentId && layoutSizingHorizontal === "FILL";
      const deferV = parentId && layoutSizingVertical === "FILL";
      const comp = figma.createComponent();
      comp.name = name;
      comp.x = x;
      comp.y = y;
      comp.resize(width, height);
      comp.fills = [];
      if (layoutMode !== "NONE") {
        comp.layoutMode = layoutMode;
        comp.layoutWrap = layoutWrap;
        comp.paddingTop = paddingTop;
        comp.paddingRight = paddingRight;
        comp.paddingBottom = paddingBottom;
        comp.paddingLeft = paddingLeft;
        comp.primaryAxisAlignItems = primaryAxisAlignItems;
        comp.counterAxisAlignItems = counterAxisAlignItems;
        comp.layoutSizingHorizontal = deferH ? "FIXED" : layoutSizingHorizontal;
        comp.layoutSizingVertical = deferV ? "FIXED" : layoutSizingVertical;
        comp.itemSpacing = itemSpacing;
      }
      const hints = [];
      if (fillVariableId) {
        const ok = yield bindFillVariable(comp, fillVariableId, fillColor);
        if (!ok) hints.push(`fillVariableId '${fillVariableId}' not found.`);
      } else if (fillStyleName) {
        const { id: sid, available } = yield resolvePaintStyle3(fillStyleName);
        if (sid) {
          try {
            yield comp.setFillStyleIdAsync(sid);
          } catch (e) {
            hints.push(`fillStyleName '${fillStyleName}' matched but failed to apply: ${e.message}`);
          }
        } else hints.push(styleNotFoundHint("fillStyleName", fillStyleName, available));
      } else if (fillColor) {
        comp.fills = [solidPaint(fillColor)];
        const suggestion = yield suggestStyleForColor(fillColor, "fillStyleName");
        if (suggestion) hints.push(suggestion);
      }
      if (strokeVariableId) {
        const ok = yield bindStrokeVariable(comp, strokeVariableId, strokeColor);
        if (!ok) hints.push(`strokeVariableId '${strokeVariableId}' not found.`);
      } else if (strokeStyleName) {
        const { id: sid, available } = yield resolvePaintStyle3(strokeStyleName);
        if (sid) {
          try {
            yield comp.setStrokeStyleIdAsync(sid);
          } catch (e) {
            hints.push(`strokeStyleName '${strokeStyleName}' matched but failed to apply: ${e.message}`);
          }
        } else hints.push(styleNotFoundHint("strokeStyleName", strokeStyleName, available));
      } else if (strokeColor) {
        comp.strokes = [solidPaint(strokeColor)];
        const suggestion = yield suggestStyleForColor(strokeColor, "strokeStyleName");
        if (suggestion) hints.push(suggestion);
      }
      if (strokeWeight !== void 0) comp.strokeWeight = strokeWeight;
      if (cornerRadius !== void 0) comp.cornerRadius = cornerRadius;
      const parent = yield appendToParent(comp, parentId);
      if (parent) {
        if (deferH) {
          try {
            comp.layoutSizingHorizontal = "FILL";
          } catch (e) {
          }
        }
        if (deferV) {
          try {
            comp.layoutSizingVertical = "FILL";
          } catch (e) {
          }
        }
      }
      warnUnboundText(comp, hints);
      const result = { id: comp.id };
      if (hints.length > 0) result.warning = hints.join(" ");
      return result;
    });
  }
  function fromNodeSingle(p) {
    return __async(this, null, function* () {
      const node = yield figma.getNodeByIdAsync(p.nodeId);
      if (!node) throw new Error(`Node not found: ${p.nodeId}`);
      if (node.type === "DOCUMENT" || node.type === "PAGE") throw new Error(`Cannot convert ${node.type} to a component.`);
      if (node.type === "COMPONENT") throw new Error(`Node "${node.name}" is already a COMPONENT.`);
      if (node.type === "COMPONENT_SET") throw new Error(`Node "${node.name}" is already a COMPONENT_SET. Use components(method: "get") to inspect it.`);
      if (node.type === "INSTANCE") throw new Error(`Node "${node.name}" is an INSTANCE. Detach it first with patch_nodes, or use the source component directly.`);
      const comp = figma.createComponentFromNode(node);
      const hints = [];
      const exposedProperties = {};
      if (p.exposeText) {
        const textNodes = findTextNodes(comp);
        for (const textNode of textNodes) {
          const propName = textNode.name;
          const defaultValue = textNode.characters;
          comp.addComponentProperty(propName, "TEXT", defaultValue);
          const defs = comp.componentPropertyDefinitions;
          const key = Object.keys(defs).find((k) => k === propName || k.startsWith(propName + "#"));
          if (key) {
            textNode.componentPropertyReferences = { characters: key };
            exposedProperties[key] = defaultValue;
          }
        }
      } else {
        warnUnboundText(comp, hints);
      }
      const result = { id: comp.id };
      if (Object.keys(exposedProperties).length > 0) result.exposedProperties = exposedProperties;
      if (hints.length > 0) result.warning = hints.join(" ");
      return result;
    });
  }
  function combineSingle(p) {
    return __async(this, null, function* () {
      var _a;
      if (!((_a = p.componentIds) == null ? void 0 : _a.length) || p.componentIds.length < 2) throw new Error("Need at least 2 components");
      const comps = [];
      for (const id of p.componentIds) {
        const node = yield figma.getNodeByIdAsync(id);
        if (!node) throw new Error(`Component not found: ${id}`);
        if (node.type !== "COMPONENT") throw new Error(`Node ${id} is not a COMPONENT`);
        comps.push(node);
      }
      const parent = comps[0].parent && comps.every((c) => c.parent === comps[0].parent) ? comps[0].parent : figma.currentPage;
      const set = figma.combineAsVariants(comps, parent);
      if (p.name) set.name = p.name;
      const unboundCount = comps.reduce((n, c) => {
        return n + findTextNodes(c).filter((t) => {
          var _a2;
          return !((_a2 = t.componentPropertyReferences) == null ? void 0 : _a2.characters);
        }).length;
      }, 0);
      const result = { id: set.id };
      if (unboundCount > 0) {
        result.warning = `${unboundCount} text node${unboundCount > 1 ? "s" : ""} across variants not exposed as properties \u2014 instances cannot edit this text via properties. Fix: components(method: "update", items: [{id: "${set.id}", propertyName: "<textNodeName>", type: "TEXT", defaultValue: "<text>"}])`;
      }
      return result;
    });
  }
  function createComponentDispatch(params) {
    return __async(this, null, function* () {
      switch (params.type) {
        case "component":
          return batchHandler(params, createComponentSingle);
        case "from_node":
          return batchHandler(params, fromNodeSingle);
        case "variant_set":
          return batchHandler(params, combineSingle);
        default:
          throw new Error(`Unknown create type: ${params.type}`);
      }
    });
  }
  function getComponentFigma(params) {
    return __async(this, null, function* () {
      const node = yield figma.getNodeByIdAsync(params.id);
      if (!node) throw new Error(`Component not found: ${params.id}`);
      if (node.type !== "COMPONENT" && node.type !== "COMPONENT_SET") throw new Error(`Not a component: ${node.type}`);
      return serializeComponent(node);
    });
  }
  function listComponentsFigma(params) {
    return __async(this, null, function* () {
      yield figma.loadAllPagesAsync();
      const setsOnly = params == null ? void 0 : params.setsOnly;
      const types = setsOnly ? ["COMPONENT_SET"] : ["COMPONENT", "COMPONENT_SET"];
      let components = figma.root.findAllWithCriteria({ types });
      if (params == null ? void 0 : params.name) {
        const f = params.name.toLowerCase();
        components = components.filter((c) => c.name.toLowerCase().includes(f));
      }
      const paged = paginate(components, params.offset, params.limit);
      const fields = params.fields;
      const items = paged.items.map((c) => {
        const stub = { id: c.id, name: c.name, type: c.type };
        if (c.type === "COMPONENT_SET" && "children" in c) stub.variantCount = c.children.length;
        if (c.description) stub.description = c.description;
        let p = c.parent;
        while (p && p.type !== "PAGE") p = p.parent;
        if (p) {
          stub.pageId = p.id;
          stub.pageName = p.name;
        }
        if (fields == null ? void 0 : fields.length) return pickFields2(stub, fields);
        return stub;
      });
      return __spreadProps(__spreadValues({}, paged), { items });
    });
  }
  function addComponentPropertySingle(p) {
    return __async(this, null, function* () {
      const node = yield figma.getNodeByIdAsync(p.id);
      if (!node) throw new Error(`Node not found: ${p.id}`);
      if (node.type !== "COMPONENT" && node.type !== "COMPONENT_SET") throw new Error(`Node ${p.id} is a ${node.type}, not a COMPONENT or COMPONENT_SET.`);
      node.addComponentProperty(p.propertyName, p.type, p.defaultValue);
      const defs = node.componentPropertyDefinitions;
      const key = Object.keys(defs).find((k) => k === p.propertyName || k.startsWith(p.propertyName + "#"));
      if (key && p.type === "TEXT") {
        const roots = node.type === "COMPONENT_SET" ? node.children.filter((c) => c.type === "COMPONENT") : [node];
        for (const root of roots) {
          const textNode = findTextNodes(root).find(
            (t) => t.name === p.propertyName || t.characters === p.defaultValue
          );
          if (textNode) textNode.componentPropertyReferences = { characters: key };
        }
      }
      return key ? { propertyKey: key } : {};
    });
  }
  function instanceCreateSingle(p) {
    return __async(this, null, function* () {
      var _a;
      let node = yield figma.getNodeByIdAsync(p.componentId);
      if (!node) {
        yield figma.loadAllPagesAsync();
        node = yield figma.getNodeByIdAsync(p.componentId);
      }
      if (!node) throw new Error(`Component not found: ${p.componentId}`);
      if (node.type === "COMPONENT_SET") {
        if (!((_a = node.children) == null ? void 0 : _a.length)) throw new Error("Component set has no variants");
        if (p.variantProperties && typeof p.variantProperties === "object") {
          const match = node.children.find((child) => {
            if (child.type !== "COMPONENT" || !child.variantProperties) return false;
            return Object.entries(p.variantProperties).every(
              ([k, v]) => {
                if (child.variantProperties[k] === v) return true;
                const prefixedKey = `${node.name}/${k}`;
                return child.variantProperties[prefixedKey] === v;
              }
            );
          });
          if (match) node = match;
          else {
            const prefix = `${node.name}/`;
            const available = node.children.filter((c) => c.type === "COMPONENT").map((c) => {
              const props = {};
              for (const [k, v] of Object.entries(c.variantProperties || {})) {
                props[k.startsWith(prefix) ? k.slice(prefix.length) : k] = v;
              }
              return props;
            });
            throw new Error(`No variant matching ${JSON.stringify(p.variantProperties)} in ${node.name}. Available: ${JSON.stringify(available)}`);
          }
        } else {
          node = node.defaultVariant || node.children[0];
        }
      }
      if (node.type !== "COMPONENT") throw new Error(`Not a component: ${node.type}`);
      const inst = node.createInstance();
      if (p.x !== void 0) inst.x = p.x;
      if (p.y !== void 0) inst.y = p.y;
      yield appendToParent(inst, p.parentId);
      return { id: inst.id };
    });
  }
  function instanceGetFigma(params) {
    return __async(this, null, function* () {
      const inst = yield figma.getNodeByIdAsync(params.id);
      if (!inst) throw new Error(`Instance not found: ${params.id}`);
      if (inst.type !== "INSTANCE") throw new Error("Node is not an instance");
      const overrides = inst.overrides || [];
      const main = yield inst.getMainComponentAsync();
      return {
        mainComponentId: main == null ? void 0 : main.id,
        overrides: overrides.map((o) => ({ id: o.id, fields: o.overriddenFields }))
      };
    });
  }
  function instanceUpdateSingle(p) {
    return __async(this, null, function* () {
      const node = yield figma.getNodeByIdAsync(p.id);
      if (!node) throw new Error(`Node not found: ${p.id}`);
      if (node.type !== "INSTANCE") throw new Error(`Node ${p.id} is ${node.type}, not an INSTANCE`);
      node.setProperties(p.properties);
      return {};
    });
  }
  var figmaHandlers15 = {
    components: createDispatcher({
      create: createComponentDispatch,
      get: getComponentFigma,
      list: listComponentsFigma,
      update: (p) => batchHandler(p, addComponentPropertySingle)
    }),
    instances: createDispatcher({
      create: (p) => batchHandler(p, instanceCreateSingle),
      get: instanceGetFigma,
      update: (p) => batchHandler(p, instanceUpdateSingle)
    })
  };

  // src/handlers/styles.ts
  function ensureStyleId(id) {
    return id.startsWith("S:") && !id.endsWith(",") ? id + "," : id;
  }
  var TYPE_FILTER_MAP = {
    paint: "PAINT",
    text: "TEXT",
    effect: "EFFECT"
  };
  function rgbaToHex2(color) {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    const a = color.a !== void 0 ? Math.round(color.a * 255) : 255;
    if (a === 255) return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
    return `#${[r, g, b, a].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
  }
  function serializeStyle(style) {
    const r = { id: style.id, name: style.name, type: style.type };
    if (style.type === "PAINT") {
      r.paints = style.paints.map((p) => {
        const paint = __spreadValues({}, p);
        if (paint.color) paint.color = rgbaToHex2(paint.color);
        return paint;
      });
    } else if (style.type === "TEXT") {
      const ts = style;
      r.fontSize = ts.fontSize;
      r.fontName = ts.fontName;
      r.letterSpacing = ts.letterSpacing;
      r.lineHeight = ts.lineHeight;
      r.textCase = ts.textCase;
      r.textDecoration = ts.textDecoration;
    } else if (style.type === "EFFECT") {
      r.effects = style.effects;
    }
    return r;
  }
  function listStylesFigma(params) {
    return __async(this, null, function* () {
      const typeFilter = params.type ? TYPE_FILTER_MAP[params.type] : null;
      const fetchers = [];
      if (!typeFilter || typeFilter === "PAINT") fetchers.push(figma.getLocalPaintStylesAsync());
      if (!typeFilter || typeFilter === "TEXT") fetchers.push(figma.getLocalTextStylesAsync());
      if (!typeFilter || typeFilter === "EFFECT") fetchers.push(figma.getLocalEffectStylesAsync());
      if (!typeFilter) fetchers.push(figma.getLocalGridStylesAsync());
      const groups = yield Promise.all(fetchers);
      const allStyles = groups.flat();
      const paged = paginate(allStyles, params.offset, params.limit);
      const fields = params.fields;
      const items = paged.items.map((s) => {
        const full = serializeStyle(s);
        if (!(fields == null ? void 0 : fields.length)) return pickFields2(full, []);
        return pickFields2(full, fields);
      });
      return __spreadProps(__spreadValues({}, paged), { items });
    });
  }
  function getStyleByIdFigma(params) {
    return __async(this, null, function* () {
      const style = yield figma.getStyleByIdAsync(ensureStyleId(params.id));
      if (!style) throw new Error(`Style not found: ${params.id}`);
      return serializeStyle(style);
    });
  }
  function removeStyleSingle(p) {
    return __async(this, null, function* () {
      const style = yield figma.getStyleByIdAsync(ensureStyleId(p.id));
      if (!style) throw new Error(`Style not found: ${p.id}`);
      style.remove();
      return "ok";
    });
  }
  function createPaintStyleSingle(p) {
    return __async(this, null, function* () {
      const style = figma.createPaintStyle();
      style.name = p.name;
      const { r, g, b, a = 1 } = p.color;
      style.paints = [{ type: "SOLID", color: { r, g, b }, opacity: a }];
      return { id: style.id };
    });
  }
  function createTextStyleSingle(p) {
    return __async(this, null, function* () {
      const style = figma.createTextStyle();
      style.name = p.name;
      const fontStyle = p.fontStyle || "Regular";
      style.fontName = { family: p.fontFamily, style: fontStyle };
      style.fontSize = p.fontSize;
      if (p.lineHeight !== void 0) {
        if (typeof p.lineHeight === "number") style.lineHeight = { value: p.lineHeight, unit: "PIXELS" };
        else if (p.lineHeight.unit === "AUTO") style.lineHeight = { unit: "AUTO" };
        else style.lineHeight = { value: p.lineHeight.value, unit: p.lineHeight.unit };
      }
      if (p.letterSpacing !== void 0) {
        if (typeof p.letterSpacing === "number") style.letterSpacing = { value: p.letterSpacing, unit: "PIXELS" };
        else style.letterSpacing = { value: p.letterSpacing.value, unit: p.letterSpacing.unit };
      }
      if (p.textCase) style.textCase = p.textCase;
      if (p.textDecoration) style.textDecoration = p.textDecoration;
      const result = { id: style.id };
      const hints = [];
      if (p.fontSize < 12) {
        hints.push("WCAG: Min 12px text recommended.");
      }
      if (p.lineHeight !== void 0 && p.lineHeight !== "AUTO") {
        let lhPx = null;
        if (typeof p.lineHeight === "number") lhPx = p.lineHeight;
        else if (p.lineHeight.unit === "PIXELS") lhPx = p.lineHeight.value;
        else if (p.lineHeight.unit === "PERCENT") lhPx = p.lineHeight.value / 100 * p.fontSize;
        if (lhPx !== null && lhPx / p.fontSize < 1.5) {
          hints.push(`WCAG: Line height ${Math.ceil(p.fontSize * 1.5)}px (1.5x) recommended.`);
        }
      }
      if (hints.length > 0) result.warning = hints.join(" ");
      return result;
    });
  }
  function createEffectStyleSingle(p) {
    return __async(this, null, function* () {
      const style = figma.createEffectStyle();
      style.name = p.name;
      style.effects = p.effects.map((e) => {
        var _a, _b;
        const eff = { type: e.type, radius: e.radius, visible: (_a = e.visible) != null ? _a : true };
        if (e.type === "DROP_SHADOW" || e.type === "INNER_SHADOW") eff.blendMode = e.blendMode || "NORMAL";
        if (e.color) eff.color = { r: e.color.r, g: e.color.g, b: e.color.b, a: (_b = e.color.a) != null ? _b : 1 };
        if (e.offset) eff.offset = { x: e.offset.x, y: e.offset.y };
        if (e.spread !== void 0) eff.spread = e.spread;
        return eff;
      });
      return { id: style.id };
    });
  }
  function resolveAnyStyle(idOrName) {
    return __async(this, null, function* () {
      const byId = yield figma.getStyleByIdAsync(ensureStyleId(idOrName));
      if (byId) return byId;
      const [paints, texts, effects] = yield Promise.all([
        figma.getLocalPaintStylesAsync(),
        figma.getLocalTextStylesAsync(),
        figma.getLocalEffectStylesAsync()
      ]);
      const all = [...paints, ...texts, ...effects];
      const exact = all.find((s) => s.name === idOrName);
      if (exact) return exact;
      const fuzzy = all.find((s) => s.name.toLowerCase().includes(idOrName.toLowerCase()));
      if (fuzzy) return fuzzy;
      throw new Error(`Style not found: '${idOrName}'`);
    });
  }
  var PAINT_FIELDS = ["color"];
  var TEXT_FIELDS = ["fontFamily", "fontStyle", "fontSize", "lineHeight", "letterSpacing", "textCase", "textDecoration"];
  var EFFECT_FIELDS = ["effects"];
  var TYPE_FIELDS = { PAINT: PAINT_FIELDS, TEXT: TEXT_FIELDS, EFFECT: EFFECT_FIELDS };
  function patchStyleSingle(p) {
    return __async(this, null, function* () {
      var _a, _b;
      const style = yield resolveAnyStyle(p.id);
      if (p.name !== void 0) style.name = p.name;
      const applicable = TYPE_FIELDS[style.type] || [];
      const allTypeFields = [...PAINT_FIELDS, ...TEXT_FIELDS, ...EFFECT_FIELDS];
      const ignored = allTypeFields.filter((f) => p[f] !== void 0 && !applicable.includes(f));
      if (style.type === "PAINT") {
        const ps = style;
        if (p.color !== void 0) {
          const { r, g, b, a = 1 } = p.color;
          ps.paints = [{ type: "SOLID", color: { r, g, b }, opacity: a }];
        }
      } else if (style.type === "TEXT") {
        const ts = style;
        const newFamily = (_a = p.fontFamily) != null ? _a : ts.fontName.family;
        const newFontStyle = (_b = p.fontStyle) != null ? _b : ts.fontName.style;
        if (p.fontFamily !== void 0 || p.fontStyle !== void 0) {
          ts.fontName = { family: newFamily, style: newFontStyle };
        }
        if (p.fontSize !== void 0) ts.fontSize = p.fontSize;
        if (p.lineHeight !== void 0) {
          if (typeof p.lineHeight === "number") ts.lineHeight = { value: p.lineHeight, unit: "PIXELS" };
          else if (p.lineHeight.unit === "AUTO") ts.lineHeight = { unit: "AUTO" };
          else ts.lineHeight = { value: p.lineHeight.value, unit: p.lineHeight.unit };
        }
        if (p.letterSpacing !== void 0) {
          if (typeof p.letterSpacing === "number") ts.letterSpacing = { value: p.letterSpacing, unit: "PIXELS" };
          else ts.letterSpacing = { value: p.letterSpacing.value, unit: p.letterSpacing.unit };
        }
        if (p.textCase !== void 0) ts.textCase = p.textCase;
        if (p.textDecoration !== void 0) ts.textDecoration = p.textDecoration;
      } else if (style.type === "EFFECT") {
        const es = style;
        if (p.effects !== void 0) {
          es.effects = p.effects.map((e) => {
            var _a2, _b2;
            const eff = { type: e.type, radius: e.radius, visible: (_a2 = e.visible) != null ? _a2 : true };
            if (e.type === "DROP_SHADOW" || e.type === "INNER_SHADOW") eff.blendMode = e.blendMode || "NORMAL";
            if (e.color) eff.color = { r: e.color.r, g: e.color.g, b: e.color.b, a: (_b2 = e.color.a) != null ? _b2 : 1 };
            if (e.offset) eff.offset = { x: e.offset.x, y: e.offset.y };
            if (e.spread !== void 0) eff.spread = e.spread;
            return eff;
          });
        }
      }
      const hints = [];
      if (ignored.length > 0) {
        hints.push(`${ignored.join(", ")} not applicable for ${style.type} style, ignored.`);
      }
      if (style.type === "TEXT") {
        const ts = style;
        if (ts.fontSize < 12) hints.push("WCAG: Min 12px text recommended.");
        const lh = ts.lineHeight;
        if (lh && lh.unit !== "AUTO") {
          let lhPx = null;
          if (lh.unit === "PIXELS") lhPx = lh.value;
          else if (lh.unit === "PERCENT") lhPx = lh.value / 100 * ts.fontSize;
          if (lhPx !== null && lhPx / ts.fontSize < 1.5) {
            hints.push(`WCAG: Line height ${Math.ceil(ts.fontSize * 1.5)}px (1.5x) recommended.`);
          }
        }
      }
      if (hints.length > 0) return { warning: hints.join(" ") };
      return "ok";
    });
  }
  var MAX_FONTS_PER_BATCH = 5;
  function createTextStyleBatch(params) {
    return __async(this, null, function* () {
      const items = params.items || [params];
      const itemFontKeys = items.map((p) => `${p.fontFamily}::${p.fontStyle || "Regular"}`);
      const uniqueFonts = [...new Set(itemFontKeys)];
      if (uniqueFonts.length <= MAX_FONTS_PER_BATCH) {
        yield Promise.all(
          uniqueFonts.map((key) => {
            const [family, style] = key.split("::");
            return figma.loadFontAsync({ family, style });
          })
        );
        return batchHandler(params, createTextStyleSingle);
      }
      const loadedFonts = new Set(uniqueFonts.slice(0, MAX_FONTS_PER_BATCH));
      yield Promise.all(
        [...loadedFonts].map((key) => {
          const [family, style] = key.split("::");
          return figma.loadFontAsync({ family, style });
        })
      );
      const processItems = [];
      const deferredItems = [];
      for (let i = 0; i < items.length; i++) {
        if (loadedFonts.has(itemFontKeys[i])) processItems.push(items[i]);
        else deferredItems.push(items[i]);
      }
      const deferredFonts = uniqueFonts.slice(MAX_FONTS_PER_BATCH).map((k) => k.replace("::", " "));
      const result = yield batchHandler(__spreadProps(__spreadValues({}, params), { items: processItems }), createTextStyleSingle);
      result.deferred = `${deferredItems.length} text style(s) using fonts [${deferredFonts.join(", ")}] were NOT created to avoid timeout. Call styles(method: "create", type: "text") again with those items.`;
      return result;
    });
  }
  function patchStylesBatch(params) {
    return __async(this, null, function* () {
      var _a, _b;
      const items = params.items || [params];
      const fontKeys = [];
      for (const p of items) {
        try {
          const style = yield resolveAnyStyle(p.id);
          if (style.type === "TEXT") {
            const ts = style;
            const family = (_a = p.fontFamily) != null ? _a : ts.fontName.family;
            const fontStyle = (_b = p.fontStyle) != null ? _b : ts.fontName.style;
            fontKeys.push(`${family}::${fontStyle}`);
          }
        } catch (e) {
        }
      }
      const uniqueFonts = [...new Set(fontKeys)];
      if (uniqueFonts.length > 0) {
        const toLoad = uniqueFonts.slice(0, MAX_FONTS_PER_BATCH);
        yield Promise.all(
          toLoad.map((key) => {
            const [family, style] = key.split("::");
            return figma.loadFontAsync({ family, style });
          })
        );
        if (uniqueFonts.length > MAX_FONTS_PER_BATCH) {
          const loadedSet = new Set(toLoad);
          const processItems = [];
          const deferredItems = [];
          let fontIdx = 0;
          for (const p of items) {
            try {
              const style = yield resolveAnyStyle(p.id);
              if (style.type === "TEXT") {
                if (loadedSet.has(fontKeys[fontIdx])) processItems.push(p);
                else deferredItems.push(p);
                fontIdx++;
              } else {
                processItems.push(p);
              }
            } catch (e) {
              processItems.push(p);
            }
          }
          const deferredFonts = uniqueFonts.slice(MAX_FONTS_PER_BATCH).map((k) => k.replace("::", " "));
          const result = yield batchHandler(__spreadProps(__spreadValues({}, params), { items: processItems }), patchStyleSingle);
          result.deferred = `${deferredItems.length} text style(s) using fonts [${deferredFonts.join(", ")}] were NOT updated to avoid timeout. Call styles(method: "update") again with those items.`;
          return result;
        }
      }
      return batchHandler(params, patchStyleSingle);
    });
  }
  var figmaHandlers16 = {
    styles: createDispatcher({
      create: (p) => {
        switch (p.type) {
          case "paint":
            return batchHandler(p, createPaintStyleSingle);
          case "text":
            return createTextStyleBatch(p);
          case "effect":
            return batchHandler(p, createEffectStyleSingle);
          default:
            throw new Error(`create requires type: "paint", "text", or "effect"`);
        }
      },
      get: (p) => getStyleByIdFigma(p),
      list: (p) => listStylesFigma(p),
      update: (p) => patchStylesBatch(p),
      delete: (p) => batchHandler(p, removeStyleSingle)
    })
  };

  // src/handlers/variables.ts
  function findCollectionById(id) {
    return __async(this, null, function* () {
      const direct = yield figma.variables.getVariableCollectionByIdAsync(id);
      if (direct) return direct;
      const all = yield figma.variables.getLocalVariableCollectionsAsync();
      return all.find((c) => c.id === id) || null;
    });
  }
  function serializeCollection(c) {
    return { id: c.id, name: c.name, modes: c.modes, defaultModeId: c.defaultModeId, variableIds: c.variableIds };
  }
  function serializeVariable(v) {
    return {
      id: v.id,
      name: v.name,
      resolvedType: v.resolvedType,
      variableCollectionId: v.variableCollectionId,
      valuesByMode: v.valuesByMode,
      description: v.description,
      scopes: v.scopes
    };
  }
  function createCollectionSingle(p) {
    return __async(this, null, function* () {
      const collection = figma.variables.createVariableCollection(p.name);
      return { id: collection.id, modes: collection.modes, defaultModeId: collection.defaultModeId };
    });
  }
  function getCollectionFigma(params) {
    return __async(this, null, function* () {
      const c = yield findCollectionById(params.id);
      if (!c) throw new Error(`Collection not found: ${params.id}`);
      return serializeCollection(c);
    });
  }
  function listCollectionsFigma(params) {
    return __async(this, null, function* () {
      const collections = yield figma.variables.getLocalVariableCollectionsAsync();
      const paged = paginate(collections, params.offset, params.limit);
      const fields = params.fields;
      const items = paged.items.map((c) => {
        const full = serializeCollection(c);
        if (!(fields == null ? void 0 : fields.length)) return pickFields2(full, []);
        return pickFields2(full, fields);
      });
      return __spreadProps(__spreadValues({}, paged), { items });
    });
  }
  function deleteCollectionSingle(p) {
    return __async(this, null, function* () {
      const c = yield findCollectionById(p.id);
      if (!c) throw new Error(`Collection not found: ${p.id}`);
      c.remove();
      return {};
    });
  }
  function addModeSingle(p) {
    return __async(this, null, function* () {
      const c = yield findCollectionById(p.collectionId);
      if (!c) throw new Error(`Collection not found: ${p.collectionId}`);
      const modeId = c.addMode(p.name);
      return { modeId };
    });
  }
  function renameModeSingle(p) {
    return __async(this, null, function* () {
      const c = yield findCollectionById(p.collectionId);
      if (!c) throw new Error(`Collection not found: ${p.collectionId}`);
      c.renameMode(p.modeId, p.name);
      return {};
    });
  }
  function removeModeSingle(p) {
    return __async(this, null, function* () {
      const c = yield findCollectionById(p.collectionId);
      if (!c) throw new Error(`Collection not found: ${p.collectionId}`);
      c.removeMode(p.modeId);
      return {};
    });
  }
  function createVariableSingle(p) {
    return __async(this, null, function* () {
      const collection = yield findCollectionById(p.collectionId);
      if (!collection) throw new Error(`Collection not found: ${p.collectionId}`);
      const variable = figma.variables.createVariable(p.name, collection, p.resolvedType);
      return { id: variable.id };
    });
  }
  function getVariableFigma(params) {
    return __async(this, null, function* () {
      const v = yield findVariableById(params.id);
      if (!v) throw new Error(`Variable not found: ${params.id}`);
      return serializeVariable(v);
    });
  }
  function listVariablesFigma(params) {
    return __async(this, null, function* () {
      let variables = (params == null ? void 0 : params.type) ? yield figma.variables.getLocalVariablesAsync(params.type) : yield figma.variables.getLocalVariablesAsync();
      if (params == null ? void 0 : params.collectionId) variables = variables.filter((v) => v.variableCollectionId === params.collectionId);
      const paged = paginate(variables, params.offset, params.limit);
      const fields = params.fields;
      const items = paged.items.map((v) => {
        const full = serializeVariable(v);
        if (!(fields == null ? void 0 : fields.length)) return pickFields2(full, []);
        return pickFields2(full, fields);
      });
      return __spreadProps(__spreadValues({}, paged), { items });
    });
  }
  function updateVariableSingle(p) {
    return __async(this, null, function* () {
      var _a;
      const variable = yield findVariableById(p.id);
      if (!variable) throw new Error(`Variable not found: ${p.id}`);
      let value = p.value;
      if (typeof value === "object" && value !== null && "r" in value) {
        value = { r: value.r, g: value.g, b: value.b, a: (_a = value.a) != null ? _a : 1 };
      }
      variable.setValueForMode(p.modeId, value);
      return {};
    });
  }
  function setBindingSingle(p) {
    return __async(this, null, function* () {
      const node = yield figma.getNodeByIdAsync(p.nodeId);
      if (!node) throw new Error(`Node not found: ${p.nodeId}`);
      const variable = yield findVariableById(p.variableId);
      if (!variable) throw new Error(`Variable not found: ${p.variableId}`);
      const paintMatch = p.field.match(/^(fills|strokes)\/(\d+)\/color$/);
      if (paintMatch) {
        const prop = paintMatch[1];
        const index = parseInt(paintMatch[2], 10);
        if (!(prop in node)) throw new Error(`Node does not have ${prop}`);
        const paints = node[prop].slice();
        if (index >= paints.length) throw new Error(`${prop} index ${index} out of range`);
        const newPaint = figma.variables.setBoundVariableForPaint(paints[index], "color", variable);
        paints[index] = newPaint;
        node[prop] = paints;
      } else if ("setBoundVariable" in node) {
        node.setBoundVariable(p.field, variable);
      } else {
        throw new Error("Node does not support variable binding");
      }
      return {};
    });
  }
  function setExplicitModeSingle(p) {
    return __async(this, null, function* () {
      const node = yield figma.getNodeByIdAsync(p.nodeId);
      if (!node) throw new Error(`Node not found: ${p.nodeId}`);
      if (!("setExplicitVariableModeForCollection" in node)) throw new Error(`Node ${p.nodeId} (${node.type}) does not support explicit variable modes. Use a FRAME, COMPONENT, or COMPONENT_SET.`);
      const collection = yield findCollectionById(p.collectionId);
      if (!collection) throw new Error(`Collection not found: ${p.collectionId}`);
      try {
        node.setExplicitVariableModeForCollection(collection, p.modeId);
      } catch (e) {
        throw new Error(`Failed to set mode '${p.modeId}' on node ${p.nodeId}: ${e.message}. Ensure the modeId is valid for collection '${collection.name}'.`);
      }
      return {};
    });
  }
  function getNodeVariablesFigma(params) {
    return __async(this, null, function* () {
      const node = yield figma.getNodeByIdAsync(params.nodeId);
      if (!node) throw new Error(`Node not found: ${params.nodeId}`);
      const result = { nodeId: params.nodeId };
      if ("boundVariables" in node) {
        const bv = node.boundVariables;
        if (bv && typeof bv === "object") {
          const bindings = {};
          for (const [key, val] of Object.entries(bv)) {
            if (Array.isArray(val)) {
              bindings[key] = val.map((v) => (v == null ? void 0 : v.id) ? { variableId: v.id, field: v.field } : v);
            } else if (val && typeof val === "object" && val.id) {
              bindings[key] = { variableId: val.id, field: val.field };
            }
          }
          result.boundVariables = bindings;
        }
      }
      if ("explicitVariableModes" in node) {
        result.explicitVariableModes = node.explicitVariableModes;
      }
      return result;
    });
  }
  var figmaHandlers17 = {
    variable_collections: createDispatcher({
      create: (p) => batchHandler(p, createCollectionSingle),
      get: getCollectionFigma,
      list: listCollectionsFigma,
      delete: (p) => batchHandler(p, deleteCollectionSingle),
      add_mode: (p) => batchHandler(p, addModeSingle),
      rename_mode: (p) => batchHandler(p, renameModeSingle),
      remove_mode: (p) => batchHandler(p, removeModeSingle)
    }),
    variables: createDispatcher({
      create: (p) => batchHandler(p, createVariableSingle),
      get: getVariableFigma,
      list: listVariablesFigma,
      update: (p) => batchHandler(p, updateVariableSingle)
    }),
    set_variable_binding: (p) => batchHandler(p, setBindingSingle),
    set_explicit_variable_mode: (p) => batchHandler(p, setExplicitModeSingle),
    get_node_variables: getNodeVariablesFigma
  };

  // src/handlers/lint.ts
  init_color();
  var WCAG_RULES = [
    "wcag-contrast",
    "wcag-contrast-enhanced",
    "wcag-non-text-contrast",
    "wcag-target-size",
    "wcag-text-size",
    "wcag-line-height"
  ];
  function lintNodeHandler(params) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d;
      const ruleSet = new Set((params == null ? void 0 : params.rules) || ["all"]);
      const runAll = ruleSet.has("all");
      if (ruleSet.has("wcag") || runAll) {
        for (const r of WCAG_RULES) ruleSet.add(r);
      }
      const runWcag = WCAG_RULES.some((r) => ruleSet.has(r));
      const maxDepth = (_a = params == null ? void 0 : params.maxDepth) != null ? _a : 10;
      const maxFindings = (_b = params == null ? void 0 : params.maxFindings) != null ? _b : 50;
      let root;
      if (params == null ? void 0 : params.nodeId) {
        const node = yield figma.getNodeByIdAsync(params.nodeId);
        if (!node) throw new Error(`Node not found: ${params.nodeId}`);
        root = node;
      } else {
        const sel = figma.currentPage.selection;
        if (sel.length === 0) throw new Error("Nothing selected and no nodeId provided");
        root = sel.length === 1 ? sel[0] : figma.currentPage;
      }
      let localPaintStyleIds = /* @__PURE__ */ new Set();
      let localTextStyleIds = /* @__PURE__ */ new Set();
      let paintStyleEntries = [];
      let colorVarEntries = [];
      if (runAll || ruleSet.has("hardcoded-color")) {
        const paints = yield figma.getLocalPaintStylesAsync();
        localPaintStyleIds = new Set(paints.map((s) => s.id));
        for (const style of paints) {
          if (style.paints.length === 1 && style.paints[0].type === "SOLID") {
            const p = style.paints[0];
            paintStyleEntries.push({ name: style.name, id: style.id, r: p.color.r, g: p.color.g, b: p.color.b, a: (_c = p.opacity) != null ? _c : 1 });
          }
        }
        const colorVars = yield figma.variables.getLocalVariablesAsync("COLOR");
        const collections = yield figma.variables.getLocalVariableCollectionsAsync();
        const defaultModes = new Map(collections.map((c) => [c.id, c.defaultModeId]));
        for (const v of colorVars) {
          const modeId = defaultModes.get(v.variableCollectionId);
          if (!modeId) continue;
          const val = v.valuesByMode[modeId];
          if (!val || typeof val !== "object" || "type" in val) continue;
          const c = val;
          colorVarEntries.push({ name: v.name, id: v.id, r: c.r, g: c.g, b: c.b, a: (_d = c.a) != null ? _d : 1 });
        }
      }
      if (runAll || ruleSet.has("no-text-style")) {
        const texts = yield figma.getLocalTextStylesAsync();
        localTextStyleIds = new Set(texts.map((s) => s.id));
      }
      const issues = [];
      const ctx = { runAll, ruleSet, maxDepth, maxFindings, localPaintStyleIds, localTextStyleIds, hasPaintStyles: localPaintStyleIds.size > 0, hasTextStyles: localTextStyleIds.size > 0, hasColorVars: colorVarEntries.length > 0, paintStyleEntries, colorVarEntries, runWcag };
      yield walkNode(root, 0, issues, ctx);
      const truncated = issues.length >= maxFindings;
      const grouped = {};
      for (const issue of issues) {
        if (!grouped[issue.rule]) grouped[issue.rule] = [];
        grouped[issue.rule].push(issue);
      }
      const categories = [];
      for (const [rule, ruleIssues] of Object.entries(grouped)) {
        categories.push({
          rule,
          count: ruleIssues.length,
          fix: FIX_INSTRUCTIONS[rule] || "Review and fix manually.",
          nodes: ruleIssues.map((i) => {
            const entry = { id: i.nodeId, name: i.nodeName };
            if (i.extra) Object.assign(entry, i.extra);
            return entry;
          })
        });
      }
      const result = { nodeId: root.id, nodeName: root.name, categories };
      if (truncated) {
        const breakdown = categories.map((c) => `${c.rule}: ${c.count}`).join(", ");
        result.warning = `Showing first ${maxFindings} findings (${breakdown}). Increase maxFindings or lint specific rules (e.g. rules: ["hardcoded-color"]) to see more.`;
      }
      return result;
    });
  }
  var FIX_INSTRUCTIONS = {
    "no-autolayout": "Use lint_fix_autolayout or update_frame with layoutMode to add auto-layout to these frames.",
    "shape-instead-of-frame": "Delete the shape, create_frame with the same position/size/fill, then insert_child to re-parent overlapping siblings into the new frame.",
    "hardcoded-color": "Check each node's 'matchName' for a suggested style or variable. For fills: use set_fill_color with styleName, or set_variable_binding with field 'fills/0/color'. For strokes: use set_stroke_color with styleName, or set_variable_binding with field 'strokes/0/color'.",
    "no-text-style": "Use patch_nodes with text.textStyleName to apply a text style, or set_variable_binding to bind text properties to variables.",
    "fixed-in-autolayout": "Use update_frame with layoutSizingHorizontal/layoutSizingVertical to set FILL or HUG instead of FIXED sizing.",
    "default-name": "Use set_node_properties to give descriptive names.",
    "empty-container": "These frames or components have auto-layout but no children. Delete them or add content.",
    "stale-text-name": "These text nodes have layer names that don't match their content. Use set_node_properties to rename, or leave if intentional.",
    "no-text-property": 'Use components(method: "update") to create a TEXT property on the component set, then set_node_properties with componentPropertyReferences: {characters: "PropertyKey#id"} to bind.',
    // -- WCAG fix instructions --
    "wcag-contrast": "Adjust fill or background to meet AA (4.5:1, 3:1 large text).",
    "wcag-contrast-enhanced": "Adjust to meet AAA (7:1, 4.5:1 large text).",
    "wcag-non-text-contrast": "Need 3:1 against parent background. Adjust via set_fill_color.",
    "wcag-target-size": "Resize to 24x24px min via resize_node or add padding.",
    "wcag-text-size": "Increase to 12px min via set_text_properties.",
    "wcag-line-height": "Increase line height to 1.5x font size."
  };
  function walkNode(node, depth, issues, ctx) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d;
      if (issues.length >= ctx.maxFindings) return;
      if (depth > ctx.maxDepth) return;
      if (ctx.runAll || ctx.ruleSet.has("no-autolayout")) {
        if (isFrame(node) && node.layoutMode === "NONE" && "children" in node) {
          const childCount = node.children.length;
          if (childCount > 1) {
            const direction = detectLayoutDirection(node);
            issues.push({ rule: "no-autolayout", nodeId: node.id, nodeName: node.name, extra: { suggestedDirection: direction } });
            if (issues.length >= ctx.maxFindings) return;
          }
        }
      }
      if (ctx.runAll || ctx.ruleSet.has("shape-instead-of-frame")) {
        if (isShape(node) && node.parent && "children" in node.parent) {
          const siblings = node.parent.children;
          const bounds = getAbsoluteBounds(node);
          if (bounds) {
            const overlapping = siblings.filter((s) => {
              if (s.id === node.id) return false;
              const sb = getAbsoluteBounds(s);
              if (!sb) return false;
              return sb.x >= bounds.x && sb.y >= bounds.y && sb.x + sb.width <= bounds.x + bounds.width && sb.y + sb.height <= bounds.y + bounds.height;
            });
            if (overlapping.length > 0) {
              issues.push({ rule: "shape-instead-of-frame", nodeId: node.id, nodeName: node.name, extra: { overlappingIds: overlapping.map((s) => s.id) } });
              if (issues.length >= ctx.maxFindings) return;
            }
          }
        }
      }
      if ((ctx.runAll || ctx.ruleSet.has("hardcoded-color")) && (ctx.hasPaintStyles || ctx.hasColorVars)) {
        const checkPaints = (paints, styleId, hasBoundVar, property) => {
          var _a2;
          if (!paints || !Array.isArray(paints) || paints.length === 0 || paints[0].type !== "SOLID") return;
          if (hasBoundVar) return;
          if (styleId && styleId !== "" && styleId !== figma.mixed) return;
          const color = paints[0].color;
          const opacity = (_a2 = paints[0].opacity) != null ? _a2 : 1;
          const hex = rgbaToHex({ r: color.r, g: color.g, b: color.b, a: opacity });
          const match = findColorMatch(color.r, color.g, color.b, opacity, ctx);
          const extra = { hex, property };
          if (match) {
            extra.matchType = match.type;
            extra.matchName = match.name;
            extra.matchId = match.id;
          }
          issues.push({ rule: "hardcoded-color", nodeId: node.id, nodeName: node.name, extra });
        };
        if ("fills" in node && "fillStyleId" in node) {
          checkPaints(node.fills, node.fillStyleId, ((_b = (_a = node.boundVariables) == null ? void 0 : _a.fills) == null ? void 0 : _b.length) > 0, "fill");
          if (issues.length >= ctx.maxFindings) return;
        }
        if ("strokes" in node && "strokeStyleId" in node) {
          checkPaints(node.strokes, node.strokeStyleId, ((_d = (_c = node.boundVariables) == null ? void 0 : _c.strokes) == null ? void 0 : _d.length) > 0, "stroke");
          if (issues.length >= ctx.maxFindings) return;
        }
      }
      if ((ctx.runAll || ctx.ruleSet.has("no-text-style")) && ctx.hasTextStyles) {
        if (node.type === "TEXT") {
          const textStyleId = node.textStyleId;
          const hasTextVar = node.boundVariables && Object.keys(node.boundVariables).length > 0;
          if (!hasTextVar && (!textStyleId || textStyleId === "" || textStyleId === figma.mixed)) {
            issues.push({ rule: "no-text-style", nodeId: node.id, nodeName: node.name });
            if (issues.length >= ctx.maxFindings) return;
          }
        }
      }
      if (ctx.runAll || ctx.ruleSet.has("fixed-in-autolayout")) {
        if (isFrame(node) && node.layoutMode !== "NONE" && "children" in node) {
          for (const child of node.children) {
            if (issues.length >= ctx.maxFindings) break;
            if (!("layoutSizingHorizontal" in child)) continue;
            if (child.layoutSizingHorizontal === "FIXED" && child.layoutSizingVertical === "FIXED") {
              issues.push({ rule: "fixed-in-autolayout", nodeId: child.id, nodeName: child.name, extra: { parentId: node.id, axis: node.layoutMode === "HORIZONTAL" ? "horizontal" : "vertical" } });
            }
          }
          if (issues.length >= ctx.maxFindings) return;
        }
      }
      if (ctx.runAll || ctx.ruleSet.has("default-name")) {
        const defaultNames = ["Frame", "Rectangle", "Ellipse", "Line", "Text", "Group", "Component", "Instance", "Section", "Vector"];
        const isDefault = defaultNames.some((d) => node.name === d || /^.+ \d+$/.test(node.name) && node.name.startsWith(d));
        if (isDefault && node.type !== "PAGE") {
          issues.push({ rule: "default-name", nodeId: node.id, nodeName: node.name });
          if (issues.length >= ctx.maxFindings) return;
        }
      }
      if (ctx.runAll || ctx.ruleSet.has("empty-container")) {
        if (isFrame(node) && "children" in node && node.children.length === 0) {
          issues.push({ rule: "empty-container", nodeId: node.id, nodeName: node.name });
          if (issues.length >= ctx.maxFindings) return;
        }
      }
      if (ctx.runAll || ctx.ruleSet.has("stale-text-name")) {
        if (node.type === "TEXT") {
          const chars = node.characters;
          if (chars && node.name && node.name !== chars && node.name !== chars.slice(0, node.name.length)) {
            issues.push({ rule: "stale-text-name", nodeId: node.id, nodeName: node.name, extra: { characters: chars.slice(0, 60) } });
            if (issues.length >= ctx.maxFindings) return;
          }
        }
      }
      if (ctx.runAll || ctx.ruleSet.has("no-text-property")) {
        if (node.type === "TEXT" && isInsideComponent(node)) {
          const refs = node.componentPropertyReferences;
          if (!refs || !refs.characters) {
            issues.push({ rule: "no-text-property", nodeId: node.id, nodeName: node.name });
            if (issues.length >= ctx.maxFindings) return;
          }
        }
      }
      if (ctx.runWcag && (ctx.ruleSet.has("wcag-contrast") || ctx.ruleSet.has("wcag-contrast-enhanced"))) {
        if (node.type === "TEXT") {
          const textNode = node;
          const fontSize = textNode.fontSize;
          const fontName = textNode.fontName;
          if (fontSize !== figma.mixed && fontName !== figma.mixed) {
            const fgColor = getTextFillColor(textNode);
            if (fgColor) {
              const bgColor = resolveBackgroundColor(node);
              if (bgColor !== null) {
                const nodeOpacity = getEffectiveOpacity(node);
                const effectiveAlpha = fgColor.a * nodeOpacity;
                const composited = alphaComposite(
                  fgColor.r,
                  fgColor.g,
                  fgColor.b,
                  effectiveAlpha,
                  bgColor.r,
                  bgColor.g,
                  bgColor.b
                );
                const fontWeight = inferFontWeight(fontName.style);
                const large = isLargeText(fontSize, fontWeight);
                const result = checkContrastPair(composited, bgColor, large);
                const fgHex = rgbaToHex(__spreadProps(__spreadValues({}, fgColor), { a: effectiveAlpha }));
                const bgHex = rgbaToHex({ r: bgColor.r, g: bgColor.g, b: bgColor.b, a: 1 });
                if (ctx.ruleSet.has("wcag-contrast") && !result.passesAA) {
                  issues.push({
                    rule: "wcag-contrast",
                    nodeId: node.id,
                    nodeName: node.name,
                    extra: {
                      ratio: result.ratio,
                      required: result.aaRequired,
                      level: "AA",
                      foreground: fgHex,
                      background: bgHex,
                      fontSize,
                      fontWeight,
                      isLargeText: large
                    }
                  });
                  if (issues.length >= ctx.maxFindings) return;
                }
                if (ctx.ruleSet.has("wcag-contrast-enhanced") && result.passesAA && !result.passesAAA) {
                  issues.push({
                    rule: "wcag-contrast-enhanced",
                    nodeId: node.id,
                    nodeName: node.name,
                    extra: {
                      ratio: result.ratio,
                      required: result.aaaRequired,
                      level: "AAA",
                      foreground: fgHex,
                      background: bgHex,
                      fontSize,
                      fontWeight,
                      isLargeText: large
                    }
                  });
                  if (issues.length >= ctx.maxFindings) return;
                }
              }
            }
          }
        }
      }
      if (ctx.runWcag && ctx.ruleSet.has("wcag-non-text-contrast")) {
        if (node.type !== "TEXT" && node.type !== "PAGE" && "fills" in node) {
          const nodeFill = getNodeFillColor(node);
          if (nodeFill && node.parent) {
            const parentFill = resolveBackgroundColor(node);
            if (parentFill !== null) {
              const result = checkContrastPair(nodeFill, parentFill);
              if (result.ratio < 3) {
                const nodeHex = rgbaToHex(__spreadProps(__spreadValues({}, nodeFill), { a: 1 }));
                const parentHex = rgbaToHex({ r: parentFill.r, g: parentFill.g, b: parentFill.b, a: 1 });
                issues.push({
                  rule: "wcag-non-text-contrast",
                  nodeId: node.id,
                  nodeName: node.name,
                  extra: {
                    ratio: result.ratio,
                    required: 3,
                    level: "AA",
                    fill: nodeHex,
                    background: parentHex
                  }
                });
                if (issues.length >= ctx.maxFindings) return;
              }
            }
          }
        }
      }
      if (ctx.runWcag && ctx.ruleSet.has("wcag-target-size")) {
        if (looksInteractive(node) && "width" in node && "height" in node) {
          const w = node.width;
          const h = node.height;
          const MIN_TARGET = 24;
          if (w < MIN_TARGET || h < MIN_TARGET) {
            issues.push({
              rule: "wcag-target-size",
              nodeId: node.id,
              nodeName: node.name,
              extra: {
                width: Math.round(w * 100) / 100,
                height: Math.round(h * 100) / 100,
                minimumRequired: MIN_TARGET,
                failingDimension: w < MIN_TARGET && h < MIN_TARGET ? "both" : w < MIN_TARGET ? "width" : "height"
              }
            });
            if (issues.length >= ctx.maxFindings) return;
          }
        }
      }
      if (ctx.runWcag && ctx.ruleSet.has("wcag-text-size")) {
        if (node.type === "TEXT") {
          const fontSize = node.fontSize;
          if (fontSize !== figma.mixed && typeof fontSize === "number" && fontSize < 12) {
            issues.push({
              rule: "wcag-text-size",
              nodeId: node.id,
              nodeName: node.name,
              extra: { fontSize, minimumRecommended: 12 }
            });
            if (issues.length >= ctx.maxFindings) return;
          }
        }
      }
      if (ctx.runWcag && ctx.ruleSet.has("wcag-line-height")) {
        if (node.type === "TEXT") {
          const textNode = node;
          const fontSize = textNode.fontSize;
          const lineHeight = textNode.lineHeight;
          if (fontSize !== figma.mixed && lineHeight !== figma.mixed) {
            const fs = fontSize;
            const lh = lineHeight;
            let lineHeightPx = null;
            if (lh.unit === "PIXELS") {
              lineHeightPx = lh.value;
            } else if (lh.unit === "PERCENT") {
              lineHeightPx = lh.value / 100 * fs;
            }
            if (lineHeightPx !== null) {
              const ratio = lineHeightPx / fs;
              const REQUIRED_RATIO = 1.5;
              if (ratio < REQUIRED_RATIO) {
                issues.push({
                  rule: "wcag-line-height",
                  nodeId: node.id,
                  nodeName: node.name,
                  extra: {
                    lineHeightPx: Math.round(lineHeightPx * 100) / 100,
                    fontSize: fs,
                    ratio: Math.round(ratio * 100) / 100,
                    requiredRatio: REQUIRED_RATIO,
                    recommendedLineHeight: Math.ceil(fs * REQUIRED_RATIO)
                  }
                });
                if (issues.length >= ctx.maxFindings) return;
              }
            }
          }
        }
      }
      if ("children" in node) {
        for (const child of node.children) {
          if (issues.length >= ctx.maxFindings) break;
          yield walkNode(child, depth + 1, issues, ctx);
        }
      }
    });
  }
  function findColorMatch(r, g, b, a, ctx) {
    const eps = 0.02;
    for (const e of ctx.paintStyleEntries) {
      if (Math.abs(e.r - r) < eps && Math.abs(e.g - g) < eps && Math.abs(e.b - b) < eps && Math.abs(e.a - a) < eps)
        return { type: "style", name: e.name, id: e.id };
    }
    for (const e of ctx.colorVarEntries) {
      if (Math.abs(e.r - r) < eps && Math.abs(e.g - g) < eps && Math.abs(e.b - b) < eps && Math.abs(e.a - a) < eps)
        return { type: "variable", name: e.name, id: e.id };
    }
    return null;
  }
  function isFrame(node) {
    return node.type === "FRAME" || node.type === "COMPONENT" || node.type === "COMPONENT_SET";
  }
  function isInsideComponent(node) {
    let p = node.parent;
    while (p) {
      if (p.type === "COMPONENT" || p.type === "COMPONENT_SET") return true;
      p = p.parent;
    }
    return false;
  }
  var SHAPE_TYPES = /* @__PURE__ */ new Set(["RECTANGLE", "ELLIPSE", "POLYGON", "STAR", "VECTOR", "LINE"]);
  function isShape(node) {
    return SHAPE_TYPES.has(node.type);
  }
  function getAbsoluteBounds(node) {
    if ("absoluteBoundingBox" in node && node.absoluteBoundingBox) {
      return node.absoluteBoundingBox;
    }
    if ("x" in node && "width" in node) {
      return { x: node.x, y: node.y, width: node.width, height: node.height };
    }
    return null;
  }
  function detectLayoutDirection(frame) {
    const children = frame.children;
    if (children.length < 2) return "VERTICAL";
    let xVariance = 0;
    let yVariance = 0;
    for (let i = 1; i < children.length; i++) {
      xVariance += Math.abs(children[i].x - children[i - 1].x);
      yVariance += Math.abs(children[i].y - children[i - 1].y);
    }
    return yVariance >= xVariance ? "VERTICAL" : "HORIZONTAL";
  }
  function getTextFillColor(node) {
    var _a;
    const fills = node.fills;
    if (fills === figma.mixed) return null;
    if (!Array.isArray(fills) || fills.length === 0) return null;
    for (let i = fills.length - 1; i >= 0; i--) {
      const fill = fills[i];
      if (fill.visible === false) continue;
      if (fill.type !== "SOLID") return null;
      return { r: fill.color.r, g: fill.color.g, b: fill.color.b, a: (_a = fill.opacity) != null ? _a : 1 };
    }
    return null;
  }
  function getNodeFillColor(node) {
    if (!("fills" in node)) return null;
    const fills = node.fills;
    if (fills === figma.mixed || !Array.isArray(fills)) return null;
    for (let i = fills.length - 1; i >= 0; i--) {
      const fill = fills[i];
      if (fill.visible === false) continue;
      if (fill.type !== "SOLID") return null;
      return { r: fill.color.r, g: fill.color.g, b: fill.color.b };
    }
    return null;
  }
  function resolveBackgroundColor(node) {
    var _a, _b;
    let bgR = 1, bgG = 1, bgB = 1;
    const ancestors = [];
    let current = node.parent;
    while (current) {
      ancestors.push(current);
      current = current.parent;
    }
    ancestors.reverse();
    for (const ancestor of ancestors) {
      if (!("fills" in ancestor)) continue;
      const fills = ancestor.fills;
      if (fills === figma.mixed || !Array.isArray(fills)) continue;
      for (const fill of fills) {
        if (fill.visible === false) continue;
        if (fill.type === "SOLID") {
          const fillOpacity = (_a = fill.opacity) != null ? _a : 1;
          const nodeOpacity = "opacity" in ancestor ? (_b = ancestor.opacity) != null ? _b : 1 : 1;
          const effectiveAlpha = fillOpacity * nodeOpacity;
          if (effectiveAlpha >= 0.999) {
            bgR = fill.color.r;
            bgG = fill.color.g;
            bgB = fill.color.b;
          } else {
            const c = alphaComposite(fill.color.r, fill.color.g, fill.color.b, effectiveAlpha, bgR, bgG, bgB);
            bgR = c.r;
            bgG = c.g;
            bgB = c.b;
          }
        } else if (fill.type !== "SOLID") {
          return null;
        }
      }
    }
    return { r: bgR, g: bgG, b: bgB };
  }
  function getEffectiveOpacity(node) {
    var _a;
    let opacity = 1;
    let current = node;
    while (current) {
      if ("opacity" in current) {
        opacity *= (_a = current.opacity) != null ? _a : 1;
      }
      current = current.parent;
    }
    return opacity;
  }
  function fixAutolayoutSingle(p) {
    return __async(this, null, function* () {
      const node = yield figma.getNodeByIdAsync(p.nodeId);
      if (!node) throw new Error(`Node not found: ${p.nodeId}`);
      if (!isFrame(node)) throw new Error(`Node ${p.nodeId} is ${node.type}, not a FRAME`);
      if (node.layoutMode !== "NONE") return { skipped: true, reason: "Already has auto-layout" };
      const direction = p.layoutMode || detectLayoutDirection(node);
      node.layoutMode = direction;
      if (p.itemSpacing !== void 0) {
        node.itemSpacing = p.itemSpacing;
      }
      return { layoutMode: direction };
    });
  }
  var figmaHandlers18 = {
    lint_node: lintNodeHandler,
    lint_fix_autolayout: (p) => batchHandler(p, fixAutolayoutSingle)
  };

  // src/handlers/registry.ts
  var allFigmaHandlers = __spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues({}, figmaHandlers), figmaHandlers2), figmaHandlers3), figmaHandlers4), figmaHandlers5), figmaHandlers6), figmaHandlers7), figmaHandlers8), figmaHandlers13), figmaHandlers9), figmaHandlers11), figmaHandlers10), figmaHandlers12), figmaHandlers14), figmaHandlers15), figmaHandlers16), figmaHandlers17), figmaHandlers18);

  // src/plugin/code.ts
  var state = {
    serverPort: 3055,
    channelName: "",
    locale: ""
  };
  figma.showUI(__html__, { width: 350, height: 600 });
  figma.clientStorage.getAsync("settings").then((saved) => {
    if (saved) {
      if (saved.serverPort) state.serverPort = saved.serverPort;
      if (saved.channelName) state.channelName = saved.channelName;
      if (saved.locale) state.locale = saved.locale;
    }
    figma.ui.postMessage({ type: "restore-settings", serverPort: state.serverPort, channelName: state.channelName, locale: state.locale || "en" });
  });
  var SKIP_FOCUS = /* @__PURE__ */ new Set([
    "join",
    "set_selection",
    "set_viewport",
    "zoom_into_view",
    "set_focus",
    "set_current_page",
    "create_page",
    "rename_page",
    "delete_node",
    "get_document_info",
    "get_current_page",
    "get_pages",
    "get_selection",
    "get_node_info",
    "get_available_fonts",
    "variable_collections",
    "variables",
    "search_nodes",
    "scan_text_nodes",
    "export_node_as_image",
    "lint_node",
    "get_node_variables",
    "ping"
  ]);
  function extractNodeIds(result, params) {
    const ids = [];
    if ((result == null ? void 0 : result.id) && typeof result.id === "string") ids.push(result.id);
    if (Array.isArray(result == null ? void 0 : result.results)) {
      for (const r of result.results) {
        if ((r == null ? void 0 : r.id) && typeof r.id === "string") ids.push(r.id);
      }
    }
    if (ids.length === 0 && Array.isArray(params == null ? void 0 : params.items)) {
      for (const item of params.items) {
        if ((item == null ? void 0 : item.nodeId) && typeof item.nodeId === "string") ids.push(item.nodeId);
      }
    }
    return ids;
  }
  function autoFocus(nodeIds) {
    return __async(this, null, function* () {
      const nodes = [];
      for (const id of nodeIds) {
        const node = yield figma.getNodeByIdAsync(id);
        if (node && "x" in node) nodes.push(node);
      }
      if (nodes.length > 0) {
        figma.currentPage.selection = nodes;
        figma.viewport.scrollAndZoomIntoView(nodes);
      }
    });
  }
  var pendingAutoFocus = null;
  figma.ui.onmessage = (msg) => __async(null, null, function* () {
    switch (msg.type) {
      case "update-settings":
        updateSettings(msg);
        break;
      case "notify":
        figma.notify(msg.message);
        break;
      case "close-plugin":
        figma.closePlugin();
        break;
      case "execute-command":
        try {
          if (pendingAutoFocus) {
            yield pendingAutoFocus;
            pendingAutoFocus = null;
          }
          const result = yield handleCommand(msg.command, msg.params);
          figma.ui.postMessage({
            type: "command-result",
            id: msg.id,
            result
          });
          if (!SKIP_FOCUS.has(msg.command)) {
            const ids = extractNodeIds(result, msg.params);
            if (ids.length > 0) {
              pendingAutoFocus = autoFocus(ids).catch(() => {
              });
            }
          }
        } catch (error) {
          figma.ui.postMessage({
            type: "command-error",
            id: msg.id,
            error: error.message || "Error executing command"
          });
        }
        break;
    }
  });
  figma.on("run", ({ command }) => {
    figma.ui.postMessage({ type: "auto-connect" });
  });
  function updateSettings(settings) {
    if (settings.serverPort) {
      state.serverPort = settings.serverPort;
    }
    if (settings.channelName !== void 0) {
      state.channelName = settings.channelName;
    }
    if (settings.locale) {
      state.locale = settings.locale;
    }
    figma.clientStorage.setAsync("settings", {
      serverPort: state.serverPort,
      channelName: state.channelName,
      locale: state.locale
    });
  }
  function handleCommand(command, params) {
    return __async(this, null, function* () {
      const handler = allFigmaHandlers[command];
      if (!handler) throw new Error(`Unknown command: ${command}`);
      yield figma.currentPage.loadAsync();
      return yield handler(params);
    });
  }
})();
