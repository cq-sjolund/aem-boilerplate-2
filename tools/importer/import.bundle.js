var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import.js
  var import_exports = {};
  __export(import_exports, {
    default: () => import_default
  });

  // tools/importer/parsers/hero-promo.js
  function parse(element, { document }) {
    const heading = element.querySelector("h2.company-h--large, h1, h2");
    const cta = element.querySelector("a.company-button, a[href]");
    const imgs = [...element.querySelectorAll("img")];
    const img = imgs.find((i) => (i.getAttribute("alt") || "").trim().length > 0) || imgs[0];
    const imgCell = document.createElement("div");
    if (img) {
      const clean = document.createElement("img");
      clean.setAttribute("src", img.getAttribute("src") || "");
      clean.setAttribute("alt", img.getAttribute("alt") || "");
      imgCell.appendChild(clean);
    }
    const contentCell = document.createElement("div");
    if (heading) {
      const h1 = document.createElement("h1");
      h1.textContent = heading.textContent.replace(/\s+/g, " ").trim();
      contentCell.appendChild(h1);
    }
    if (cta) {
      const p = document.createElement("p");
      const strong = document.createElement("strong");
      const a = document.createElement("a");
      a.href = cta.getAttribute("href") || "";
      a.textContent = cta.textContent.replace(/\s+/g, " ").trim();
      strong.appendChild(a);
      p.appendChild(strong);
      contentCell.appendChild(p);
    }
    const block = WebImporter.Blocks.createBlock(document, {
      name: "Hero (hero-promo)",
      cells: [[imgCell], [contentCell]]
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-article.js
  function findCards(section) {
    const headings = [...section.querySelectorAll("h2.company-heading, h3.company-heading")];
    const cards = [];
    const seen = /* @__PURE__ */ new Set();
    headings.forEach((h) => {
      let el = h.parentElement;
      while (el && el !== section) {
        if (el.querySelector(".gatsby-image-wrapper, picture, img")) {
          if (!seen.has(el)) {
            seen.add(el);
            cards.push(el);
          }
          break;
        }
        el = el.parentElement;
      }
    });
    return cards;
  }
  function parse2(element, { document }) {
    const cards = findCards(element);
    const cells = [];
    cards.forEach((card) => {
      const imgs = [...card.querySelectorAll("img")];
      const img = imgs.find((i) => (i.getAttribute("alt") || "").trim().length > 0) || imgs[0];
      const col1 = document.createElement("div");
      if (img) {
        const clean = document.createElement("img");
        clean.setAttribute("src", img.getAttribute("src") || "");
        clean.setAttribute("alt", img.getAttribute("alt") || "");
        col1.appendChild(clean);
      }
      const col2 = document.createElement("div");
      const heading = card.querySelector("h2, h3, h4");
      const cta = card.querySelector("a[href]");
      const href = cta ? cta.getAttribute("href") || "" : "";
      if (heading) {
        const h3 = document.createElement("h3");
        h3.textContent = heading.textContent.replace(/\s+/g, " ").trim();
        col2.appendChild(h3);
      }
      if (cta) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = cta.textContent.replace(/\s+/g, " ").trim();
        p.appendChild(a);
        col2.appendChild(p);
      }
      cells.push([col1, col2]);
    });
    const block = WebImporter.Blocks.createBlock(document, {
      name: "Cards (cards-article)",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-overlay.js
  function parse3(element, { document }) {
    const items = [...element.querySelectorAll("ul > li")];
    const cells = [];
    items.forEach((li) => {
      const anchor = li.querySelector(":scope > a") || li.querySelector("a[href]");
      const href = anchor ? anchor.getAttribute("href") || "" : "";
      const imgs = [...li.querySelectorAll("img")];
      const img = imgs.find((i) => (i.getAttribute("alt") || "").trim().length > 0) || imgs[0];
      const col1 = document.createElement("div");
      if (img) {
        const clean = document.createElement("img");
        clean.setAttribute("src", img.getAttribute("src") || "");
        clean.setAttribute("alt", img.getAttribute("alt") || "");
        col1.appendChild(clean);
      }
      const col2 = document.createElement("div");
      const heading = li.querySelector("h1, h2, h3, h4");
      if (heading) {
        const h3 = document.createElement("h3");
        const text = heading.textContent.replace(/\s+/g, " ").trim();
        if (href) {
          const a = document.createElement("a");
          a.href = href;
          a.textContent = text;
          h3.appendChild(a);
        } else {
          h3.textContent = text;
        }
        col2.appendChild(h3);
      }
      cells.push([col1, col2]);
    });
    const block = WebImporter.Blocks.createBlock(document, {
      name: "Cards (cards-overlay)",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/transformers/cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "nav",
        '[role="navigation"]',
        '[role="banner"]',
        "footer",
        '[role="contentinfo"]',
        ".company-sr-only",
        '[class*="skip"]',
        '[class*="cookie"]',
        '[class*="Cookie"]',
        '[id*="cookie"]',
        '[aria-label*="informasjonskapsler"]',
        "noscript",
        "style",
        "script",
        "link",
        "iframe",
        "svg"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      const sourceUrl = payload.params && payload.params.originalURL;
      if (sourceUrl) {
        element.querySelectorAll("img").forEach((img) => {
          const src = img.getAttribute("src");
          if (src && !src.startsWith("http") && !src.startsWith("data:") && !src.startsWith("blob:")) {
            try {
              img.setAttribute("src", new URL(src, sourceUrl).href);
            } catch (e) {
            }
          }
        });
        element.querySelectorAll("a").forEach((a) => {
          const href = a.getAttribute("href");
          if (href && href.startsWith("/")) {
            try {
              a.setAttribute("href", new URL(href, sourceUrl).href);
            } catch (e) {
            }
          }
        });
      }
    }
  }

  // tools/importer/transformers/sections.js
  var STYLE_DETECTORS = [
    {
      // Product link bar: a single paragraph/row containing 3-6 links and nothing
      // else (e.g. Lån · Forsikring · Sparing · Kort). Large underlined links.
      style: "productbar",
      test: (s) => {
        const links = [...s.querySelectorAll("a[href]")];
        if (links.length < 3 || links.length > 6) return false;
        if (s.querySelector("h1,h2,h3,h4,img,ul,picture")) return false;
        return links.every((a) => a.textContent.trim().length < 20);
      }
    },
    {
      // Quick-links grid: >= 5 short action links, no heading and no images,
      // laid out as a multi-column grid of arrow links.
      style: "linkgrid",
      test: (s) => {
        const links = [...s.querySelectorAll("a[href]")];
        if (links.length < 5) return false;
        if (s.querySelector("h1,h2,h3,h4,img,picture")) return false;
        return true;
      }
    }
  ];
  function detectSectionStyle(sectionEl) {
    for (const detector of STYLE_DETECTORS) {
      if (detector.test(sectionEl)) return detector.style;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== "beforeTransform") return;
    const { document } = payload;
    const sections = [...element.querySelectorAll("section")].filter(
      (s) => !s.closest("section:not(:scope)") || s.parentElement.closest("section") === null
    );
    const topSections = sections.length ? sections : [...element.querySelectorAll("section")];
    if (topSections.length === 0) return;
    for (let i = topSections.length - 1; i >= 0; i--) {
      const sectionEl = topSections[i];
      const style = detectSectionStyle(sectionEl);
      if (style) {
        const metaBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style }
        });
        sectionEl.after(metaBlock);
      }
      if (i > 0) {
        const hr = document.createElement("hr");
        sectionEl.before(hr);
      }
    }
  }

  // tools/importer/import.js
  var BLOCK_REGISTRY = [
    {
      name: "cards-overlay",
      // A <ul> of >= 2 <li>, each a single link containing both an image and a heading
      // (heading is overlaid on the image; the whole card is clickable).
      match: (section) => {
        const ul = section.querySelector("ul");
        if (!ul) return false;
        const items = [...ul.querySelectorAll(":scope > li")];
        if (items.length < 2) return false;
        return items.every((li) => {
          const a = li.querySelector(":scope > a") || li.querySelector("a[href]");
          return a && a.querySelector("img") && a.querySelector("h1,h2,h3,h4");
        });
      },
      parser: parse3
    },
    {
      name: "cards-article",
      // >= 2 repeating card units, each an image wrapper + heading (text below image).
      match: (section) => countCardUnits(section) >= 2,
      parser: parse2
    },
    {
      name: "hero-promo",
      // Single large heading + one CTA button + an image; not a repeating card grid.
      match: (section) => section.querySelectorAll("h2.company-h--large, h1").length === 1 && !!section.querySelector("a.company-button, a[href]") && !!section.querySelector(".gatsby-image-wrapper, picture, img") && countCardUnits(section) < 2,
      parser: parse
    }
  ];
  function countCardUnits(section) {
    const headings = [...section.querySelectorAll("h2.company-heading, h3.company-heading")];
    const cards = /* @__PURE__ */ new Set();
    headings.forEach((h) => {
      let el = h.parentElement;
      while (el && el !== section) {
        if (el.querySelector(".gatsby-image-wrapper, picture, img")) {
          cards.add(el);
          break;
        }
        el = el.parentElement;
      }
    });
    return cards.size;
  }
  function findBlocksOnPage(root) {
    const pageBlocks = [];
    const sections = [...root.querySelectorAll("section")];
    sections.forEach((section) => {
      if (section.parentElement && section.parentElement.closest("section")) return;
      for (const entry of BLOCK_REGISTRY) {
        try {
          if (entry.match(section)) {
            pageBlocks.push({ name: entry.name, element: section, parser: entry.parser });
            break;
          }
        } catch (e) {
          console.warn(`Matcher failed for ${entry.name}:`, e);
        }
      }
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  function executeTransformers(hookName, element, payload) {
    const transformers = [transform, transform2];
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, payload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  var import_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const originalURL = params.originalURL || url;
      const main = document.querySelector("main") || document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(main);
      pageBlocks.forEach((block) => {
        try {
          block.parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name}:`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_exports);
})();
