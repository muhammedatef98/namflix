/**
 * expo-notifications adds the `aps-environment` (push) entitlement on iOS.
 * Namflix only schedules LOCAL notifications (the bedtime reminder), which
 * need no push capability — and the App Store provisioning profile does not
 * include Push, so the entitlement makes the iOS build fail. Strip it.
 *
 * If remote push is ever added, delete this plugin and enable Push
 * Notifications on the App ID first.
 */
const { withEntitlementsPlist } = require('expo/config-plugins');

module.exports = function withoutPushEntitlement(config) {
  return withEntitlementsPlist(config, (cfg) => {
    delete cfg.modResults['aps-environment'];
    return cfg;
  });
};
