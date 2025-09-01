import { makeBookRepoMock } from '@testutils/makeBookRepoMock';

import { acceptRequestUseCase } from '@/domain/usecases/acceptRequest';

describe('usecase: acceptRequestUseCase', () => {
  const bookId = 'book-1';
  const ownerId = 'owner-1';

  it('llama repo.acceptRequest con los argumentos correctos y resuelve', async () => {
    const repo = makeBookRepoMock({
      acceptRequest: jest.fn().mockResolvedValue(undefined),
    });

    const acceptRequest = acceptRequestUseCase(repo);
    await expect(acceptRequest({ bookId, ownerId })).resolves.toBeUndefined();

    expect(repo.acceptRequest).toHaveBeenCalledTimes(1);
    expect(repo.acceptRequest).toHaveBeenCalledWith(bookId, ownerId);
  });

  it('propaga el error del repositorio', async () => {
    const repo = makeBookRepoMock({
      acceptRequest: jest.fn().mockRejectedValue(new Error('FORBIDDEN')),
    });

    const acceptRequest = acceptRequestUseCase(repo);
    await expect(acceptRequest({ bookId, ownerId })).rejects.toThrow(/FORBIDDEN/);

    expect(repo.acceptRequest).toHaveBeenCalledWith(bookId, ownerId);
  });

  it('puede ejecutarse varias veces (idempotencia a nivel de llamada)', async () => {
    const repo = makeBookRepoMock({
      acceptRequest: jest.fn().mockResolvedValue(undefined),
    });

    const acceptRequest = acceptRequestUseCase(repo);
    await acceptRequest({ bookId: 'b1', ownerId: 'o1' });
    await acceptRequest({ bookId: 'b2', ownerId: 'o2' });

    expect(repo.acceptRequest).toHaveBeenNthCalledWith(1, 'b1', 'o1');
    expect(repo.acceptRequest).toHaveBeenNthCalledWith(2, 'b2', 'o2');
  });
});
