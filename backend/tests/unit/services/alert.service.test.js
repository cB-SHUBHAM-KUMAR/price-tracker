jest.mock('../../../src/repositories/priceAlert.repository', () => ({
  create: jest.fn(),
  findByUser: jest.fn(),
  findByIdForUser: jest.fn(),
  updateByIdForUser: jest.fn(),
  deleteByIdForUser: jest.fn(),
  model: {
    aggregate: jest.fn(),
    find: jest.fn(),
  },
  markTriggered: jest.fn(),
}));

jest.mock('../../../src/config/logger.config', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const repository = require('../../../src/repositories/priceAlert.repository');
const alertService = require('../../../src/api/v1/services/alert.service');

describe('alert.service', () => {
  const userId = '507f1f77bcf86cd799439011';
  const alertId = '507f1f77bcf86cd799439012';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates alerts with user ownership and fallback email', async () => {
    repository.create.mockResolvedValue({ _id: alertId });

    await alertService.createAlert(
      userId,
      { title: 'Laptop', targetPrice: 90000, notifyEmail: '' },
      'owner@example.com'
    );

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        title: 'Laptop',
        notifyEmail: 'owner@example.com',
      })
    );
  });

  it('queries alerts scoped by user', async () => {
    repository.findByUser.mockResolvedValue({ data: [], total: 0 });

    await alertService.getAllAlerts(userId, { status: 'active', type: 'product' });

    expect(repository.findByUser).toHaveBeenCalledWith(
      userId,
      { status: 'active', type: 'product' },
      { sort: '-createdAt' }
    );
  });

  it('toggles status from active to paused for owned alerts', async () => {
    repository.findByIdForUser.mockResolvedValue({ _id: alertId, status: 'active' });
    repository.updateByIdForUser.mockResolvedValue({ _id: alertId, status: 'paused' });

    const result = await alertService.togglePause(userId, alertId);

    expect(repository.updateByIdForUser).toHaveBeenCalledWith(alertId, userId, { status: 'paused' });
    expect(result.status).toBe('paused');
  });
});
