import { makeBookRepoMock } from '@testutils/makeBookRepoMock';

import { rejectRequestUseCase } from '@/domain/usecases/rejectRequest';

describe('usecase: rejectRequestUseCase', () => {
  const bookId = 'book-1';
  const ownerId = 'owner-1';

  it('llama repo.rejectRequest(bookId, ownerId)', async () => {
    const repo = makeBookRepoMock({
      rejectRequest: jest.fn().mockResolvedValue(undefined),
    });

    const rejectRequest = rejectRequestUseCase(repo);
    await expect(rejectRequest({ bookId, ownerId })).resolves.toBeUndefined();
    expect(repo.rejectRequest).toHaveBeenCalledWith(bookId, ownerId);
  });

  it('propaga errores del repositorio', async () => {
    const repo = makeBookRepoMock({
      rejectRequest: jest.fn().mockRejectedValue(new Error('INVALID_STATE')),
    });

    const rejectRequest = rejectRequestUseCase(repo);
    await expect(rejectRequest({ bookId, ownerId })).rejects.toThrow(/INVALID_STATE/);
  });
});
