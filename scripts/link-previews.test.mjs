import assert from 'node:assert/strict';
import test from 'node:test';
import { describeLink } from '../plugins/link-previews/platforms.ts';

const examples = [
  ['github.com/org/repo/pull/3/files?view=1#diff', 'GitHub', 'Pull request #3', 'org/repo'],
  ['github.com/org/repo/issues/42', 'GitHub', 'Issue #42'],
  ['github.com/org/repo/blob/main/src/main.ts', 'GitHub', 'main.ts'],
  ['old.reddit.com/r/space/comments/abc/a_new_moon/def', 'Reddit', 'a new moon', 'r/space · Comment'],
  ['redd.it/abc', 'Reddit', 'Shared Reddit post'],
  ['mobile.twitter.com/kari/status/12345?s=20', 'X / Twitter', 'Post by @kari'],
  ['x.com/i/web/status/12345', 'X / Twitter', 'Post on X'],
  ['www.instagram.com/kari/reel/ABC/?igsh=x', 'Instagram', 'Reel by @kari'],
  ['instagram.com/p/ABC/', 'Instagram', 'Instagram post'],
  ['m.tiktok.com/@kari/video/123', 'TikTok', 'Video by @kari'],
  ['vm.tiktok.com/abc/', 'TikTok', 'Shared TikTok link'],
  ['open.spotify.com/intl-fr/track/abc', 'Spotify', 'Spotify track'],
  ['fr.m.wikipedia.org/wiki/Syst%C3%A8me_solaire', 'Wikipedia', 'Système solaire'],
  ['docs.google.com/spreadsheets/d/abc/edit', 'Google Sheets', 'Shared spreadsheet'],
  ['gitlab.com/group/team/project/-/merge_requests/8', 'GitLab', 'Merge request !8', 'group/team/project'],
  ['www.npmjs.com/package/@org/widgets', 'npm', '@org/widgets'],
  ['instagram.com/foo/constructor/value', 'Instagram', 'value'],
  ['github.com.evil.example/org/repo/pull/2', 'github.com.evil.example', '2'],
  ['unknown.example/docs/caf%C3%A9-menu?lang=fr#top', 'unknown.example', 'café menu'],
  ['unknown.example/%xx', 'unknown.example', '%xx'],
];
for (const [input, site, title, context] of examples) {
  test(input, () => {
    const url = new URL('https://' + input);
    const original = url.href;
    const result = describeLink(url);
    assert.equal(result.site, site);
    assert.equal(result.title, title);
    if (context) assert.equal(result.context, context);
    assert.equal(url.href, original);
  });
}

test('YouTube share formats use the same metadata and thumbnail', () => {
  const id = 'jNQXAC9IVRw';
  for (const input of ['youtu.be/' + id + '?t=30', 'm.youtube.com/watch?v=' + id,
    'youtube.com/shorts/' + id, 'youtube-nocookie.com/embed/' + id]) {
    const result = describeLink(new URL('https://' + input));
    assert.equal(result.lookup, 'https://www.youtube.com/watch?v=' + id);
    assert.equal(result.artwork, 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg');
  }
});
