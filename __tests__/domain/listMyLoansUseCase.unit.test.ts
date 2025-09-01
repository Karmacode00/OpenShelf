import { makeBookRepoMock } from '@testutils/makeBookRepoMock';

import { listMyLoansUseCase } from '@/domain/usecases/listMyLoans';

describe('usecase: listMyLoansUseCase', () => {
  it('llama repo.getLoansByBorrower(borrowerId) sin opts por defecto', async () => {
    const repo = makeBookRepoMock({
      getLoansByBorrower: jest.fn().mockResolvedValue([]),
    });

    const listMyLoans = listMyLoansUseCase(repo as any);
    await listMyLoans('u1');

    expect(repo.getLoansByBorrower).toHaveBeenCalledWith('u1', undefined);
  });

  it('pasa opts cuando se proporcionan', async () => {
    const repo = makeBookRepoMock({
      getLoansByBorrower: jest.fn().mockResolvedValue([]),
    });

    const listMyLoans = listMyLoansUseCase(repo as any);
    await listMyLoans('u1', { activeOnly: true, limit: 10 });

    expect(repo.getLoansByBorrower).toHaveBeenCalledWith('u1', { activeOnly: true, limit: 10 });
  });
});
