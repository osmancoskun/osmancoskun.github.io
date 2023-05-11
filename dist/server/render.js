var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { createLogger } from "consolite";
import { createSequenceHooksCollection, createGuardsCollection, createPipelineCollection } from "hookar";
function noop() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return /* @__PURE__ */ Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function get_store_value(store) {
  let value;
  subscribe(store, (_) => value = _)();
  return value;
}
function compute_rest_props(props, keys) {
  const rest = {};
  keys = new Set(keys);
  for (const k in props)
    if (!keys.has(k) && k[0] !== "$")
      rest[k] = props[k];
  return rest;
}
let current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function onDestroy(fn) {
  get_current_component().$$.on_destroy.push(fn);
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
  return context;
}
function getContext(key) {
  return get_current_component().$$.context.get(key);
}
const _boolean_attributes = [
  "allowfullscreen",
  "allowpaymentrequest",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "inert",
  "ismap",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected"
];
const boolean_attributes = /* @__PURE__ */ new Set([..._boolean_attributes]);
const invalid_attribute_name_character = /[\s'">/=\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;
function spread(args, attrs_to_add) {
  const attributes = Object.assign({}, ...args);
  if (attrs_to_add) {
    const classes_to_add = attrs_to_add.classes;
    const styles_to_add = attrs_to_add.styles;
    if (classes_to_add) {
      if (attributes.class == null) {
        attributes.class = classes_to_add;
      } else {
        attributes.class += " " + classes_to_add;
      }
    }
    if (styles_to_add) {
      if (attributes.style == null) {
        attributes.style = style_object_to_string(styles_to_add);
      } else {
        attributes.style = style_object_to_string(merge_ssr_styles(attributes.style, styles_to_add));
      }
    }
  }
  let str = "";
  Object.keys(attributes).forEach((name) => {
    if (invalid_attribute_name_character.test(name))
      return;
    const value = attributes[name];
    if (value === true)
      str += " " + name;
    else if (boolean_attributes.has(name.toLowerCase())) {
      if (value)
        str += " " + name;
    } else if (value != null) {
      str += ` ${name}="${value}"`;
    }
  });
  return str;
}
function merge_ssr_styles(style_attribute, style_directive) {
  const style_object = {};
  for (const individual_style of style_attribute.split(";")) {
    const colon_index = individual_style.indexOf(":");
    const name = individual_style.slice(0, colon_index).trim();
    const value = individual_style.slice(colon_index + 1).trim();
    if (!name)
      continue;
    style_object[name] = value;
  }
  for (const name in style_directive) {
    const value = style_directive[name];
    if (value) {
      style_object[name] = value;
    } else {
      delete style_object[name];
    }
  }
  return style_object;
}
const ATTR_REGEX = /[&"]/g;
const CONTENT_REGEX = /[&<]/g;
function escape(value, is_attr = false) {
  const str = String(value);
  const pattern = is_attr ? ATTR_REGEX : CONTENT_REGEX;
  pattern.lastIndex = 0;
  let escaped = "";
  let last = 0;
  while (pattern.test(str)) {
    const i = pattern.lastIndex - 1;
    const ch = str[i];
    escaped += str.substring(last, i) + (ch === "&" ? "&amp;" : ch === '"' ? "&quot;" : "&lt;");
    last = i + 1;
  }
  return escaped + str.substring(last);
}
function escape_attribute_value(value) {
  const should_escape = typeof value === "string" || value && typeof value === "object";
  return should_escape ? escape(value, true) : value;
}
function escape_object(obj) {
  const result = {};
  for (const key in obj) {
    result[key] = escape_attribute_value(obj[key]);
  }
  return result;
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
const missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules. Otherwise you may need to fix a <${name}>.`);
  }
  return component;
}
let on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(context || (parent_component ? parent_component.$$.context : [])),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = /* @__PURE__ */ new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: /* @__PURE__ */ new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css) => css.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  const assignment = boolean && value === true ? "" : `="${escape(value, true)}"`;
  return ` ${name}${assignment}`;
}
function style_object_to_string(style_object) {
  return Object.keys(style_object).filter((key) => style_object[key]).map((key) => `${key}: ${escape_attribute_value(style_object[key])};`).join(" ");
}
const routes = {
  "meta": {},
  "id": "_default",
  "_regex": {},
  "_paramKeys": {},
  "file": {
    "path": "src/routes",
    "dir": "src",
    "base": "routes",
    "ext": "",
    "name": "routes"
  },
  "rootName": "default",
  "routifyDir": import.meta.url,
  "children": [
    {
      "meta": {},
      "id": "_default_hello_world_md",
      "_regex": {},
      "_paramKeys": {},
      "name": "hello-world",
      "file": {
        "path": "src/routes/hello-world.md",
        "dir": "src/routes",
        "base": "hello-world.md",
        "ext": ".md",
        "name": "hello-world"
      },
      "asyncModule": () => Promise.resolve().then(() => helloWorld),
      "children": []
    },
    {
      "meta": {},
      "id": "_default_index_svelte",
      "_regex": {},
      "_paramKeys": {},
      "name": "index",
      "file": {
        "path": "src/routes/index.svelte",
        "dir": "src/routes",
        "base": "index.svelte",
        "ext": ".svelte",
        "name": "index"
      },
      "asyncModule": () => Promise.resolve().then(() => index),
      "children": []
    },
    {
      "meta": {
        "dynamic": true,
        "dynamicSpread": true
      },
      "_regex": {},
      "_paramKeys": {},
      "name": "[...404]",
      "file": {
        "path": ".routify/components/[...404].svelte",
        "dir": ".routify/components",
        "base": "[...404].svelte",
        "ext": ".svelte",
        "name": "[...404]"
      },
      "asyncModule": () => Promise.resolve().then(() => ____404_),
      "children": []
    }
  ]
};
const subscriber_queue = [];
function readable(value, start) {
  return {
    subscribe: writable(value, start).subscribe
  };
}
function writable(value, start = noop) {
  let stop;
  const subscribers = /* @__PURE__ */ new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0 && stop) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
function derived(stores, fn, initial_value) {
  const single = !Array.isArray(stores);
  const stores_array = single ? [stores] : stores;
  const auto = fn.length < 2;
  return readable(initial_value, (set) => {
    let started = false;
    const values = [];
    let pending = 0;
    let cleanup = noop;
    const sync = () => {
      if (pending) {
        return;
      }
      cleanup();
      const result = fn(single ? values[0] : values, set);
      if (auto) {
        set(result);
      } else {
        cleanup = is_function(result) ? result : noop;
      }
    };
    const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
      values[i] = value;
      pending &= ~(1 << i);
      if (started) {
        sync();
      }
    }, () => {
      pending |= 1 << i;
    }));
    started = true;
    sync();
    return function stop() {
      run_all(unsubscribers);
      cleanup();
      started = false;
    };
  });
}
const uriDecodeStringOrArray = (strOrArr) => strOrArr instanceof Array ? strOrArr.map(decodeURI) : decodeURI(strOrArr);
const URIDecodeObject = (obj) => Object.entries(obj).reduce(
  (_return, [key, value]) => ({
    ..._return,
    [key]: uriDecodeStringOrArray(value)
  }),
  {}
);
class LoadCache {
  constructor() {
    this.map = /* @__PURE__ */ new Map();
  }
  async fetch(id, options) {
    if (!this.map.has(id))
      this.map.set(id, options.hydrate());
    this._handlePromise(id, options);
    return this.map.get(id);
  }
  async _handlePromise(id, options) {
    var _a;
    const value = await this.map.get(id);
    const clear = (_a = options.clear) == null ? void 0 : _a.call(options, value);
    if (typeof clear === "number")
      setTimeout(() => this.map.delete(id), clear);
    else if (clear)
      this.map.delete(id);
  }
}
class RouteFragment {
  constructor(route, node, urlFragment = "", params = {}) {
    __publicField(this, "_params", {});
    this.route = route;
    this.node = node;
    this.load = void 0;
    this.urlFragment = urlFragment;
    this.params = params;
    this.renderContext = writable();
    Object.defineProperty(this, "route", { enumerable: false });
  }
  get index() {
    return this.route.fragments.indexOf(this);
  }
  get params() {
    return URIDecodeObject(this._params);
  }
  set params(params) {
    this._params = params;
  }
}
const URL_STATES = ["pushState", "replaceState", "popState"];
const loadCache = new LoadCache();
class Route {
  constructor(router2, url, mode, state = {}) {
    __publicField(this, "allFragments", []);
    __publicField(this, "load", {
      status: 200,
      error: null,
      maxage: null,
      props: {},
      redirect: null
    });
    const [, hash] = url.match(/#(.+)/) || [];
    this.router = router2;
    this.url = url;
    this.mode = mode;
    this.state = state;
    this.hash = hash;
    this.state.createdAt = new Date();
    if (!router2.rootNode) {
      this.router.log.error("Can't navigate without a rootNode");
      const err = new Error("Can't navigate without a rootNode");
      Object.assign(err, { routify: { router: router2 } });
      throw err;
    }
    if (!URL_STATES.includes(mode))
      throw new Error("url.mode must be pushState, replaceState or popState");
    this.allFragments = this._createFragments();
  }
  get fragments() {
    return this.router.transformFragments.run(this.allFragments);
  }
  get params() {
    const match = this.url.match(/\?.+/);
    const query = match && match[0] || "";
    return Object.assign(
      {},
      ...this.allFragments.map((fragment) => fragment.params),
      this.router.queryHandler.parse(query, this)
    );
  }
  get leaf() {
    return [...this.allFragments].pop();
  }
  get isPendingOrPrefetch() {
    return this === this.router.pendingRoute.get() || this.state.prefetch;
  }
  async loadRoute() {
    const pipeline = [
      this.runBeforeUrlChangeHooks,
      this.loadComponents,
      this.runPreloads
    ];
    for (const pretask of pipeline) {
      const passedPreTask = await pretask.bind(this)();
      if (!this.isPendingOrPrefetch || !passedPreTask)
        return false;
    }
    return true;
  }
  async loadComponents() {
    const nodes = this.fragments.map((fragment) => fragment.node);
    const multiNodes = nodes.map((node) => node.children.find((node2) => node2.name === "_decorator")).filter(Boolean);
    await Promise.all([...nodes, ...multiNodes].map((node) => node.loadModule()));
    return true;
  }
  async runPreloads() {
    var _a;
    const prevRoute = this.router.activeRoute.get();
    for (const [index2, fragment] of this.fragments.entries()) {
      if (!this.isPendingOrPrefetch)
        return false;
      const prevFragmentInSpot = prevRoute == null ? void 0 : prevRoute.fragments[index2];
      const isSameBranch = fragment.node === (prevFragmentInSpot == null ? void 0 : prevFragmentInSpot.node);
      const ctx = {
        route: this,
        prevRoute,
        isNew: !isSameBranch,
        fetch
      };
      if ((_a = fragment.node.module) == null ? void 0 : _a.load) {
        const cacheId = JSON.stringify([this.params, fragment.node.id]);
        const load2 = await loadCache.fetch(cacheId, {
          hydrate: () => fragment.node.module.load(ctx),
          clear: (res) => (res == null ? void 0 : res.expire) || !this.state.prefetch
        });
        fragment.load = {
          ...isSameBranch && prevFragmentInSpot.load,
          ...load2
        };
        Object.assign(this.load, fragment.load);
        if (this.load.redirect)
          return this.router.url.replace(this.load.redirect, {
            redirectedBy: this
          });
      }
    }
    return this;
  }
  async runBeforeUrlChangeHooks() {
    return await this.router.beforeUrlChange.run({ route: this });
  }
  get meta() {
    return this.allFragments.reduce(
      (acc, curr) => ({ ...acc, ...curr.node.meta }),
      {}
    );
  }
  createFragment(node, urlFragment = "", params = {}) {
    return new RouteFragment(this, node, urlFragment, params);
  }
  _createFragments() {
    const url = this.url.replace(/[#?].+/, "");
    const rootNode = this.router.rootNode;
    const nodeChain = this.router.rootNode.getChainTo(url, {
      rootNode,
      allowDynamic: true,
      includeIndex: true
    });
    const fragments = nodeChain.map(
      (nc) => this.createFragment(nc.node, nc.fragment, nc.params)
    );
    return fragments;
  }
}
createLogger("[rf3]");
const createBrowserAdapter = (opts) => {
  const delimiter = (opts == null ? void 0 : opts.delimiter) || ";";
  return {
    toRouter: (url, router2) => {
      const formatRE = router2.name ? `${router2.name}=(.+?)` : `(.+?)`;
      const RE = new RegExp(`(^|${delimiter})${formatRE}(${delimiter}|$)`);
      const matches = url.match(RE);
      return matches ? matches[2] : "/";
    },
    toBrowser: (routers) => routers.map((r) => (r.name ? `${r.name}=` : "") + r.url.external()).join(delimiter)
  };
};
class AppInstance {
  constructor() {
    __publicField(this, "instances", []);
    __publicField(this, "browserAdapter", createBrowserAdapter());
    __publicField(this, "urlFromBrowser", (router2) => {
      return this.browserAdapter.toRouter(urlFromAddress(), router2);
    });
    globalThis["__routify"] = this;
  }
  get routers() {
    return [].concat(...this.instances.map((instance) => instance.routers));
  }
  register(instance) {
    this.instances.push(instance);
    return this;
  }
}
const appInstance = new AppInstance();
const shouldIgnoreClick = (event) => event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || event.button || event.key && event.key !== "Enter" || event.defaultPrevented;
const getUrlFromEvent = (event) => {
  const el = event.target.closest("a");
  const href = el && el.href;
  if (!href || el.target || el.host !== location.host)
    return;
  const url = new URL(href);
  const relativeUrl = url.pathname + url.search + url.hash;
  event.preventDefault();
  return relativeUrl;
};
const fromEntries = (iterable) => {
  return [...iterable].reduce((obj, [key, val]) => {
    obj[key] = val;
    return obj;
  }, {});
};
const urlFromAddress = () => (({ pathname, search, hash }) => pathname + search + hash)(window.location);
const getContextMaybe = (name) => {
  try {
    return getContext(name);
  } catch (err) {
  }
};
const getable = (value, start) => {
  const store = writable(value, start);
  return Object.assign(store, { get: () => get_store_value(store) });
};
const identicalRoutes = (...routes2) => routes2.map((route) => JSON.stringify([route == null ? void 0 : route.allFragments, route == null ? void 0 : route.url])).reduce((prev, curr) => prev === curr && curr);
const isAnonFn = (input) => typeof input === "function" && !input.prototype;
const resolveIfAnonFn = (subject, params) => isAnonFn(subject) ? subject(...params) : subject;
const pushToOrReplace = (arr, input) => {
  const _isAnonFn = isAnonFn(input);
  input = _isAnonFn || Array.isArray(input) ? input : [input];
  const res = _isAnonFn ? input([...arr]) : [...arr, ...input];
  if (!Array.isArray(res))
    throw new Error("anonymous callback did not return array");
  return res;
};
const waitFor = (store, cb) => new Promise((resolve, reject) => {
  try {
    const unsub = store.subscribe((val) => {
      if (cb(val)) {
        resolve(val);
        setTimeout(() => unsub);
      }
    });
  } catch (err) {
    reject(err);
  }
});
class BaseReflector {
  constructor(router2) {
    this.router = router2;
    this.log = this.router.log;
  }
  install() {
  }
  uninstall() {
  }
  reflect() {
  }
}
class RNode {
  constructor(name, module2, instance) {
    __publicField(this, "parent");
    __publicField(this, "meta", {});
    __publicField(this, "id");
    __publicField(this, "_regex", {});
    __publicField(this, "_paramKeys", {});
    this.instance = instance;
    this.name = name;
    instance.nodeIndex.push(this);
    this.module = module2;
    Object.defineProperty(this, "instance", { enumerable: false });
    Object.defineProperty(this, "parent", { enumerable: false });
  }
  appendChild(child) {
    if (child.instance)
      child.parent = this;
  }
  createChild(name, module2) {
    const node = this.instance.createNode(name, module2);
    this.appendChild(node);
    return node;
  }
  get descendants() {
    return this.instance.nodeIndex.filter(
      (node) => node.ancestors.find((n) => n === this)
    );
  }
  remove() {
    const { nodeIndex } = this.instance;
    const index2 = nodeIndex.findIndex((node) => node === this);
    nodeIndex.splice(index2, 1);
  }
  get ancestors() {
    let node = this;
    const ancestors = [];
    while (node = node.parent)
      ancestors.push(node);
    return ancestors;
  }
  get root() {
    let node = this;
    while (node.parent)
      node = node.parent;
    return node;
  }
  get isRoot() {
    return this === this.root;
  }
  get children() {
    return this.instance.nodeIndex.filter((node) => node.parent === this);
  }
  get level() {
    var _a;
    return (((_a = this.parent) == null ? void 0 : _a.level) || 0) + 1;
  }
  get regex() {
    const { name } = this;
    if (!this._regex[name])
      this._regex[name] = this.instance.utils.getRegexFromName(this.name);
    return this._regex[name];
  }
  set regex(value) {
    this._regex[this.name] = new RegExp(value);
  }
  get paramKeys() {
    const { name } = this;
    if (!this._paramKeys[name])
      this._paramKeys[name] = this.instance.utils.getFieldsFromName(this.name);
    return this._paramKeys[name];
  }
  getParams(urlFragment) {
    if (urlFragment.match(/^\.+$/))
      return {};
    const values = this.instance.utils.getValuesFromPath(this.regex, urlFragment);
    return this.instance.utils.mapFieldsWithValues(this.paramKeys, values);
  }
  traverse(path, allowDynamic = false, includeIndex = false, silent = false) {
    var _a;
    const isNamed = !path.startsWith("/") && !path.startsWith(".");
    return isNamed ? this.root.instance.nodeIndex.find((node) => node.meta.name === path) : (_a = this.getChainTo(path, { allowDynamic, includeIndex, silent })) == null ? void 0 : _a.pop().node;
  }
  getChainTo(path, options) {
    options = {
      ...{ allowDynamic: true, includeIndex: true },
      ...options
    };
    const originNode = path.startsWith("/") ? options.rootNode || this.root : this;
    const stepsToLeaf = path.split("/").filter((snip) => snip !== ".").filter(Boolean);
    let currentNodeStep = {
      node: originNode,
      stepsToLeaf,
      params: {},
      fragment: ""
    };
    const nodeSteps = [currentNodeStep];
    let inStaticDeadEnd = false;
    let inDynamicDeadEnd = false;
    while (currentNodeStep.stepsToLeaf.length) {
      const [nextStep, ...restSteps] = currentNodeStep.stepsToLeaf;
      const nextNode = nextStep === ".." ? currentNodeStep.node.parent : !inStaticDeadEnd && currentNodeStep.node.children.find(
        (node) => node.name === nextStep
      ) || options.allowDynamic && !inDynamicDeadEnd && currentNodeStep.node.children.filter(({ meta }) => meta.dynamic && !meta.dynamicSpread).find((node) => node.regex.test(nextStep)) || options.allowDynamic && currentNodeStep.node.children.find(
        (node) => node.meta.dynamicSpread
      );
      if (nextNode) {
        const nodeStep = {
          node: nextNode,
          params: nextNode.meta.dynamicSpread ? [nextStep] : nextNode.meta.dynamic ? nextNode.getParams(nextStep) : {},
          stepsToLeaf: restSteps,
          fragment: nextStep
        };
        currentNodeStep = nodeStep;
        nodeSteps.push(nodeStep);
      } else if (!options.allowDynamic && options.silent)
        return null;
      else if (!options.allowDynamic && !options.silent)
        throw new Error(
          `${nodeSteps.map((ns) => ns.node.name || "root").join("/")} could not travel to ${nextStep}`
        );
      else if (currentNodeStep.node.meta.dynamicSpread) {
        currentNodeStep.params.push(nextStep);
        currentNodeStep.fragment += `/${nextStep}`;
        currentNodeStep.stepsToLeaf.shift();
        inDynamicDeadEnd = false;
        inStaticDeadEnd = false;
      } else {
        nodeSteps.pop();
        currentNodeStep = [...nodeSteps].pop();
        inDynamicDeadEnd = inStaticDeadEnd;
        inStaticDeadEnd = true;
        if (!currentNodeStep && options.silent)
          return null;
        else if (!currentNodeStep && !options.silent)
          throw new Error(`Could not find path "${path}" from ${this.name}`);
      }
    }
    try {
      const indexNode = options.includeIndex && currentNodeStep.node.traverse("./index");
      if (indexNode)
        nodeSteps.push({
          node: indexNode,
          stepsToLeaf: [],
          params: {},
          fragment: ""
        });
    } catch (err) {
    }
    nodeSteps.forEach((ns) => {
      ns.params = Array.isArray(ns.params) ? { [ns.node.name.replace(/\[\.\.\.(.+)\]/, "$1")]: ns.params } : ns.params;
    });
    return nodeSteps;
  }
  toJSON() {
    return {
      ...this,
      children: [...this.children]
    };
  }
  get path() {
    return "/" + [this, ...this.ancestors].reverse().map((node) => node.name).filter(Boolean).join("/");
  }
}
const CTX = "routify-fragment-context";
const Node = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  var _a;
  let { node } = $$props;
  let { passthrough } = $$props;
  const context = { ...getContext(CTX), node };
  setContext(CTX, context);
  let Component = (_a = node.module) == null ? void 0 : _a.default;
  if (!Component && node.asyncModule)
    node.asyncModule().then((r) => Component = r.default);
  if ($$props.node === void 0 && $$bindings.node && node !== void 0)
    $$bindings.node(node);
  if ($$props.passthrough === void 0 && $$bindings.passthrough && passthrough !== void 0)
    $$bindings.passthrough(passthrough);
  return `${Component ? `${validate_component(Component || missing_component, "svelte:component").$$render($$result, Object.assign({}, passthrough, { context }), {}, {
    default: () => {
      return `${slots.default ? slots.default({}) : ``}`;
    }
  })}` : `${slots.default ? slots.default({}) : ``}`}`;
});
class RNodeRuntime extends RNode {
  constructor(name, module2, instance, asyncModule) {
    super(name, module2, instance);
    __publicField(this, "asyncModule");
    __publicField(this, "importTree", (snapshotRoot) => {
      const queue = [[this, snapshotRoot]];
      while (queue.length) {
        const [node, snapshot] = queue.pop();
        const { children, ...nodeSnapshot } = snapshot;
        Object.assign(node, nodeSnapshot);
        for (const childSnapshot of children) {
          const childNode = node.createChild(
            snapshot.name || snapshot.rootName || ""
          );
          queue.push([childNode, childSnapshot]);
        }
      }
      return this;
    });
    this.module = module2;
    this.asyncModule = asyncModule;
  }
  get children() {
    return this.instance.nodeIndex.filter((node) => node.parent === this).sort((prev, curr) => (prev.meta.order || 0) - (curr.meta.order || 0));
  }
  get pages() {
    return this.pagesWithIndex.filter((node) => node.name !== "index");
  }
  get pagesWithIndex() {
    return this.children.filter((node) => !node.meta.fallback).filter((node) => !node.name.startsWith("_")).filter((node) => !node.name.includes("[")).filter((node) => {
      var _a;
      return !(((_a = node.meta) == null ? void 0 : _a.order) === false);
    });
  }
  get hasComponent() {
    return !!(this.module || this.asyncModule);
  }
  async getRawComponent() {
    const module2 = await this.loadModule();
    return module2 == null ? void 0 : module2.default;
  }
  async loadModule() {
    if (!this.module && this.asyncModule) {
      this.module = await this.asyncModule();
    }
    return this.module;
  }
  get component() {
    const node = this;
    return function(options) {
      options.props = {
        ...options.props,
        passthrough: options.props,
        node
      };
      return new Node({ ...options });
    };
  }
  get _fallback() {
    var _a;
    return this.children.find((node) => node.meta.fallback) || ((_a = this.parent) == null ? void 0 : _a._fallback);
  }
}
const defaultRe = /\[(.+?)\]/gm;
class UrlParamUtils {
  constructor(RE = defaultRe) {
    __publicField(this, "getFieldsFromName", (name) => [...name.matchAll(this.RE)].map((v) => v[1]));
    __publicField(this, "getRegexFromName", (name) => new RegExp("^" + name.replace(this.RE, "(.+)") + "$"));
    __publicField(this, "getValuesFromPath", (re, path) => (path.match(re) || []).slice(1));
    __publicField(this, "mapFieldsWithValues", (fields, values) => this.haveEqualLength(fields, values) && fields.reduce((map, field, index2) => {
      map[field] = values[index2];
      return map;
    }, {}));
    __publicField(this, "haveEqualLength", (fields, values) => {
      if (fields.length !== values.length)
        throw new Error(
          `fields and values should be of same length
fields: ${JSON.stringify(fields)}
values: ${JSON.stringify(values)}`
        );
      return true;
    });
    this.RE = RE;
  }
}
class Routify {
  constructor() {
    __publicField(this, "NodeConstructor");
    __publicField(this, "NodeType");
    __publicField(this, "nodeIndex", []);
    __publicField(this, "rootNodes", {});
    __publicField(this, "utils", new UrlParamUtils());
  }
  createNode(name, module2) {
    return new this.NodeConstructor(name, module2, this);
  }
}
class RoutifyRuntime extends Routify {
  constructor(options) {
    super();
    __publicField(this, "NodeConstructor", RNodeRuntime);
    __publicField(this, "mode", "runtime");
    __publicField(this, "routers", []);
    __publicField(this, "rootNodes", {});
    this.options = options;
    if (options.routes) {
      this.rootNodes[options.routes.rootName || "unnamed"] = this.createNode(
        options.routes.rootName
      ).importTree(options.routes);
    }
    this.global = appInstance.register(this);
    Object.defineProperty(this, "routers", { enumerable: false });
    this.log = this.global.log;
  }
}
class AddressReflector extends BaseReflector {
  constructor(router2) {
    super(router2);
    __publicField(this, "reflect", () => {
      const { mode } = get_store_value(this.router.activeRoute);
      if (mode === "popState")
        return false;
      const { routers, browserAdapter } = this.router.instance.global;
      const addressRouters = routers.filter(
        (router2) => router2.urlReflector instanceof this.constructor
      );
      const url = browserAdapter.toBrowser(addressRouters);
      history[`${mode}Native`]({}, "", url);
    });
    const { instance, urlRewrites } = router2;
    const { urlFromBrowser, browserAdapter } = instance.global;
    if (!history["onPushstate"]) {
      polyfillHistory();
    }
    const createStateEventHandler = (method) => {
      return function(data, title, url) {
        var _a, _b;
        const routerName = (_b = (_a = data == null ? void 0 : data.routify) == null ? void 0 : _a.router) != null ? _b : false;
        if (routerName === false)
          url = browserAdapter.toRouter(url, router2);
        else if (routerName !== router2.name)
          return false;
        for (const rewrite of urlRewrites)
          url = rewrite.toInternal(url, { router: router2 });
        router2.url[method](url);
      };
    };
    this.absorb = () => router2.url.replace(urlFromBrowser(router2));
    this._pushstateHandler = createStateEventHandler("push");
    this._replacestateHandler = createStateEventHandler("replace");
    this._popstateHandler = () => router2.url.pop(urlFromBrowser(router2));
  }
  install() {
    this.hooks = [
      history["onPushstate"](this._pushstateHandler),
      history["onReplacestate"](this._replacestateHandler),
      history["onPopstate"](this._popstateHandler)
    ];
    if (!get_store_value(this.router.activeRoute))
      this.absorb();
    else
      this.reflect();
  }
  uninstall() {
    this.hooks.forEach((unreg) => unreg());
    setTimeout(() => this.reflect());
  }
}
function polyfillHistory() {
  const hooks = {
    onPushstate: createSequenceHooksCollection(),
    onReplacestate: createSequenceHooksCollection(),
    onPopstate: createSequenceHooksCollection()
  };
  Object.assign(history, hooks);
  const { pushState, replaceState } = history;
  history["pushStateNative"] = pushState;
  history["replaceStateNative"] = replaceState;
  history.pushState = hooks.onPushstate.run;
  history.replaceState = hooks.onReplacestate.run;
  window.addEventListener("popstate", hooks.onPopstate.run);
  return true;
}
class InternalReflector extends BaseReflector {
  install() {
    this.router.url.replace("/");
  }
}
const parseModuleName = (str) => {
  const matches = str.match(/^(.+?)(\+)?$/);
  const [, name, prepend] = matches;
  return { name, prepend };
};
const handlers = {
  boolean(route, bool, fragment) {
    const index2 = fragment.index;
    return handlers.number(route, index2, fragment);
  },
  number(route, num, fragment) {
    const index2 = fragment.index;
    const start = index2 - num;
    route.allFragments.splice(start, num);
  },
  string(route, str, fragment) {
    const selfIndex = fragment.index;
    const precedingFragments = route.allFragments.slice(0, selfIndex + 1);
    let nextFragment;
    const { name, prepend } = parseModuleName(str);
    while (precedingFragments.length) {
      nextFragment = precedingFragments.pop();
      const matchingSiblingNode = nextFragment.node.children.find(
        (node) => node.meta.moduleName === name
      );
      if (matchingSiblingNode) {
        if (!prepend)
          route.allFragments.splice(0, fragment.index);
        route.allFragments.unshift(route.createFragment(matchingSiblingNode));
        precedingFragments.splice(0);
      }
    }
  }
};
const handleFragment = (route) => (fragment) => {
  const { reset: reset2 } = fragment.node.meta;
  if (reset2)
    handlers[typeof reset2](route, reset2, fragment);
};
const reset = () => {
  return {
    beforeUrlChange: ({ route }) => {
      const fragments = [...route.allFragments];
      fragments.forEach(handleFragment(route));
      return true;
    }
  };
};
const next = (store, wanted, strict) => new Promise((resolve) => {
  let unsub;
  unsub = store.subscribe((value) => {
    if (!unsub)
      return;
    if (typeof wanted === "undefined" || value === wanted || value == wanted && !strict || typeof wanted === "function" && wanted(value)) {
      resolve(value);
    }
  });
});
const normalizeRouterOptions = (options, config) => {
  config = config || {
    name: "",
    beforeRouterInit: [],
    afterRouterInit: [],
    urlRewrite: [],
    beforeUrlChange: [],
    afterUrlChange: [],
    transformFragments: [],
    onDestroy: []
  };
  const { plugins, ...optionsOnly } = options;
  const optionsGroups = [...plugins || [], optionsOnly];
  optionsGroups.forEach((pluginOptions) => {
    var _a;
    (_a = pluginOptions.plugins) == null ? void 0 : _a.forEach((plugin) => normalizeRouterOptions(plugin, config));
    delete pluginOptions.plugins;
    Object.entries(pluginOptions).forEach(([field, value]) => {
      if (Array.isArray(config[field]))
        config[field].push(...[value].flat().filter(Boolean));
      else
        config[field] = value || config[field];
    });
  });
  return config;
};
const stripNullFields = (obj) => Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
const defaultPlugins = [reset()];
class Router {
  constructor(input) {
    __publicField(this, "pendingRoute", getable(null));
    __publicField(this, "activeRoute", getable(null));
    __publicField(this, "_urlReflector", null);
    __publicField(this, "urlRewrites", []);
    __publicField(this, "beforeRouterInit", createSequenceHooksCollection());
    __publicField(this, "afterRouterInit", createSequenceHooksCollection());
    __publicField(this, "beforeUrlChange", createGuardsCollection());
    __publicField(this, "afterUrlChange", createSequenceHooksCollection());
    __publicField(this, "transformFragments", createPipelineCollection());
    __publicField(this, "onDestroy", createSequenceHooksCollection());
    __publicField(this, "parentElem", null);
    __publicField(this, "queryHandler", {
      parse: (search, route) => fromEntries(new URLSearchParams(search)),
      stringify: (params, route) => {
        const query = new URLSearchParams(params).toString();
        return query ? `?${query}` : "";
      }
    });
    __publicField(this, "clickHandler", {});
    __publicField(this, "url", {
      internal: () => this.url.getPending() || this.url.getActive(),
      external: () => this.getExternalUrl(),
      getActive: () => {
        var _a;
        return (_a = get_store_value(this.activeRoute)) == null ? void 0 : _a.url;
      },
      getPending: () => {
        var _a;
        return (_a = get_store_value(this.pendingRoute)) == null ? void 0 : _a.url;
      },
      toString: () => this.url.internal(),
      set: this._setUrl.bind(this),
      push: (url, state = {}) => this._setUrl(url, "pushState", false, state),
      replace: (url, state = {}) => this._setUrl(url, "replaceState", false, state),
      pop: (url, state = {}) => this._setUrl(url, "popState", false, state)
    });
    __publicField(this, "ready", async () => !this.pendingRoute.get() && this.activeRoute.get() || next(this.activeRoute, (x) => !!x));
    __publicField(this, "history", []);
    __publicField(this, "setParentElem", (elem) => {
      this.parentElem = elem;
    });
    __publicField(this, "getExternalUrl", (url) => {
      const result = this.urlRewrites.reduce(
        (_url, rewrite) => rewrite.toExternal(_url, { router: this }),
        url || this.url.internal()
      );
      return result;
    });
    __publicField(this, "getInternalUrl", (url) => this.urlRewrites.reduce(
      (_url, rewrite) => rewrite.toInternal(_url, { router: this }),
      url
    ));
    const { subscribe: subscribe2, set } = writable(this);
    this.subscribe = subscribe2;
    this.triggerStore = () => set(this);
    const oldRouter = appInstance.routers.find((r) => r.name == (input.name || ""));
    if (oldRouter)
      return oldRouter;
    else {
      input.plugins = [...input.plugins || [], ...defaultPlugins].filter(Boolean);
      this.init(input);
      this.params = derived(this.activeRoute, ($activeRoute) => $activeRoute.params);
      this.afterUrlChange(() => setTimeout(() => this._urlReflector.reflect()));
      this.activeRoute.get = () => get_store_value(this.activeRoute);
      this.pendingRoute.get = () => get_store_value(this.pendingRoute);
    }
  }
  init(input) {
    const firstInit = !this.options;
    input = stripNullFields(input);
    this.options = normalizeRouterOptions({ ...this.options, ...input });
    let {
      instance,
      rootNode,
      name,
      routes: routes2,
      urlRewrite,
      urlReflector,
      url,
      passthrough,
      beforeUrlChange,
      afterUrlChange,
      transformFragments,
      onDestroy: onDestroy2,
      beforeRouterInit,
      afterRouterInit,
      queryHandler,
      clickHandler
    } = this.options;
    if (queryHandler)
      this.queryHandler = queryHandler;
    if (clickHandler)
      this.clickHandler = clickHandler;
    beforeUrlChange.forEach(this.beforeUrlChange);
    transformFragments.forEach(this.transformFragments);
    afterUrlChange.forEach(this.afterUrlChange);
    onDestroy2.forEach(this.onDestroy);
    beforeRouterInit.forEach(this.beforeRouterInit);
    afterRouterInit.forEach(this.afterRouterInit);
    this.beforeRouterInit.run({ router: this, firstInit });
    const parentCmpCtx = getContextMaybe("routify-fragment-context");
    this.instance = instance || this.instance || (parentCmpCtx == null ? void 0 : parentCmpCtx.route.router.instance) || appInstance.instances[0] || new RoutifyRuntime({});
    this.name = name;
    this.urlRewrites = urlRewrite;
    if (passthrough && !(passthrough instanceof Router))
      passthrough = (parentCmpCtx == null ? void 0 : parentCmpCtx.route.router) || passthrough;
    this.passthrough = passthrough || this.passthrough;
    appInstance.instances.forEach((inst) => {
      const index2 = inst.routers.indexOf(this);
      if (index2 !== -1)
        inst.routers.splice(index2, 1);
    });
    this.instance.routers.push(this);
    if (routes2 && !this.rootNode)
      this.importRoutes(routes2);
    this.parentCmpCtx = parentCmpCtx;
    this.rootNode = rootNode || this.rootNode || this.instance.rootNodes.default;
    if (this.url.getActive()) {
      this._setUrl(this.url.getActive(), "pushState", true);
    }
    const shouldInstallUrlReflector = !this.urlReflector || urlReflector && !(this.urlReflector instanceof urlReflector);
    if (shouldInstallUrlReflector) {
      urlReflector = urlReflector || (typeof window != "undefined" ? AddressReflector : InternalReflector);
      this.setUrlReflector(urlReflector);
    }
    if (url)
      this.url.replace(url);
    this.triggerStore();
    this.afterRouterInit.run({ router: this, firstInit });
  }
  importRoutes(routes2) {
    this.rootNode = this.instance.createNode().importTree(routes2);
    this.instance.rootNodes[routes2.rootName || "unnamed"] = this.rootNode;
  }
  async _setUrl(url, mode, isInternal, state = {}) {
    if (!isInternal)
      url = this.getInternalUrl(url);
    url = url || "/";
    url = url.replace(/(.+)\/+([#?]|$)/, "$1$2");
    if (!url.startsWith("/"))
      url = url.replace(new URL(url).origin, "");
    const currentRoute = this.pendingRoute.get() || this.activeRoute.get();
    const route = new Route(this, url, mode, state);
    const loadRoutePromise = route.loadRoute();
    if (state.prefetch)
      return;
    if (identicalRoutes(currentRoute, route)) {
      return false;
    } else {
      this.pendingRoute.set(route);
      const didLoadRoute = await loadRoutePromise;
      if (this.pendingRoute.get() === route)
        this.pendingRoute.set(null);
      if (didLoadRoute)
        this.setActiveRoute(route);
      await new Promise((resolve) => setTimeout(resolve));
      return true;
    }
  }
  setActiveRoute(route) {
    const $activeRoute = this.activeRoute.get();
    if ($activeRoute)
      this.history.push($activeRoute);
    this.activeRoute.set(route);
    this.afterUrlChange.run({
      route,
      history: [...this.history].reverse()
    });
  }
  destroy() {
    this.instance.routers = this.instance.routers.filter((router2) => router2 !== this);
    this.onDestroy.run({ router: this });
  }
  get urlReflector() {
    return this._urlReflector;
  }
  setUrlReflector(UrlReflector) {
    var _a;
    (_a = this._urlReflector) == null ? void 0 : _a.uninstall();
    this._urlReflector = new UrlReflector(this);
    this._urlReflector.install();
    this.triggerStore();
  }
}
const createRouter = (options) => new Router(options);
const DecoratorWrapper = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { decorators = null } = $$props;
  let { isRoot = true } = $$props;
  let { context } = $$props;
  decorators = decorators || context.decorators;
  let [decorator, ...restOfDecorators] = [...decorators];
  while (decorator && !(decorator == null ? void 0 : decorator.shouldRender({ context, isRoot, decorators })))
    [decorator, ...restOfDecorators] = [...restOfDecorators];
  if (isRoot)
    onDestroy(() => context.onDestroy.run());
  if ($$props.decorators === void 0 && $$bindings.decorators && decorators !== void 0)
    $$bindings.decorators(decorators);
  if ($$props.isRoot === void 0 && $$bindings.isRoot && isRoot !== void 0)
    $$bindings.isRoot(isRoot);
  if ($$props.context === void 0 && $$bindings.context && context !== void 0)
    $$bindings.context(context);
  return `


${decorator ? `${validate_component(decorator.component || missing_component, "svelte:component").$$render($$result, { context, isRoot }, {}, {
    default: () => {
      return `${validate_component(DecoratorWrapper, "svelte:self").$$render(
        $$result,
        {
          decorators: restOfDecorators,
          context,
          isRoot: false
        },
        {},
        {
          default: () => {
            return `${slots.default ? slots.default({}) : ``}`;
          }
        }
      )}`;
    }
  })}` : `${slots.default ? slots.default({}) : ``}`}`;
});
const Noop = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { context = null } = $$props;
  let { Parent = null } = $$props;
  if ($$props.context === void 0 && $$bindings.context && context !== void 0)
    $$bindings.context(context);
  if ($$props.Parent === void 0 && $$bindings.Parent && Parent !== void 0)
    $$bindings.Parent(Parent);
  return `${slots.default ? slots.default({}) : ``}`;
});
const AnchorDecorator = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$restProps = compute_rest_props($$props, ["location", "onMount"]);
  let { location: location2 } = $$props;
  let { onMount = (x) => x } = $$props;
  let elem;
  if ($$props.location === void 0 && $$bindings.location && location2 !== void 0)
    $$bindings.location(location2);
  if ($$props.onMount === void 0 && $$bindings.onMount && onMount !== void 0)
    $$bindings.onMount(onMount);
  return `${location2 === "wrapper" ? `<div${spread([escape_object($$restProps)], {})}${add_attribute("this", elem, 0)}>${slots.default ? slots.default({}) : ``}</div>` : `${location2 === "header" ? `<div${spread([escape_object($$restProps)], {})}${add_attribute("this", elem, 0)}></div>
    ${slots.default ? slots.default({}) : ``}` : `${`<div${spread(
    [
      { "data-routify-anchor-locator": true },
      { class: "anchor" },
      escape_object($$restProps)
    ],
    {}
  )}${add_attribute("this", elem, 0)}></div>`}
    ${slots.default ? slots.default({}) : ``}
    `}`}`;
});
const RenderFragment = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  var _a;
  let params;
  let load2;
  let route;
  let compProps;
  let routifyContext;
  let $isVisible, $$unsubscribe_isVisible;
  let $childFragments, $$unsubscribe_childFragments;
  let { context } = $$props;
  let { props } = $$props;
  const { isVisible, childFragments } = context;
  $$unsubscribe_isVisible = subscribe(isVisible, (value) => $isVisible = value);
  $$unsubscribe_childFragments = subscribe(childFragments, (value) => $childFragments = value);
  let NodeComponent = ((_a = context.node.module) == null ? void 0 : _a.default) || context.node.asyncModule || Noop;
  setContext("routify-fragment-context", context);
  const updateRenderContext = (elem, newMeta) => {
    var _a2;
    elem["__routify_meta"] = {
      ...elem["__routify_meta"],
      renderContext: {
        ...(_a2 = elem["__routify_meta"]) == null ? void 0 : _a2.renderContext,
        ...newMeta
      }
    };
    return elem;
  };
  const initialize = (parent, anchor) => {
    context.elem.set({ anchor, parent });
    parent = updateRenderContext(parent, { parent: context });
    if (anchor)
      anchor = updateRenderContext(anchor, { anchor: context });
  };
  if ($$props.context === void 0 && $$bindings.context && context !== void 0)
    $$bindings.context(context);
  if ($$props.props === void 0 && $$bindings.props && props !== void 0)
    $$bindings.props(props);
  {
    if (isAnonFn(NodeComponent) && $isVisible)
      context.node.loadModule().then((r) => NodeComponent = r.default);
  }
  ({ params, load: load2, route } = context.fragment);
  compProps = { ...params, ...load2 == null ? void 0 : load2.props, ...props };
  routifyContext = { ...context, load: load2, route };
  $$unsubscribe_isVisible();
  $$unsubscribe_childFragments();
  return `${$isVisible && !isAnonFn(NodeComponent) ? `
    ${validate_component(AnchorDecorator, "AnchorDecorator").$$render(
    $$result,
    {
      location: context.anchorLocation,
      onMount: initialize,
      context
    },
    {},
    {
      default: () => {
        return `
        ${validate_component(DecoratorWrapper, "DecoratorWrapper").$$render($$result, { context }, {}, {
          default: () => {
            return `
            ${validate_component(NodeComponent || missing_component, "svelte:component").$$render($$result, Object.assign({}, compProps, { context: routifyContext }), {}, {
              default: ({ props: props2, inline, multi, decorator, anchor, options, scrollBoundary }) => {
                return `${$childFragments.length || inline && !(inline == null ? void 0 : inline.single) || multi && !(multi == null ? void 0 : multi.single) ? `
                    
                    ${validate_component(ComposeFragments, "Compose").$$render(
                  $$result,
                  {
                    options: {
                      inline: inline || multi,
                      decorator,
                      props: props2,
                      options,
                      scrollBoundary,
                      anchor: anchor || context.anchorLocation
                    },
                    context
                  },
                  {},
                  {}
                )}
                ` : ``}`;
              }
            })}`;
          }
        })}`;
      }
    }
  )}` : ``}`;
});
const nodeIsPage = (node) => {
  var _a;
  return !node.meta.fallback && !node.name.startsWith("_") && ((_a = node.meta) == null ? void 0 : _a.order) !== false;
};
const getChildren = (refNode, parentContext) => {
  const parentNode = (parentContext == null ? void 0 : parentContext.node) || refNode.parent;
  const matches = parentNode ? parentNode.children.filter((node) => node === refNode || nodeIsPage(node)) : [refNode];
  return matches.length ? matches : [refNode];
};
const coerceStringToNode = (nodeOrString, refNode) => typeof nodeOrString === "string" ? refNode.traverse(nodeOrString) : nodeOrString;
const coercePagesToNodes = (pagesInput, refNode, parentContext) => {
  const pageInputs = Array.isArray(pagesInput) ? pagesInput : getChildren(refNode, parentContext);
  return pageInputs.map((page) => coerceStringToNode(page, refNode));
};
const convertToObj = (inlineInput) => inlineInput instanceof Object ? !Array.isArray(inlineInput) ? inlineInput : { pages: inlineInput } : {};
const normalizeInline = (inlineInput, refNode, parentContext) => {
  const inline = convertToObj(inlineInput);
  inline.single = inline.single || !inlineInput;
  inline.pages = coercePagesToNodes(inline.pages, refNode, parentContext);
  inline.renderInactive = inline.renderInactive || "browser";
  return inline;
};
const decoratorDefaults = { recursive: true, shouldRender: () => true };
const normalizeDecorator = (decorator) => {
  if ("component" in decorator)
    return { ...decoratorDefaults, ...decorator };
  else
    return { ...decoratorDefaults, component: decorator };
};
const ComposeFragments = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  var _a;
  let $childFragments, $$unsubscribe_childFragments;
  let $isActive, $$unsubscribe_isActive;
  const isRoot = void 0;
  let { context = null } = $$props;
  let { options } = $$props;
  const environment = typeof window !== "undefined" ? "browser" : "ssr";
  let activeContext;
  const { childFragments, isActive, route } = context;
  $$unsubscribe_childFragments = subscribe(childFragments, (value) => $childFragments = value);
  $$unsubscribe_isActive = subscribe(isActive, (value) => $isActive = value);
  const { inline: multiInput, decorator, props, anchor: anchorLocation, options: _options, scrollBoundary = (elem) => elem.parentElement } = options;
  const getChildIndex = (node) => node.children.find((node2) => node2.name === "index");
  const recursiveDecorators = context.decorators.filter((deco) => deco.recursive);
  const newDecorators = pushToOrReplace(recursiveDecorators, decorator).filter(Boolean).map(normalizeDecorator);
  const folderDecorator = (_a = context == null ? void 0 : context.node) == null ? void 0 : _a.children.find((node) => node.name === "_decorator");
  const addFolderDecorator = (decorators, folderDecorator2) => {
    var _a2, _b, _c;
    const options2 = folderDecorator2.module.options || {};
    decorators.push({
      component: folderDecorator2.module.default,
      recursive: (_b = (_a2 = options2.recursive) != null ? _a2 : folderDecorator2.meta.recursive) != null ? _b : true,
      shouldRender: (_c = options2.shouldRender) != null ? _c : () => true
    });
  };
  let wait = false;
  if (folderDecorator) {
    if (folderDecorator.module)
      addFolderDecorator(newDecorators, folderDecorator);
    else {
      wait = true;
      folderDecorator.loadModule().then(() => {
        addFolderDecorator(newDecorators, folderDecorator);
        wait = false;
      });
    }
  }
  const buildChildContexts = () => {
    var _a2;
    const inline = normalizeInline(multiInput, (_a2 = $childFragments[0]) == null ? void 0 : _a2.node, context);
    return inline.pages.map((node) => {
      var _a3, _b;
      return {
        anchorLocation: anchorLocation || "parent",
        childFragments: writable(getChildIndex(node) ? [new RouteFragment(route, getChildIndex(node))] : []),
        node,
        fragment: new RouteFragment(route, node, null, {}),
        isActive: writable(false),
        isVisible: writable(false),
        elem: writable(null),
        router: ((_b = (_a3 = $childFragments[0]) == null ? void 0 : _a3.route) == null ? void 0 : _b.router) || context.router,
        route: null,
        parentContext: context,
        onDestroy: createSequenceHooksCollection(),
        decorators: newDecorators,
        options: _options || {},
        scrollBoundary,
        inline,
        single: writable(inline.single)
      };
    });
  };
  let childContexts = buildChildContexts();
  const handlePageChange = (fragments) => {
    const [fragment, ...childFragments2] = [...fragments];
    activeContext = childContexts.find((s) => s.node === (fragment == null ? void 0 : fragment.node));
    if (!activeContext) {
      childContexts = buildChildContexts();
      return handlePageChange(fragments);
    }
    activeContext.fragment = fragment;
    activeContext.childFragments.set(childFragments2);
    activeContext.route = fragments[0].route;
    childContexts = childContexts;
  };
  const setVisibility = (childContexts2) => {
    childContexts2.forEach((context2) => {
      const notExcludedCtx = (context3) => {
        var _a2, _b;
        return !((_b = (_a2 = context3 == null ? void 0 : context3.node) == null ? void 0 : _a2.meta.inline) == null ? void 0 : _b.exclude);
      };
      const isPartOfPage = () => {
        var _a2;
        return !get_store_value(activeContext == null ? void 0 : activeContext.single) && !get_store_value(context2.single) && [context2, activeContext].every(notExcludedCtx) && ["always", environment].includes((_a2 = context2.inline) == null ? void 0 : _a2.renderInactive);
      };
      const isActive2 = context2 === activeContext;
      const wasActive = get_store_value(context2.isActive);
      if (wasActive != isActive2)
        context2.isActive.set(isActive2);
      const isVisible = isActive2 || isPartOfPage();
      const wasVisible = get_store_value(context2.isVisible);
      if (wasVisible != isVisible)
        context2.isVisible.set(isVisible);
    });
  };
  if ($$props.isRoot === void 0 && $$bindings.isRoot && isRoot !== void 0)
    $$bindings.isRoot(isRoot);
  if ($$props.context === void 0 && $$bindings.context && context !== void 0)
    $$bindings.context(context);
  if ($$props.options === void 0 && $$bindings.options && options !== void 0)
    $$bindings.options(options);
  {
    if (!$isActive)
      childContexts.forEach((cc) => cc.isActive.set(false));
  }
  $childFragments.length && handlePageChange($childFragments);
  {
    setVisibility(childContexts);
  }
  $$unsubscribe_childFragments();
  $$unsubscribe_isActive();
  return `${!wait ? `${each(childContexts, (context2) => {
    return `${validate_component(RenderFragment, "RenderFragment").$$render($$result, { context: context2, props }, {}, {})}`;
  })}` : ``}`;
});
const persistentScopedScrollIntoView = (_elem, _boundary, options, timeout) => {
  let elem = resolveIfAnonFn(_elem, [_boundary]);
  const boundary = resolveIfAnonFn(_boundary, [elem]);
  options = options || {};
  options.behavior = "auto";
  scopedScrollIntoView(elem, boundary);
  const observer = new MutationObserver((mo) => {
    if (mo.length > 1 || mo[0].addedNodes.length || mo[0].removedNodes.length) {
      scopedScrollIntoView(elem, boundary);
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true
  });
  const stopScroll = () => observer.disconnect();
  if (timeout) {
    return new Promise(
      (resolve) => setTimeout(() => {
        stopScroll();
        resolve();
      }, timeout)
    );
  } else {
    return stopScroll;
  }
};
const getMulti = (elem) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
  if (!elem)
    return false;
  if ((_a = elem["__routify_meta"]) == null ? void 0 : _a.router)
    return false;
  if ((_d = (_c = (_b = elem["__routify_meta"]) == null ? void 0 : _b.renderContext) == null ? void 0 : _c.anchor) == null ? void 0 : _d.single)
    return !get_store_value((_g = (_f = (_e = elem["__routify_meta"]) == null ? void 0 : _e.renderContext) == null ? void 0 : _f.anchor) == null ? void 0 : _g.single);
  if ((_j = (_i = (_h = elem["__routify_meta"]) == null ? void 0 : _h.renderContext) == null ? void 0 : _i.parent) == null ? void 0 : _j.single)
    return !get_store_value((_m = (_l = (_k = elem["__routify_meta"]) == null ? void 0 : _k.renderContext) == null ? void 0 : _l.parent) == null ? void 0 : _m.single);
  else
    return getMulti(elem.parentElement);
};
const scopedScrollIntoView = async (_elem, _boundary) => {
  let elem = await resolveIfAnonFn(_elem, [_boundary]);
  const boundary = await resolveIfAnonFn(_boundary, [elem]);
  let parent = elem.parentElement;
  while ((parent == null ? void 0 : parent.scrollTo) && parent.dataset["routifyScroll"] !== "lock" && parent !== (boundary == null ? void 0 : boundary.parentElement)) {
    const scrollToPos = getMulti(elem) || elem["routify-hash-nav"];
    if (!scrollToPos) {
      parent.scrollTo(0, 0);
    } else {
      const targetRect = elem.getBoundingClientRect();
      const parentRect = parent.getBoundingClientRect();
      const scrollTop = parent.parentElement ? parent.scrollTop : 0;
      const scrollLeft = parent.parentElement ? parent.scrollLeft : 0;
      const top = scrollTop + targetRect.top - parentRect.top;
      const left = scrollLeft + targetRect.left - parentRect.left;
      parent.scrollTo({ top, left });
    }
    if (!scrollToPos)
      elem = parent;
    parent = parent.parentElement;
  }
};
const scrollToContext = async (context) => {
  const { anchor, parent } = await waitFor(context.elem, Boolean);
  const scrollTarget = anchor || parent;
  let scrollBoundary = await context.scrollBoundary;
  scopedScrollIntoView(scrollTarget, scrollBoundary);
};
const hashScroll = (route) => {
  setTimeout(
    async () => {
      var _a;
      const hashElem = (_a = globalThis.document) == null ? void 0 : _a.getElementById(route == null ? void 0 : route.hash);
      if (hashElem) {
        hashElem["routify-hash-nav"] = "true";
        await persistentScopedScrollIntoView(hashElem, null, {}, 500);
        delete hashElem["routify-hash-nav"];
      }
    },
    0
  );
};
const ScrollDecorator = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let route;
  let isActive;
  let { context } = $$props;
  const isRoot = void 0;
  if ($$props.context === void 0 && $$bindings.context && context !== void 0)
    $$bindings.context(context);
  if ($$props.isRoot === void 0 && $$bindings.isRoot && isRoot !== void 0)
    $$bindings.isRoot(isRoot);
  ({ route, isActive } = context);
  {
    if (route == null ? void 0 : route.hash)
      hashScroll(route);
    else if (get_store_value(isActive) && !(route == null ? void 0 : route.state.dontScroll))
      scrollToContext(context);
  }
  return `${slots.default ? slots.default({}) : ``}`;
});
const Router_1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let activeRoute;
  let $activeRoute, $$unsubscribe_activeRoute = noop, $$subscribe_activeRoute = () => ($$unsubscribe_activeRoute(), $$unsubscribe_activeRoute = subscribe(activeRoute, ($$value) => $activeRoute = $$value), activeRoute);
  let { router: router2 = null } = $$props;
  let { routes: routes2 = null } = $$props;
  let { decorator = null } = $$props;
  let { urlReflector = null } = $$props;
  let { instance = null } = $$props;
  let { urlRewrite = null } = $$props;
  let { url = null } = $$props;
  let { name = null } = $$props;
  let { rootNode = null } = $$props;
  let { passthrough = null } = $$props;
  let { beforeRouterInit = null } = $$props;
  let { afterRouterInit = null } = $$props;
  let { beforeUrlChange = null } = $$props;
  let { afterUrlChange = null } = $$props;
  let { transformFragments = null } = $$props;
  let { onDestroy: onDestroy$1 = null } = $$props;
  let { plugins = null } = $$props;
  let { queryHandler = null } = $$props;
  let { anchor = "wrapper" } = $$props;
  let { clickHandler = {} } = $$props;
  const context = {
    childFragments: writable([]),
    decorators: [normalizeDecorator(ScrollDecorator)]
  };
  const options = {
    instance,
    rootNode,
    name,
    routes: routes2,
    urlRewrite,
    urlReflector,
    passthrough,
    beforeRouterInit,
    afterRouterInit,
    beforeUrlChange,
    afterUrlChange,
    transformFragments,
    onDestroy: onDestroy$1,
    plugins,
    queryHandler,
    clickHandler
  };
  if (!router2)
    router2 = new Router(options);
  const initialize = (elem) => {
    var _a;
    elem = anchor === "parent" || anchor === "wrapper" ? elem : elem.parentElement;
    router2.setParentElem(elem);
    elem["__routify_meta"] = { ...elem["__routify_meta"], router: router2 };
    let clickScopeElem = resolveIfAnonFn(((_a = router2.clickHandler) == null ? void 0 : _a.elem) || elem, [elem]);
    if (!router2.passthrough) {
      clickScopeElem.addEventListener("click", handleClick);
      clickScopeElem.addEventListener("keydown", handleClick);
      clickScopeElem.addEventListener("mouseover", handleHover);
    }
  };
  const handleHover = (event) => {
    var _a, _b, _c, _d;
    const eventUrl = getUrlFromEvent(event);
    const url2 = (_c = (_b = (_a = router2.clickHandler).callback) == null ? void 0 : _b.call(_a, event, eventUrl)) != null ? _c : eventUrl;
    const shouldPrefetch = typeof url2 === "string" && ((_d = event.target.closest("[data-routify-prefetch-data]")) == null ? void 0 : _d.dataset.routifyPrefetchData) === "hover";
    if (shouldPrefetch)
      router2.url.push(url2, { prefetch: true });
  };
  const handleClick = (event) => {
    var _a, _b, _c;
    if (shouldIgnoreClick(event))
      return;
    const eventUrl = getUrlFromEvent(event);
    const url2 = (_c = (_b = (_a = router2.clickHandler).callback) == null ? void 0 : _b.call(_a, event, eventUrl)) != null ? _c : eventUrl;
    if (typeof url2 === "string")
      router2.url.push(url2);
  };
  if (typeof window !== "undefined")
    onDestroy(() => router2.destroy());
  if ($$props.router === void 0 && $$bindings.router && router2 !== void 0)
    $$bindings.router(router2);
  if ($$props.routes === void 0 && $$bindings.routes && routes2 !== void 0)
    $$bindings.routes(routes2);
  if ($$props.decorator === void 0 && $$bindings.decorator && decorator !== void 0)
    $$bindings.decorator(decorator);
  if ($$props.urlReflector === void 0 && $$bindings.urlReflector && urlReflector !== void 0)
    $$bindings.urlReflector(urlReflector);
  if ($$props.instance === void 0 && $$bindings.instance && instance !== void 0)
    $$bindings.instance(instance);
  if ($$props.urlRewrite === void 0 && $$bindings.urlRewrite && urlRewrite !== void 0)
    $$bindings.urlRewrite(urlRewrite);
  if ($$props.url === void 0 && $$bindings.url && url !== void 0)
    $$bindings.url(url);
  if ($$props.name === void 0 && $$bindings.name && name !== void 0)
    $$bindings.name(name);
  if ($$props.rootNode === void 0 && $$bindings.rootNode && rootNode !== void 0)
    $$bindings.rootNode(rootNode);
  if ($$props.passthrough === void 0 && $$bindings.passthrough && passthrough !== void 0)
    $$bindings.passthrough(passthrough);
  if ($$props.beforeRouterInit === void 0 && $$bindings.beforeRouterInit && beforeRouterInit !== void 0)
    $$bindings.beforeRouterInit(beforeRouterInit);
  if ($$props.afterRouterInit === void 0 && $$bindings.afterRouterInit && afterRouterInit !== void 0)
    $$bindings.afterRouterInit(afterRouterInit);
  if ($$props.beforeUrlChange === void 0 && $$bindings.beforeUrlChange && beforeUrlChange !== void 0)
    $$bindings.beforeUrlChange(beforeUrlChange);
  if ($$props.afterUrlChange === void 0 && $$bindings.afterUrlChange && afterUrlChange !== void 0)
    $$bindings.afterUrlChange(afterUrlChange);
  if ($$props.transformFragments === void 0 && $$bindings.transformFragments && transformFragments !== void 0)
    $$bindings.transformFragments(transformFragments);
  if ($$props.onDestroy === void 0 && $$bindings.onDestroy && onDestroy$1 !== void 0)
    $$bindings.onDestroy(onDestroy$1);
  if ($$props.plugins === void 0 && $$bindings.plugins && plugins !== void 0)
    $$bindings.plugins(plugins);
  if ($$props.queryHandler === void 0 && $$bindings.queryHandler && queryHandler !== void 0)
    $$bindings.queryHandler(queryHandler);
  if ($$props.anchor === void 0 && $$bindings.anchor && anchor !== void 0)
    $$bindings.anchor(anchor);
  if ($$props.clickHandler === void 0 && $$bindings.clickHandler && clickHandler !== void 0)
    $$bindings.clickHandler(clickHandler);
  {
    if (url && url !== router2.url.internal())
      router2.url.replace(url);
  }
  $$subscribe_activeRoute(activeRoute = router2.activeRoute);
  {
    context.childFragments.set(($activeRoute == null ? void 0 : $activeRoute.fragments) || []);
  }
  $$unsubscribe_activeRoute();
  return `${validate_component(AnchorDecorator, "AnchorDecorator").$$render(
    $$result,
    {
      onMount: initialize,
      style: "display: contents",
      location: anchor
    },
    {},
    {
      default: () => {
        return `${$activeRoute ? `${validate_component(ComposeFragments, "Component").$$render($$result, { context, options: { decorator } }, {}, {})}` : ``}`;
      }
    }
  )}`;
});
const App$1 = "";
const router = createRouter({ routes });
const App = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Router_1, "Router").$$render($$result, { router }, {}, {})}`;
});
const module = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: App
}, Symbol.toStringTag, { value: "Module" }));
const polyfillFetch = async () => {
  const fetch2 = await import("node-fetch");
  globalThis.fetch = fetch2.default;
  globalThis.Headers = fetch2.Headers;
  globalThis.Request = fetch2.Request;
  globalThis.Response = fetch2.Response;
};
const urlSegmentToRouterAndUrl = (urlSegment, index2) => {
  if (!index2)
    return ["", urlSegment];
  const matches = urlSegment.match(/([\w-]+?)=(.+)/);
  return [matches[1], matches[2]];
};
const getUrlSegments = (compositeUrl) => compositeUrl.split(";").map(urlSegmentToRouterAndUrl);
const getPrimaryUrl = (urlPairs) => urlPairs.find(([name]) => name === "")[1];
const renderModule = async (module2, compositeUrl) => {
  var _a;
  await polyfillFetch();
  const render2 = ((_a = module2.default) == null ? void 0 : _a.render) || module2["render"];
  const urlPairs = getUrlSegments(compositeUrl);
  const load2 = module2.load ? await module2.load(getPrimaryUrl(urlPairs)) : {};
  await preloadUrlFromUrlPairs(urlPairs);
  return { ...await render2(), load: load2 };
};
const preloadUrlFromUrlPairs = async (urlPairs) => {
  const routers = urlPairs.map(([name, url]) => {
    const router2 = appInstance.routers.find((router3) => router3.name === name) || createRouter({ name, url });
    const currentRoute = router2.pendingRoute.get() || router2.activeRoute.get();
    if ((currentRoute == null ? void 0 : currentRoute.url) !== url)
      router2.url.replace(url);
    return router2;
  });
  await Promise.all(routers.map((router2) => router2.ready()));
};
const render = (url) => renderModule(module, url);
const Hello_world = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<h1>Hello world!</h1>`;
});
const helloWorld = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Hello_world
}, Symbol.toStringTag, { value: "Module" }));
const Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<main class="h-screen w-screen flex flex-col gap-y-5 items-center justify-center"><a href="#" class="font-bold text-2xl">ROUTIFY + SVELTE + MARKDOWN </a>
    <a href="/hello-world">Hello World markdown page</a></main>`;
});
const index = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Routes
}, Symbol.toStringTag, { value: "Module" }));
const load = ({ route }) => ({
  status: 404,
  error: "[Routify] Page could not be found.",
  props: { url: route.url }
});
const U5B_404u5D = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { url } = $$props;
  if ($$props.url === void 0 && $$bindings.url && url !== void 0)
    $$bindings.url(url);
  return `
404 - Could not find the page &quot;${escape(url)}&quot;`;
});
const ____404_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: U5B_404u5D,
  load
}, Symbol.toStringTag, { value: "Module" }));
export {
  render
};
