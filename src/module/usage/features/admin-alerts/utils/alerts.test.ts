import { it, expect, describe } from 'vitest';

import {
  ALERT_WORDS,
  addThreshold,
  DEFAULT_SETTINGS,
  formFromSettings,
  settingsFromForm,
} from './alerts';

describe('alert settings form', () => {
  it('readsTheDefaults', () => {
    expect(formFromSettings(DEFAULT_SETTINGS)).toEqual({
      thresholds: [80, 90],
      words: [...ALERT_WORDS],
      runawayShare: '5',
      projectShare: '40',
    });
  });

  it('dropsUnknownPartsAndSortsThresholds', () => {
    const form = formFromSettings({
      alerts: '95, Stale 80,abc,0,101,80,7.5',
      runaway_share: 9,
      project_share: 30,
    });
    expect(form.thresholds).toEqual([80, 95]);
    expect(form.words).toEqual(['stale']);
  });

  it('roundTripsToTheServerFormat', () => {
    const form = formFromSettings({
      alerts: 'version,90,pace',
      runaway_share: 5,
      project_share: 40,
    });
    expect(settingsFromForm(form)).toEqual({
      alerts: '90,pace,version',
      runaway_share: 5,
      project_share: 40,
    });
    expect(settingsFromForm({ ...form, thresholds: [], words: [] })?.alerts).toBe('');
  });

  it('rejectsSharesOutsideOneToHundred', () => {
    const form = formFromSettings(DEFAULT_SETTINGS);
    expect(settingsFromForm({ ...form, runawayShare: '0' })).toBeNull();
    expect(settingsFromForm({ ...form, projectShare: '101' })).toBeNull();
    expect(settingsFromForm({ ...form, projectShare: '2.5' })).toBeNull();
    expect(settingsFromForm({ ...form, runawayShare: '' })).toBeNull();
  });

  it('addsOnlyNewWholePercents', () => {
    expect(addThreshold([80, 90], 85)).toEqual([80, 85, 90]);
    expect(addThreshold([80], 80)).toEqual([80]);
    expect(addThreshold([80], 0)).toEqual([80]);
    expect(addThreshold([80], 100.5)).toEqual([80]);
  });
});
