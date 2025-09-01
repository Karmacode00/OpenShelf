import { makeBookRepoMock } from '@testutils/makeBookRepoMock';

import { cancelRequestUseCase } from '@/domain/usecases/cancelRequest';

describe('usecase: cancelRequestUseCase', () => {
  const bookId = 'book-1';
  const borrowerId = 'borrower-1';

  it('llama repo.cancelRequest(bookId, borrowerId)', async () => {
    const repo = makeBookRepoMock({
      cancelRequest: jest.fn().mockResolvedValue(undefined),
    });

    const cancelRequest = cancelRequestUseCase(repo);
    await expect(cancelRequest({ bookId, borrowerId })).resolves.toBeUndefined();
    expect(repo.cancelRequest).toHaveBeenCalledWith(bookId, borrowerId);
  });

  it('propaga errores del repositorio', async () => {
    const repo = makeBookRepoMock({
      cancelRequest: jest.fn().mockRejectedValue(new Error('NOT_REQUESTER')),
    });

    const cancelRequest = cancelRequestUseCase(repo);
    await expect(cancelRequest({ bookId, borrowerId })).rejects.toThrow(/NOT_REQUESTER/);
  });
});
