import { Section, SettingRow, SettingsPage, Switch } from '@yapmod/ui';

interface PopupRule {
  root: string;
  dismiss?: string;
}

interface PopupGroup {
  key: string;
  label: string;
  hint: string;
  rules: PopupRule[];
}

const groups: PopupGroup[] = [
  {
    key: 'install', label: 'App installation',
    hint: 'Desktop app promotions and mobile Add to Home Screen invitations.',
    rules: [
      { root: '.desktop-promo[role="dialog"]', dismiss: 'button.btn.ghost' },
      { root: '.install-nudge[role="dialog"]', dismiss: '.install-nudge-btns > button.secondary' },
    ],
  },
  {
    key: 'push', label: 'Notification invitations',
    hint: 'Desktop, mobile web and native push invitations, including the iPhone setup tip.',
    rules: [
      { root: '.notify-prompt[role="dialog"]', dismiss: 'button.btn.small.ghost' },
      // The iOS instructions have a single "Got it" button. The permission request
      // always has a second button; never activate its primary "Turn on" action.
      { root: '.notify-prompt.push-ask[role="dialog"]', dismiss: 'div > button.btn.small:only-child' },
      // Its "Not now" closes the entire recap, so hide just the inline invitation.
      { root: '.ret-card .ret-push[role="note"]' },
    ],
  },
  {
    key: 'offers', label: 'Plus and Creator Program offers',
    hint: 'Upgrade pitches and invitations to join the Creator Program.',
    rules: [
      { root: '.plus-nudge[role="dialog"]', dismiss: 'button.plus-nudge-x' },
      // Review updates share this class. Only the invitation opens /creator in a new tab.
      { root: '.creator-ping[role="dialog"]:has(.creator-ping-actions > a[href="/creator"][target="_blank"])',
        dismiss: '.creator-ping-actions > button.btn.ghost' },
    ],
  },
  {
    key: 'return', label: 'Welcome-back cards',
    hint: 'The activity recap and “Find your people” server recommendations.',
    rules: [{ root: '.ret-card[role="dialog"]', dismiss: '.ret-head > button.icon-btn.plain' }],
  },
  {
    key: 'tips', label: 'Discovery tips',
    hint: '“Did you know?” cards and the empty-server invitation reminder.',
    rules: [
      { root: 'aside.tip-card[role="status"]', dismiss: 'button.tip-x' },
      { root: '.alone-nudge[role="note"]' },
    ],
  },
  {
    key: 'onboarding', label: 'Getting started checklist',
    hint: 'The floating checklist, its launcher and its completion celebration.',
    rules: [{ root: 'button.gs-pill' }, { root: '.gs-card[role="dialog"]' }, { root: '.gs-party[role="status"]' }],
  },
  {
    key: 'shards', label: 'Shard announcements',
    hint: 'Reward popups and timed Shard event banners.',
    rules: [{ root: '.reward-pop[role="status"]' }, { root: '.shard-event-bar[role="status"]' }],
  },
];

export default function () {
  let stopObserving: (() => void) | undefined;
  let removeCss: (() => void) | undefined;
  const enabled = (key: string) => yapmod.storage[key] !== false;

  function applyRules() {
    stopObserving?.();
    removeCss?.();
    const hidden: string[] = [];
    const buttons: string[] = [];
    for (const group of groups) {
      if (!enabled(group.key)) continue;
      for (const { root, dismiss } of group.rules) {
        if (dismiss) {
          // Hide queued prompts only when their native dismiss control is present.
          hidden.push(root + ':has(' + dismiss + ')');
          buttons.push(root + ' ' + dismiss);
        } else {
          hidden.push(root);
        }
      }
    }
    removeCss = hidden.length ? yapmod.ui.injectCss(hidden.join(', ') + ' { display: none !important; }') : undefined;
    stopObserving = buttons.length ? yapmod.observe(buttons.join(', '), (button) => {
      if (button instanceof HTMLButtonElement && button.isConnected) button.click();
    }) : undefined;
  }

  return {
    onLoad() {
      applyRules();
      yapmod.settings.registerSection({
        id: 'quiet-popups', label: 'Quiet Popups',
        render: () => (
          <SettingsPage title="Quiet Popups" description="Choose which interruptions to silence. Yapin’ remembers its usual dismissals and snoozes.">
            <Section label="Silence these popups">
              {groups.map(group => (
                <SettingRow label={group.label} hint={group.hint}>
                  <Switch aria-label={group.label} checked={enabled(group.key)} onChange={value => {
                    yapmod.storage[group.key] = value;
                    applyRules();
                  }} />
                </SettingRow>
              ))}
            </Section>
          </SettingsPage>
        ),
      });
    },
    onUnload() {
      stopObserving?.();
      removeCss?.();
    },
  };
}
