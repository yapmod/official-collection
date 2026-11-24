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

  // plugins/quiet-popups/index.tsx
  var index_exports = {};
  __export(index_exports, {
    default: () => index_default
  });
  var {
    createComponent: _$createComponent
  } = yapmod.solidWeb;
  var {
    Section,
    SettingRow,
    SettingsPage,
    Switch
  } = yapmod.ui;
  var groups = [{
    key: "install",
    label: "App installation",
    hint: "Desktop app promotions and mobile Add to Home Screen invitations.",
    rules: [{
      root: '.desktop-promo[role="dialog"]',
      dismiss: "button.btn.ghost"
    }, {
      root: '.install-nudge[role="dialog"]',
      dismiss: ".install-nudge-btns > button.secondary"
    }]
  }, {
    key: "push",
    label: "Notification invitations",
    hint: "Desktop, mobile web and native push invitations, including the iPhone setup tip.",
    rules: [
      {
        root: '.notify-prompt[role="dialog"]',
        dismiss: "button.btn.small.ghost"
      },
      // The iOS instructions have a single "Got it" button. The permission request
      // always has a second button; never activate its primary "Turn on" action.
      {
        root: '.notify-prompt.push-ask[role="dialog"]',
        dismiss: "div > button.btn.small:only-child"
      },
      // Its "Not now" closes the entire recap, so hide just the inline invitation.
      {
        root: '.ret-card .ret-push[role="note"]'
      }
    ]
  }, {
    key: "offers",
    label: "Plus and Creator Program offers",
    hint: "Upgrade pitches and invitations to join the Creator Program.",
    rules: [
      {
        root: '.plus-nudge[role="dialog"]',
        dismiss: "button.plus-nudge-x"
      },
      // Review updates share this class. Only the invitation opens /creator in a new tab.
      {
        root: '.creator-ping[role="dialog"]:has(.creator-ping-actions > a[href="/creator"][target="_blank"])',
        dismiss: ".creator-ping-actions > button.btn.ghost"
      }
    ]
  }, {
    key: "return",
    label: "Welcome-back cards",
    hint: "The activity recap and \u201CFind your people\u201D server recommendations.",
    rules: [{
      root: '.ret-card[role="dialog"]',
      dismiss: ".ret-head > button.icon-btn.plain"
    }]
  }, {
    key: "tips",
    label: "Discovery tips",
    hint: "\u201CDid you know?\u201D cards and the empty-server invitation reminder.",
    rules: [{
      root: 'aside.tip-card[role="status"]',
      dismiss: "button.tip-x"
    }, {
      root: '.alone-nudge[role="note"]'
    }]
  }, {
    key: "onboarding",
    label: "Getting started checklist",
    hint: "The floating checklist, its launcher and its completion celebration.",
    rules: [{
      root: "button.gs-pill"
    }, {
      root: '.gs-card[role="dialog"]'
    }, {
      root: '.gs-party[role="status"]'
    }]
  }, {
    key: "shards",
    label: "Shard announcements",
    hint: "Reward popups and timed Shard event banners.",
    rules: [{
      root: '.reward-pop[role="status"]'
    }, {
      root: '.shard-event-bar[role="status"]'
    }]
  }];
  function index_default() {
    let stopObserving;
    let removeCss;
    const enabled = (key) => yapmod.storage[key] !== false;
    function applyRules() {
      stopObserving?.();
      removeCss?.();
      const hidden = [];
      const buttons = [];
      for (const group of groups) {
        if (!enabled(group.key)) continue;
        for (const {
          root,
          dismiss
        } of group.rules) {
          if (dismiss) {
            hidden.push(root + ":has(" + dismiss + ")");
            buttons.push(root + " " + dismiss);
          } else {
            hidden.push(root);
          }
        }
      }
      removeCss = hidden.length ? yapmod.ui.injectCss(hidden.join(", ") + " { display: none !important; }") : void 0;
      stopObserving = buttons.length ? yapmod.observe(buttons.join(", "), (button) => {
        if (button instanceof HTMLButtonElement && button.isConnected) button.click();
      }) : void 0;
    }
    return {
      onLoad() {
        applyRules();
        yapmod.settings.registerSection({
          id: "quiet-popups",
          label: "Quiet Popups",
          render: () => _$createComponent(SettingsPage, {
            title: "Quiet Popups",
            description: "Choose which interruptions to silence. Yapin\u2019 remembers its usual dismissals and snoozes.",
            get children() {
              return _$createComponent(Section, {
                label: "Silence these popups",
                get children() {
                  return groups.map((group) => _$createComponent(SettingRow, {
                    get label() {
                      return group.label;
                    },
                    get hint() {
                      return group.hint;
                    },
                    get children() {
                      return _$createComponent(Switch, {
                        get ["aria-label"]() {
                          return group.label;
                        },
                        get checked() {
                          return enabled(group.key);
                        },
                        onChange: (value) => {
                          yapmod.storage[group.key] = value;
                          applyRules();
                        }
                      });
                    }
                  }));
                }
              });
            }
          })
        });
      },
      onUnload() {
        stopObserving?.();
        removeCss?.();
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
