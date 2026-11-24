import { Section, SettingRow, SettingsPage, Switch } from '@yapmod/ui';

import { describeLink } from './platforms';

const groupClass = 'ym-link-previews';
const css = `
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

function webUrl(value: unknown) {
  if (typeof value !== 'string') return;
  try {
    const url = new URL(value);
    if (['https:', 'http:'].includes(url.protocol) && !url.username && !url.password) return url;
  } catch { /* Some message markup can contain an incomplete URL. */ }
}

interface Details { title?: string; description?: string; image?: string; snapshot?: boolean }

function snapshotUrl(url: URL) {
  if (url.search || url.port || !url.hostname.includes('.') || /^[\d.]+$/.test(url.hostname) ||
      /(?:^|\.)(?:localhost|local|internal|test|invalid|example|lan|home|onion)$/.test(url.hostname)) return;
  return 'https://image.thum.io/get/width/600/crop/420/noanimate/' + url.href;
}

export default function () {
  const pending = new Map<string, Promise<Details>>();
  const abort = new AbortController();
  const suppressed = new WeakMap<Element, string>();
  let visible: IntersectionObserver;
  let changes: MutationObserver;

  function lookup(url: URL): Promise<Details> {
    // Fragments are only meaningful to the browser and may contain private state.
    const target = new URL(url);
    target.hash = '';
    const platform = describeLink(target);
    const key = platform.lookup ?? target.href;
    const cached = pending.get(key);
    if (cached) return cached;
    const job = (async (): Promise<Details> => {
      const signal = AbortSignal.any([abort.signal, AbortSignal.timeout(8000)]);
      const options: RequestInit = { signal, credentials: 'omit', referrerPolicy: 'no-referrer' };
      const native = await fetch('/api/embed?url=' + encodeURIComponent(key), options)
        .then(async response => response.ok ? (await response.json()).preview : null)
        .catch(() => null);
      const snapshot = yapmod.storage.snapshots === true && !native?.thumbnail && !platform.artwork
        ? platform.socialImage ?? snapshotUrl(target) : undefined;
      return { title: native?.title, description: native?.description,
        image: native?.thumbnail || platform.artwork || snapshot, snapshot: !!snapshot };
    })().catch(() => ({}));
    if (pending.size >= 200) pending.delete(pending.keys().next().value!);
    pending.set(key, job);
    return job;
  }

  async function enrich(card: HTMLAnchorElement) {
    const { title, description, image, snapshot } = await lookup(new URL(card.href));
    if (!card.isConnected || abort.signal.aborted) return;
    const copy = card.querySelector('.copy')!;
    if (typeof title === 'string' && title.trim()) copy.querySelector('strong')!.textContent = title;
    if (typeof description === 'string' && description.trim()) {
      const summary = document.createElement('span');
      summary.className = 'summary';
      summary.textContent = description;
      copy.append(summary);
    }
    const source = webUrl(image);
    if (source?.protocol === 'https:') {
      const thumb = document.createElement('img');
      thumb.alt = '';
      if (snapshot) {
        card.classList.add('with-snapshot');
        thumb.className = 'snapshot';
      }
      thumb.referrerPolicy = 'no-referrer';
      thumb.addEventListener('error', () => thumb.remove(), { once: true });
      thumb.src = source.href;
      card.append(thumb);
    }
  }

  function render(message: Element) {
    const body = message.querySelector('.msg-text');
    const old = message.querySelector('.' + groupClass);
    const urls = new Set<string>();
    const nativeUrls = new Set(Array.from(message.querySelectorAll<HTMLAnchorElement>('.lp a[href]'), a => a.href));
    const images = new Set(Array.from(message.querySelectorAll<HTMLImageElement>('.msg-linkimgs img'), img => img.src));
    for (const a of body?.querySelectorAll<HTMLAnchorElement>('a[data-ext][href]') ?? []) {
      if (a.closest('.md-spoiler:not(.open),.msg-long[data-tall]:not(.open)')) continue;
      const url = webUrl(a.href);
      if (url && !nativeUrls.has(url.href) && !images.has(url.href)) urls.add(url.href);
    }
    const key = JSON.stringify([...urls].slice(0, 4));
    const loading = message.querySelector('.lp[aria-hidden="true"]');
    const hidden = suppressed.get(message) === body?.textContent;
    if (!loading && !hidden && key === old?.getAttribute('data-links')) return;
    old?.querySelectorAll('a').forEach(a => visible.unobserve(a));
    old?.remove();
    if (!body || !urls.size || loading || hidden) return;
    const group = document.createElement('div');
    group.className = groupClass;
    group.dataset.links = key;
    for (const href of [...urls].slice(0, 4)) {
      const url = new URL(href);
      const card = document.createElement('a');
      card.href = href;
      card.target = '_blank';
      card.rel = 'noopener noreferrer nofollow';
      card.dataset.ext = '';
      const copy = document.createElement('span');
      copy.className = 'copy';
      const site = document.createElement('small');
      const platform = describeLink(url);
      if (platform.accent) card.style.setProperty('--platform-color', platform.accent);
      site.textContent = platform.site;
      if (platform.context && platform.context !== platform.site) {
        site.textContent = platform.accent ? platform.site + ' · ' + platform.context : platform.context;
      }
      const title = document.createElement('strong');
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
    document.querySelectorAll('.' + groupClass).forEach(g => {
      g.querySelectorAll('a').forEach(a => visible.unobserve(a));
      g.remove();
    });
  }

  function rememberDismissal(event: Event) {
    const message = event.target instanceof Element && event.target.closest('.lp-x')?.closest('.msg');
    if (message) suppressed.set(message, message.querySelector('.msg-text')?.textContent ?? '');
  }

  return {
    onLoad() {
      yapmod.ui.injectCss(css);
      visible = new IntersectionObserver(entries => {
        for (const entry of entries) if (entry.isIntersecting) {
          visible.unobserve(entry.target);
          void enrich(entry.target as HTMLAnchorElement);
        }
      });
      changes = new MutationObserver(records => {
        const messages = new Set<Element>();
        for (const record of records) {
          const target = record.target instanceof Element ? record.target : record.target.parentElement;
          if (target?.closest('.' + groupClass)) continue;
          const message = target?.closest('.msg');
          if (message) messages.add(message);
          for (const node of record.addedNodes) if (node instanceof Element && !message) {
            if (node.matches('.msg')) messages.add(node);
            node.querySelectorAll('.msg').forEach(m => messages.add(m));
          }
          for (const node of record.removedNodes) if (node instanceof Element && !node.isConnected) {
            node.querySelectorAll('.' + groupClass + ' a').forEach(a => visible.unobserve(a));
          }
        }
        messages.forEach(render);
      });
      changes.observe(document.body, { subtree:true, childList:true, characterData:true, attributes:true,
        attributeFilter:['href','class','data-tall','src'] });
      document.addEventListener('click', rememberDismissal, true);
      document.querySelectorAll('.msg').forEach(render);
      yapmod.settings.registerSection({
        id:'link-previews', label:'Link Previews',
        render: () => <SettingsPage title="Link Previews"><Section label="Page details">
          <SettingRow label="Show website snapshots" hint="Load GitHub social images or Thum.io page snapshots for visible public links without a thumbnail. The image provider receives the page address. Links with query strings are skipped.">
            <Switch aria-label="Show website snapshots" checked={yapmod.storage.snapshots === true} onChange={value => {
              yapmod.storage.snapshots = value;
              reset();
              document.querySelectorAll('.msg').forEach(render);
            }} />
          </SettingRow>
        </Section></SettingsPage>,
      });
    },
    onUnload() {
      changes.disconnect();
      visible.disconnect();
      document.removeEventListener('click', rememberDismissal, true);
      abort.abort();
      reset();
    },
  };
}
