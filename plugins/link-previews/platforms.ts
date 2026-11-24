// All matching is local. The original URL remains the click destination, including
// share parameters, timestamps and fragments.
interface Card {
  site: string;
  title: string;
  context?: string;
  accent?: string;
  lookup?: string;
  artwork?: string;
  socialImage?: string;
}

function decode(value: string) {
  try { return decodeURIComponent(value); } catch { return value; }
}

const readable = (value: string) => value.replace(/[_-]+/g, ' ').trim() || value;

export function describeLink(url: URL): Card {
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  const parts = url.pathname.split('/').filter(Boolean).map(decode);
  const [first = '', second = '', third = '', fourth = '', fifth = ''] = parts;
  const last = parts.at(-1);
  const fallback = last ? readable(last) : url.hostname;
  const matches = (...hosts: string[]) => hosts.includes(host);
  const card = (site: string, accent: string, title: string, context?: string): Card =>
    ({ site, accent, title, context });

  if (matches('github.com')) {
    const github = (title: string, context?: string): Card => {
      const result = card('GitHub', '#848d97', title, context);
      if (context && first && second && !url.search && !url.port && /^[\w.-]+$/.test(first) && /^[\w.-]+$/.test(second)) {
        const detail = ['issues', 'pull'].includes(third) && /^\d+$/.test(fourth) ? '/' + third + '/' + fourth : '';
        if (!third || detail) result.socialImage = 'https://opengraph.githubassets.com/1/' + first + '/' + second + detail;
      }
      return result;
    };
    if (!first) return github('GitHub');
    if (!second) return github(first, 'GitHub page');
    if (/^(?:orgs|users|topics|search|settings|features|marketplace|collections|sponsors)$/.test(first))
      return github(fallback, readable(first));
    const repo = first + '/' + second;
    const kinds: Record<string, string> = { pull:'Pull request', issues:'Issue', discussions:'Discussion' };
    if (Object.hasOwn(kinds, third) && /^\d+$/.test(fourth)) return github(kinds[third] + ' #' + fourth, repo);
    if (third === 'commit' && /^[a-f\d]{7,64}$/i.test(fourth)) return github('Commit ' + fourth.slice(0, 7), repo);
    if (third === 'releases' && fourth === 'tag' && fifth) return github('Release ' + parts.slice(4).join('/'), repo);
    if (third === 'blob' || third === 'tree') return github(last || second, repo + ' · ' + (third === 'blob' ? 'File' : 'Directory'));
    if (third) return github(readable(last || third), repo);
    return github(repo, 'Repository');
  }
  if (matches('gist.github.com')) return card('GitHub Gist', '#848d97', first ? 'Gists by ' + first : 'GitHub Gist', second ? 'Gist ' + second.slice(0, 8) : undefined);

  if (matches('reddit.com','old.reddit.com','new.reddit.com','np.reddit.com','m.reddit.com','redd.it')) {
    const reddit = (title: string, context?: string) => card('Reddit', '#ff5700', title, context);
    const community = first === 'r' && second ? 'r/' + second : '';
    const index = community ? 2 : 0;
    if (parts[index] === 'comments' && parts[index + 1]) {
      const slug = parts[index + 2];
      return reddit(slug && slug !== '_' ? readable(slug) : 'Reddit post', [community, parts[index + 3] ? 'Comment' : 'Post'].filter(Boolean).join(' · '));
    }
    if (community) return reddit(community, third === 's' ? 'Shared link' : 'Community');
    if ((first === 'user' || first === 'u') && second) return reddit('u/' + second, 'Profile');
    return reddit(host === 'redd.it' ? 'Shared Reddit post' : fallback);
  }
  if (matches('twitter.com','mobile.twitter.com','x.com','mobile.x.com')) {
    const status = parts.indexOf('status');
    if (status !== -1 && /^\d+$/.test(parts[status + 1] || '')) {
      return card('X / Twitter', '#8795a1', first === 'i' ? 'Post on X' : 'Post by @' + first, 'Post ' + parts[status + 1]);
    }
    if (first === 'i' && second === 'spaces') return card('X / Twitter', '#8795a1', 'X Space');
    const profile = parts.length === 1 && !/^(home|search|explore|messages|notifications|settings|i)$/.test(first);
    return card('X / Twitter', '#8795a1', profile ? '@' + first : fallback, profile ? 'Profile' : undefined);
  }
  if (matches('instagram.com','m.instagram.com')) {
    const types: Record<string,string> = {p:'Post', reel:'Reel', reels:'Reel', tv:'Video'};
    const index = Object.hasOwn(types, first) ? 0 : 1;
    const type = types[parts[index] || ''];
    if (type && Object.hasOwn(types, parts[index] || '') && parts[index + 1]) return card('Instagram', '#d94d94', index ? type + ' by @' + first : 'Instagram ' + type.toLowerCase(), parts[index + 1]);
    if (first === 'stories' && second) return card('Instagram', '#d94d94', 'Story by @' + second);
    return card('Instagram', '#d94d94', parts.length === 1 ? '@' + first : fallback);
  }
  if (matches('tiktok.com','m.tiktok.com','vm.tiktok.com','vt.tiktok.com')) {
    if (first.startsWith('@')) return card('TikTok', '#25bdbb', second === 'video' ? 'Video by ' + first :
      second === 'photo' ? 'Photos by ' + first : first, third || 'Creator');
    return card('TikTok', '#25bdbb', 'Shared TikTok link');
  }
  if (matches('youtube.com','m.youtube.com','music.youtube.com','youtu.be','youtube-nocookie.com')) {
    const id = host === 'youtu.be' ? first : first === 'watch' ? url.searchParams.get('v') :
      ['shorts','live','embed'].includes(first) ? second : '';
    const site = host === 'music.youtube.com' ? 'YouTube Music' : 'YouTube';
    if (id && /^[\w-]{11}$/.test(id)) {
      const result = card(site, '#f33d43', first === 'shorts' ? 'YouTube Short' : first === 'live' ? 'YouTube livestream' : site + ' video');
      result.lookup = 'https://www.youtube.com/watch?v=' + id;
      result.artwork = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
      return result;
    }
    return card(site, '#f33d43', first === 'playlist' ? 'YouTube playlist' : fallback, first.startsWith('@') ? 'Channel' : undefined);
  }

  if (matches('en.wikipedia.org','wikipedia.org') || /^[a-z0-9-]+(?:\.m)?\.wikipedia\.org$/.test(host))
    return card('Wikipedia', '#8597aa', first === 'wiki' && second ? parts.slice(1).join('/').replaceAll('_', ' ') : fallback, 'Encyclopedia');
  if (matches('stackoverflow.com','superuser.com','serverfault.com') || /^[\w.-]+\.stackexchange\.com$/.test(host))
    return card(host === 'stackoverflow.com' ? 'Stack Overflow' : host, '#ed902f', first === 'questions' && third ? readable(third) : fallback,
      ['q','questions'].includes(first) && /^\d+$/.test(second) ? 'Question #' + second : undefined);
  if (matches('open.spotify.com')) {
    const offset = /^intl-[a-z-]+$/i.test(first) ? 1 : 0;
    const type = parts[offset] === 'embed' ? parts[offset + 1] : parts[offset];
    return card('Spotify', '#1db954', type && ['track','album','artist','playlist','episode','show'].includes(type) ? 'Spotify ' + type : fallback);
  }
  if (matches('bsky.app') && first === 'profile' && second)
    return card('Bluesky', '#398aff', third === 'post' ? 'Post by ' + second : second, third === 'post' ? undefined : 'Profile');
  if (matches('twitch.tv','m.twitch.tv','clips.twitch.tv'))
    return card('Twitch', '#a970ff', host === 'clips.twitch.tv' || second === 'clip' ? 'Twitch clip' :
      first === 'videos' ? 'Twitch video' : first || 'Twitch', second === 'clip' ? first : undefined);
  if (matches('soundcloud.com','m.soundcloud.com') && first && second)
    return card('SoundCloud', '#ff7700', readable(last!), first + (second === 'sets' ? ' · Playlist' : ''));
  if (matches('docs.google.com')) {
    const product: Record<string,string> = {document:'Google Docs',spreadsheets:'Google Sheets',presentation:'Google Slides',forms:'Google Forms'};
    if (Object.hasOwn(product, first)) return card(product[first]!, '#528bf0', {document:'Shared document',spreadsheets:'Shared spreadsheet',presentation:'Shared presentation',forms:'Shared form'}[first]!);
  }

  if (matches('facebook.com','m.facebook.com','mbasic.facebook.com','fb.watch')) {
    const type = host === 'fb.watch' || first === 'watch' ? 'Video' : first === 'reel' ? 'Reel' :
      first === 'groups' && second ? 'Group' : second === 'posts' || first === 'permalink.php' ? 'Post' : '';
    return card('Facebook', '#4285ef', type ? 'Facebook ' + type.toLowerCase() : fallback,
      type === 'Group' ? second : second === 'posts' ? first : undefined);
  }
  if (matches('threads.com','threads.net') && first.startsWith('@'))
    return card('Threads', '#888888', second === 'post' ? 'Post by ' + first : first);
  if (matches('vimeo.com','player.vimeo.com') && /^\d+$/.test(last || ''))
    return card('Vimeo', '#43b8dc', 'Vimeo video', 'Video ' + last);
  if (matches('discord.gg') || matches('discord.com') && first === 'invite')
    return card('Discord', '#7985ff', 'Server invite', host === 'discord.gg' ? first : second);
  if (matches('discord.com') && first === 'channels' && third)
    return card('Discord', '#7985ff', fourth ? 'Discord message' : 'Discord channel');
  if (matches('gitlab.com')) {
    const divider = parts.indexOf('-');
    const kind = parts[divider + 1];
    const number = parts[divider + 2];
    if (divider >= 2 && number && /^\d+$/.test(number) && (kind === 'merge_requests' || kind === 'issues'))
      return card('GitLab', '#ef813b', kind === 'issues' ? 'Issue #' + number : 'Merge request !' + number, parts.slice(0, divider).join('/'));
  }
  if (matches('npmjs.com') && first === 'package' && second)
    return card('npm', '#d95353', second.startsWith('@') && third ? second + '/' + third : second, 'Package');
  if (matches('store.steampowered.com') && first === 'app' && second)
    return card('Steam', '#548aae', third ? readable(third) : 'Steam app ' + second, 'Store page');
  if (matches('google.com','maps.google.com') && first === 'maps' && second === 'place' && third)
    return card('Google Maps', '#40aa70', third.replaceAll('+',' '), 'Place');
  if (matches('news.ycombinator.com') && first === 'item' && url.searchParams.has('id'))
    return card('Hacker News','#f07b38','Discussion #' + url.searchParams.get('id'));
  if (/^[a-z0-9-]+\.bandcamp\.com$/.test(host) && ['album','track'].includes(first) && second)
    return card('Bandcamp','#40a6ad',readable(second),host.split('.')[0] + ' · ' + first);

  // Domains where an opaque share ID cannot tell us the author or page title.
  for (const [name, color, domains] of platforms) {
    if (domains.includes(host)) return card(name, color, !last || opaque(last) || shortHosts.has(host) ? name + ' link' : readable(last), url.host);
  }
  const context = [url.host, ...parts.slice(0,-1)].join(' › ');
  const title = !last && url.searchParams.get('q') || fallback;
  return { site: url.host, title, context };
}

