(function () {
"use strict";
var yapmodPlugin = (() => {
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

  // plugins/link-previews/index.tsx
  var index_exports = {};
  __export(index_exports, {
    default: () => index_default
  });

  // plugins/link-previews/platforms.ts
  function decode(value) {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
  var readable = (value) => value.replace(/[_-]+/g, " ").trim() || value;
  function describeLink(url) {
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const parts = url.pathname.split("/").filter(Boolean).map(decode);
    const [first = "", second = "", third = "", fourth = "", fifth = ""] = parts;
    const last = parts.at(-1);
    const fallback = last ? readable(last) : url.hostname;
    const matches = (...hosts) => hosts.includes(host);
    const card = (site, accent, title2, context2) => ({
      site,
      accent,
      title: title2,
      context: context2
    });
    if (matches("github.com")) {
      const github = (title2, context2) => {
        const result = card("GitHub", "#848d97", title2, context2);
        if (context2 && first && second && !url.search && !url.port && /^[\w.-]+$/.test(first) && /^[\w.-]+$/.test(second)) {
          const detail = ["issues", "pull"].includes(third) && /^\d+$/.test(fourth) ? "/" + third + "/" + fourth : "";
          if (!third || detail) result.socialImage = "https://opengraph.githubassets.com/1/" + first + "/" + second + detail;
        }
        return result;
      };
      if (!first) return github("GitHub");
      if (!second) return github(first, "GitHub page");
      if (/^(?:orgs|users|topics|search|settings|features|marketplace|collections|sponsors)$/.test(first)) return github(fallback, readable(first));
      const repo = first + "/" + second;
      const kinds = {
        pull: "Pull request",
        issues: "Issue",
        discussions: "Discussion"
      };
      if (Object.hasOwn(kinds, third) && /^\d+$/.test(fourth)) return github(kinds[third] + " #" + fourth, repo);
      if (third === "commit" && /^[a-f\d]{7,64}$/i.test(fourth)) return github("Commit " + fourth.slice(0, 7), repo);
      if (third === "releases" && fourth === "tag" && fifth) return github("Release " + parts.slice(4).join("/"), repo);
      if (third === "blob" || third === "tree") return github(last || second, repo + " \xB7 " + (third === "blob" ? "File" : "Directory"));
      if (third) return github(readable(last || third), repo);
      return github(repo, "Repository");
    }
    if (matches("gist.github.com")) return card("GitHub Gist", "#848d97", first ? "Gists by " + first : "GitHub Gist", second ? "Gist " + second.slice(0, 8) : void 0);
    if (matches("reddit.com", "old.reddit.com", "new.reddit.com", "np.reddit.com", "m.reddit.com", "redd.it")) {
      const reddit = (title2, context2) => card("Reddit", "#ff5700", title2, context2);
      const community = first === "r" && second ? "r/" + second : "";
      const index = community ? 2 : 0;
      if (parts[index] === "comments" && parts[index + 1]) {
        const slug = parts[index + 2];
        return reddit(slug && slug !== "_" ? readable(slug) : "Reddit post", [community, parts[index + 3] ? "Comment" : "Post"].filter(Boolean).join(" \xB7 "));
      }
      if (community) return reddit(community, third === "s" ? "Shared link" : "Community");
      if ((first === "user" || first === "u") && second) return reddit("u/" + second, "Profile");
      return reddit(host === "redd.it" ? "Shared Reddit post" : fallback);
    }
    if (matches("twitter.com", "mobile.twitter.com", "x.com", "mobile.x.com")) {
      const status = parts.indexOf("status");
      if (status !== -1 && /^\d+$/.test(parts[status + 1] || "")) {
        return card("X / Twitter", "#8795a1", first === "i" ? "Post on X" : "Post by @" + first, "Post " + parts[status + 1]);
      }
      if (first === "i" && second === "spaces") return card("X / Twitter", "#8795a1", "X Space");
      const profile = parts.length === 1 && !/^(home|search|explore|messages|notifications|settings|i)$/.test(first);
      return card("X / Twitter", "#8795a1", profile ? "@" + first : fallback, profile ? "Profile" : void 0);
    }
    if (matches("instagram.com", "m.instagram.com")) {
      const types = {
        p: "Post",
        reel: "Reel",
        reels: "Reel",
        tv: "Video"
      };
      const index = Object.hasOwn(types, first) ? 0 : 1;
      const type = types[parts[index] || ""];
      if (type && Object.hasOwn(types, parts[index] || "") && parts[index + 1]) return card("Instagram", "#d94d94", index ? type + " by @" + first : "Instagram " + type.toLowerCase(), parts[index + 1]);
      if (first === "stories" && second) return card("Instagram", "#d94d94", "Story by @" + second);
      return card("Instagram", "#d94d94", parts.length === 1 ? "@" + first : fallback);
    }
    if (matches("tiktok.com", "m.tiktok.com", "vm.tiktok.com", "vt.tiktok.com")) {
      if (first.startsWith("@")) return card("TikTok", "#25bdbb", second === "video" ? "Video by " + first : second === "photo" ? "Photos by " + first : first, third || "Creator");
      return card("TikTok", "#25bdbb", "Shared TikTok link");
    }
    if (matches("youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be", "youtube-nocookie.com")) {
      const id = host === "youtu.be" ? first : first === "watch" ? url.searchParams.get("v") : ["shorts", "live", "embed"].includes(first) ? second : "";
      const site = host === "music.youtube.com" ? "YouTube Music" : "YouTube";
      if (id && /^[\w-]{11}$/.test(id)) {
        const result = card(site, "#f33d43", first === "shorts" ? "YouTube Short" : first === "live" ? "YouTube livestream" : site + " video");
        result.lookup = "https://www.youtube.com/watch?v=" + id;
        result.artwork = "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
        return result;
      }
      return card(site, "#f33d43", first === "playlist" ? "YouTube playlist" : fallback, first.startsWith("@") ? "Channel" : void 0);
    }
    if (matches("en.wikipedia.org", "wikipedia.org") || /^[a-z0-9-]+(?:\.m)?\.wikipedia\.org$/.test(host)) return card("Wikipedia", "#8597aa", first === "wiki" && second ? parts.slice(1).join("/").replaceAll("_", " ") : fallback, "Encyclopedia");
    if (matches("stackoverflow.com", "superuser.com", "serverfault.com") || /^[\w.-]+\.stackexchange\.com$/.test(host)) return card(host === "stackoverflow.com" ? "Stack Overflow" : host, "#ed902f", first === "questions" && third ? readable(third) : fallback, ["q", "questions"].includes(first) && /^\d+$/.test(second) ? "Question #" + second : void 0);
    if (matches("open.spotify.com")) {
      const offset = /^intl-[a-z-]+$/i.test(first) ? 1 : 0;
      const type = parts[offset] === "embed" ? parts[offset + 1] : parts[offset];
      return card("Spotify", "#1db954", type && ["track", "album", "artist", "playlist", "episode", "show"].includes(type) ? "Spotify " + type : fallback);
    }
    if (matches("bsky.app") && first === "profile" && second) return card("Bluesky", "#398aff", third === "post" ? "Post by " + second : second, third === "post" ? void 0 : "Profile");
    if (matches("twitch.tv", "m.twitch.tv", "clips.twitch.tv")) return card("Twitch", "#a970ff", host === "clips.twitch.tv" || second === "clip" ? "Twitch clip" : first === "videos" ? "Twitch video" : first || "Twitch", second === "clip" ? first : void 0);
    if (matches("soundcloud.com", "m.soundcloud.com") && first && second) return card("SoundCloud", "#ff7700", readable(last), first + (second === "sets" ? " \xB7 Playlist" : ""));
    if (matches("docs.google.com")) {
      const product = {
        document: "Google Docs",
        spreadsheets: "Google Sheets",
        presentation: "Google Slides",
        forms: "Google Forms"
      };
      if (Object.hasOwn(product, first)) return card(product[first], "#528bf0", {
        document: "Shared document",
        spreadsheets: "Shared spreadsheet",
        presentation: "Shared presentation",
        forms: "Shared form"
      }[first]);
    }
    if (matches("facebook.com", "m.facebook.com", "mbasic.facebook.com", "fb.watch")) {
      const type = host === "fb.watch" || first === "watch" ? "Video" : first === "reel" ? "Reel" : first === "groups" && second ? "Group" : second === "posts" || first === "permalink.php" ? "Post" : "";
      return card("Facebook", "#4285ef", type ? "Facebook " + type.toLowerCase() : fallback, type === "Group" ? second : second === "posts" ? first : void 0);
    }
    if (matches("threads.com", "threads.net") && first.startsWith("@")) return card("Threads", "#888888", second === "post" ? "Post by " + first : first);
    if (matches("vimeo.com", "player.vimeo.com") && /^\d+$/.test(last || "")) return card("Vimeo", "#43b8dc", "Vimeo video", "Video " + last);
    if (matches("discord.gg") || matches("discord.com") && first === "invite") return card("Discord", "#7985ff", "Server invite", host === "discord.gg" ? first : second);
    if (matches("discord.com") && first === "channels" && third) return card("Discord", "#7985ff", fourth ? "Discord message" : "Discord channel");
    if (matches("gitlab.com")) {
      const divider = parts.indexOf("-");
      const kind = parts[divider + 1];
      const number = parts[divider + 2];
      if (divider >= 2 && number && /^\d+$/.test(number) && (kind === "merge_requests" || kind === "issues")) return card("GitLab", "#ef813b", kind === "issues" ? "Issue #" + number : "Merge request !" + number, parts.slice(0, divider).join("/"));
    }
    if (matches("npmjs.com") && first === "package" && second) return card("npm", "#d95353", second.startsWith("@") && third ? second + "/" + third : second, "Package");
    if (matches("store.steampowered.com") && first === "app" && second) return card("Steam", "#548aae", third ? readable(third) : "Steam app " + second, "Store page");
    if (matches("google.com", "maps.google.com") && first === "maps" && second === "place" && third) return card("Google Maps", "#40aa70", third.replaceAll("+", " "), "Place");
    if (matches("news.ycombinator.com") && first === "item" && url.searchParams.has("id")) return card("Hacker News", "#f07b38", "Discussion #" + url.searchParams.get("id"));
    if (/^[a-z0-9-]+\.bandcamp\.com$/.test(host) && ["album", "track"].includes(first) && second) return card("Bandcamp", "#40a6ad", readable(second), host.split(".")[0] + " \xB7 " + first);
    for (const [name, color, domains] of platforms) {
      if (domains.includes(host)) return card(name, color, !last || opaque(last) || shortHosts.has(host) ? name + " link" : readable(last), url.host);
    }
    const context = [url.host, ...parts.slice(0, -1)].join(" \u203A ");
    const title = !last && url.searchParams.get("q") || fallback;
    return {
      site: url.host,
      title,
      context
    };
  }
  var opaque = (part) => /^\d+$/.test(part) || /^[\w-]{15,}$/.test(part) && /\d/.test(part);
  var shortHosts = /* @__PURE__ */ new Set(["t.co", "pin.it", "spoti.fi", "spotify.link", "on.soundcloud.com", "fb.watch", "discord.gg", "maps.app.goo.gl", "amzn.to", "lnkd.in"]);
  var platforms = [["Facebook", "#4285ef", ["facebook.com", "m.facebook.com", "fb.watch"]], ["Threads", "#888888", ["threads.com", "threads.net"]], ["LinkedIn", "#398bc6", ["linkedin.com", "lnkd.in"]], ["Pinterest", "#e64c58", ["pinterest.com", "pin.it"]], ["X / Twitter", "#8795a1", ["t.co"]], ["Spotify", "#1db954", ["spoti.fi", "spotify.link"]], ["Apple Music", "#f75973", ["music.apple.com"]], ["Apple Podcasts", "#ad64ef", ["podcasts.apple.com"]], ["SoundCloud", "#ff7700", ["soundcloud.com", "m.soundcloud.com", "on.soundcloud.com"]], ["Vimeo", "#43b8dc", ["vimeo.com", "player.vimeo.com"]], ["Discord", "#7985ff", ["discord.com", "discord.gg"]], ["GitLab", "#ef813b", ["gitlab.com"]], ["Bitbucket", "#4c91f9", ["bitbucket.org"]], ["npm", "#d95353", ["npmjs.com"]], ["Hugging Face", "#edb93d", ["huggingface.co"]], ["Figma", "#a878ee", ["figma.com"]], ["Google Drive", "#40aa70", ["drive.google.com"]], ["Google Maps", "#40aa70", ["maps.google.com", "maps.app.goo.gl"]], ["MDN Web Docs", "#719dff", ["developer.mozilla.org"]], ["Steam", "#548aae", ["store.steampowered.com", "steamcommunity.com"]], ["Internet Archive", "#a0a0a0", ["archive.org"]], ["Amazon", "#e8a647", ["amazon.com", "amzn.to"]], ["Bandcamp", "#40a6ad", ["bandcamp.com"]]];

  // plugins/link-previews/index.tsx
  var {
    createComponent: _$createComponent
  } = yapmod.solidWeb;
  var {
    Section,
    SettingRow,
    SettingsPage,
    Switch
  } = yapmod.ui;
  var groupClass = "ym-link-previews";
  var css = `
.ym-link-previews { display:grid; gap:6px; margin:5px 0 2px; max-width:26rem; min-width:0 }
.ym-link-previews a { display:flex; align-items:stretch; min-width:0; border:1px solid var(--border,#475569);
  border-inline-start:3px solid var(--platform-color,var(--accent,#7b83ff)); border-radius:8px; overflow:hidden;
  color:inherit; background:var(--bg-elev,#242630); text-decoration:none }
.ym-link-previews a:hover strong,.ym-link-previews a:focus-visible strong { text-decoration:underline }
.ym-link-previews .copy { flex:1; min-width:0; padding:9px 12px; display:grid; gap:3px; align-content:center }
.ym-link-previews small { opacity:.72; font-size:.75rem }
.ym-link-previews strong,.ym-link-previews small { overflow:hidden; text-overflow:ellipsis; white-space:nowrap }
.ym-link-previews strong { font-size:.93rem; line-height:1.35 }
.ym-link-previews .summary { font-size:.83rem; opacity:.85; display:-webkit-box; -webkit-line-clamp:2;
  -webkit-box-orient:vertical; overflow:hidden; overflow-wrap:anywhere }
.ym-link-previews .with-snapshot { display:grid }
.ym-link-previews img.snapshot { width:100%; max-width:none; height:auto; aspect-ratio:20/7; object-position:top }
.ym-link-previews img { width:25%; max-width:6rem; height:5.3rem; object-fit:cover; align-self:center }
`;
  function webUrl(value) {
    if (typeof value !== "string") return;
    try {
      const url = new URL(value);
      if (["https:", "http:"].includes(url.protocol) && !url.username && !url.password) return url;
    } catch {
    }
  }
  function snapshotUrl(url) {
    if (url.search || url.port || !url.hostname.includes(".") || /^[\d.]+$/.test(url.hostname) || /(?:^|\.)(?:localhost|local|internal|test|invalid|example|lan|home|onion)$/.test(url.hostname)) return;
    return "https://image.thum.io/get/width/600/crop/420/noanimate/" + url.href;
  }
  function index_default() {
    const pending = /* @__PURE__ */ new Map();
    const abort = new AbortController();
    const suppressed = /* @__PURE__ */ new WeakMap();
    let visible;
    let changes;
    function lookup(url) {
      const target = new URL(url);
      target.hash = "";
      const platform = describeLink(target);
      const key = platform.lookup ?? target.href;
      const cached = pending.get(key);
      if (cached) return cached;
      const job = (async () => {
        const signal = AbortSignal.any([abort.signal, AbortSignal.timeout(8e3)]);
        const options = {
          signal,
          credentials: "omit",
          referrerPolicy: "no-referrer"
        };
        const native = await fetch("/api/embed?url=" + encodeURIComponent(key), options).then(async (response) => response.ok ? (await response.json()).preview : null).catch(() => null);
        const snapshot = yapmod.storage.snapshots === true && !native?.thumbnail && !platform.artwork ? platform.socialImage ?? snapshotUrl(target) : void 0;
        return {
          title: native?.title,
          description: native?.description,
          image: native?.thumbnail || platform.artwork || snapshot,
          snapshot: !!snapshot
        };
      })().catch(() => ({}));
      if (pending.size >= 200) pending.delete(pending.keys().next().value);
      pending.set(key, job);
      return job;
    }
    async function enrich(card) {
      const {
        title,
        description,
        image,
        snapshot
      } = await lookup(new URL(card.href));
      if (!card.isConnected || abort.signal.aborted) return;
      const copy = card.querySelector(".copy");
      if (typeof title === "string" && title.trim()) copy.querySelector("strong").textContent = title;
      if (typeof description === "string" && description.trim()) {
        const summary = document.createElement("span");
        summary.className = "summary";
        summary.textContent = description;
        copy.append(summary);
      }
      const source = webUrl(image);
      if (source?.protocol === "https:") {
        const thumb = document.createElement("img");
        thumb.alt = "";
        if (snapshot) {
          card.classList.add("with-snapshot");
          thumb.className = "snapshot";
        }
        thumb.referrerPolicy = "no-referrer";
        thumb.addEventListener("error", () => thumb.remove(), {
          once: true
        });
        thumb.src = source.href;
        card.append(thumb);
      }
    }
    function render(message) {
      const body = message.querySelector(".msg-text");
      const old = message.querySelector("." + groupClass);
      const urls = /* @__PURE__ */ new Set();
      const nativeUrls = new Set(Array.from(message.querySelectorAll(".lp a[href]"), (a) => a.href));
      const images = new Set(Array.from(message.querySelectorAll(".msg-linkimgs img"), (img) => img.src));
      for (const a of body?.querySelectorAll("a[data-ext][href]") ?? []) {
        if (a.closest(".md-spoiler:not(.open),.msg-long[data-tall]:not(.open)")) continue;
        const url = webUrl(a.href);
        if (url && !nativeUrls.has(url.href) && !images.has(url.href)) urls.add(url.href);
      }
      const key = JSON.stringify([...urls].slice(0, 4));
      const loading = message.querySelector('.lp[aria-hidden="true"]');
      const hidden = suppressed.get(message) === body?.textContent;
      if (!loading && !hidden && key === old?.getAttribute("data-links")) return;
      old?.querySelectorAll("a").forEach((a) => visible.unobserve(a));
      old?.remove();
      if (!body || !urls.size || loading || hidden) return;
      const group = document.createElement("div");
      group.className = groupClass;
      group.dataset.links = key;
      for (const href of [...urls].slice(0, 4)) {
        const url = new URL(href);
        const card = document.createElement("a");
        card.href = href;
        card.target = "_blank";
        card.rel = "noopener noreferrer nofollow";
        card.dataset.ext = "";
        const copy = document.createElement("span");
        copy.className = "copy";
        const site = document.createElement("small");
        const platform = describeLink(url);
        if (platform.accent) card.style.setProperty("--platform-color", platform.accent);
        site.textContent = platform.site;
        if (platform.context && platform.context !== platform.site) {
          site.textContent = platform.accent ? platform.site + " \xB7 " + platform.context : platform.context;
        }
        const title = document.createElement("strong");
        title.textContent = platform.title;
        copy.append(site, title);
        card.append(copy);
        group.append(card);
        visible.observe(card);
      }
      body.after(group);
    }
    function reset() {
      pending.clear();
      document.querySelectorAll("." + groupClass).forEach((g) => {
        g.querySelectorAll("a").forEach((a) => visible.unobserve(a));
        g.remove();
      });
    }
    function rememberDismissal(event) {
      const message = event.target instanceof Element && event.target.closest(".lp-x")?.closest(".msg");
      if (message) suppressed.set(message, message.querySelector(".msg-text")?.textContent ?? "");
    }
    return {
      onLoad() {
        yapmod.ui.injectCss(css);
        visible = new IntersectionObserver((entries) => {
          for (const entry of entries) if (entry.isIntersecting) {
            visible.unobserve(entry.target);
            void enrich(entry.target);
          }
        });
        changes = new MutationObserver((records) => {
          const messages = /* @__PURE__ */ new Set();
          for (const record of records) {
            const target = record.target instanceof Element ? record.target : record.target.parentElement;
            if (target?.closest("." + groupClass)) continue;
            const message = target?.closest(".msg");
            if (message) messages.add(message);
            for (const node of record.addedNodes) if (node instanceof Element && !message) {
              if (node.matches(".msg")) messages.add(node);
              node.querySelectorAll(".msg").forEach((m) => messages.add(m));
            }
            for (const node of record.removedNodes) if (node instanceof Element && !node.isConnected) {
              node.querySelectorAll("." + groupClass + " a").forEach((a) => visible.unobserve(a));
            }
          }
          messages.forEach(render);
        });
        changes.observe(document.body, {
          subtree: true,
          childList: true,
          characterData: true,
          attributes: true,
          attributeFilter: ["href", "class", "data-tall", "src"]
        });
        document.addEventListener("click", rememberDismissal, true);
        document.querySelectorAll(".msg").forEach(render);
        yapmod.settings.registerSection({
          id: "link-previews",
          label: "Link Previews",
          render: () => _$createComponent(SettingsPage, {
            title: "Link Previews",
            get children() {
              return _$createComponent(Section, {
                label: "Page details",
                get children() {
                  return _$createComponent(SettingRow, {
                    label: "Show website snapshots",
                    hint: "Load GitHub social images or Thum.io page snapshots for visible public links without a thumbnail. The image provider receives the page address. Links with query strings are skipped.",
                    get children() {
                      return _$createComponent(Switch, {
                        "aria-label": "Show website snapshots",
                        get checked() {
                          return yapmod.storage.snapshots === true;
                        },
                        onChange: (value) => {
                          yapmod.storage.snapshots = value;
                          reset();
                          document.querySelectorAll(".msg").forEach(render);
                        }
                      });
                    }
                  });
                }
              });
            }
          })
        });
      },
      onUnload() {
        changes.disconnect();
        visible.disconnect();
        document.removeEventListener("click", rememberDismissal, true);
        abort.abort();
        reset();
      }
    };
  }
  return __toCommonJS(index_exports);
})();

;const plugin = typeof yapmodPlugin !== 'undefined'
  ? yapmodPlugin.default ?? yapmodPlugin
  : undefined;
if (plugin === undefined) {
  throw new Error(
    'yapmod: bundle has no default export; export the plugin with `export default`.',
  );
}
return plugin;
})();
