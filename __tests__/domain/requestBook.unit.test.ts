import { makeBookRepoMock } from '@testutils/makeBookRepoMock';

import { requestBookUseCase } from '@/domain/usecases/requestBook';

describe('usecase: requestBookUseCase', () => {
  const bookId = 'book-1';
  const requesterId = 'user-borrower-1';

  it('llama repo.requestBook con los argumentos correctos y resuelve', async () => {
    const repo = makeBookRepoMock();

    const requestBook = requestBookUseCase(repo);
    await expect(requestBook({ bookId, requesterId })).resolves.toBeUndefined();

    expect(repo.requestBook).toHaveBeenCalledTimes(1);
    expect(repo.requestBook).toHaveBeenCalledWith(bookId, requesterId);
  });

  it('propaga el error del repositorio (ej: NOT_AVAILABLE)', async () => {
    const repo = makeBookRepoMock({
      requestBook: jest.fn().mockRejectedValue(new Error('NOT_AVAILABLE')),
    });

    const requestBook = requestBookUseCase(repo);
    await expect(requestBook({ bookId, requesterId })).rejects.toThrow(/NOT_AVAILABLE/);

    expect(repo.requestBook).toHaveBeenCalledTimes(1);
    expect(repo.requestBook).toHaveBeenCalledWith(bookId, requesterId);
  });

  it('puede ejecutarse varias veces, llamando al repo cada vez', async () => {
    const repo = makeBookRepoMock({
      requestBook: jest.fn().mockResolvedValue(undefined),
    });

    const requestBook = requestBookUseCase(repo);
    await requestBook({ bookId: 'b1', requesterId: 'u1' });
    await requestBook({ bookId: 'b2', requesterId: 'u2' });

    expect(repo.requestBook).toHaveBeenNthCalledWith(1, 'b1', 'u1');
    expect(repo.requestBook).toHaveBeenNthCalledWith(2, 'b2', 'u2');
  });
});