const opaque = (part: string) => /^\d+$/.test(part) || /^[\w-]{15,}$/.test(part) && /\d/.test(part);
const shortHosts = new Set(['t.co','pin.it','spoti.fi','spotify.link','on.soundcloud.com','fb.watch','discord.gg','maps.app.goo.gl','amzn.to','lnkd.in']);
const platforms: [string,string,string[]][] = [
  ['Facebook','#4285ef',['facebook.com','m.facebook.com','fb.watch']],
  ['Threads','#888888',['threads.com','threads.net']],
  ['LinkedIn','#398bc6',['linkedin.com','lnkd.in']],
  ['Pinterest','#e64c58',['pinterest.com','pin.it']],
  ['X / Twitter','#8795a1',['t.co']],
  ['Spotify','#1db954',['spoti.fi','spotify.link']],
  ['Apple Music','#f75973',['music.apple.com']],
  ['Apple Podcasts','#ad64ef',['podcasts.apple.com']],
  ['SoundCloud','#ff7700',['soundcloud.com','m.soundcloud.com','on.soundcloud.com']],
  ['Vimeo','#43b8dc',['vimeo.com','player.vimeo.com']],
  ['Discord','#7985ff',['discord.com','discord.gg']],
  ['GitLab','#ef813b',['gitlab.com']],
  ['Bitbucket','#4c91f9',['bitbucket.org']],
  ['npm','#d95353',['npmjs.com']],
  ['Hugging Face','#edb93d',['huggingface.co']],
  ['Figma','#a878ee',['figma.com']],
  ['Google Drive','#40aa70',['drive.google.com']],
  ['Google Maps','#40aa70',['maps.google.com','maps.app.goo.gl']],
  ['MDN Web Docs','#719dff',['developer.mozilla.org']],
  ['Steam','#548aae',['store.steampowered.com','steamcommunity.com']],
  ['Internet Archive','#a0a0a0',['archive.org']],
  ['Amazon','#e8a647',['amazon.com','amzn.to']],
  ['Bandcamp','#40a6ad',['bandcamp.com']],
];
