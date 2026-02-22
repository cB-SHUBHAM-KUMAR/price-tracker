const { _private } = require('../../../src/schedulers/alertScheduler');

describe('alertScheduler._private.isConditionMet', () => {
  it('matches below condition', () => {
    expect(_private.isConditionMet({ condition: 'below', targetPrice: 100 }, 99)).toBe(true);
    expect(_private.isConditionMet({ condition: 'below', targetPrice: 100 }, 101)).toBe(false);
  });

  it('matches above condition', () => {
    expect(_private.isConditionMet({ condition: 'above', targetPrice: 100 }, 101)).toBe(true);
    expect(_private.isConditionMet({ condition: 'above', targetPrice: 100 }, 99)).toBe(false);
  });

  it('matches equals condition using tolerance', () => {
    expect(_private.isConditionMet({ condition: 'equals', targetPrice: 100 }, 100)).toBe(true);
    expect(_private.isConditionMet({ condition: 'equals', targetPrice: 100 }, 100.4)).toBe(true);
    expect(_private.isConditionMet({ condition: 'equals', targetPrice: 100 }, 101)).toBe(false);
  });
});
