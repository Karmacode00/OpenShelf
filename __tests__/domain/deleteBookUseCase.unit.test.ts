import { makeBookRepoMock } from '@testutils/makeBookRepoMock';

import { deleteBookUseCase } from '@/domain/usecases/deleteBook';

describe('usecase: deleteBookUseCase', () => {
  it('llama repo.deleteBook(bookId, ownerId)', async () => {
    const repo = makeBookRepoMock({ deleteBook: jest.fn().mockResolvedValue(undefined) });
    const del = deleteBookUseCase(repo as any);

    await expect(del('b1', 'o1')).resolves.toBeUndefined();
    expect(repo.deleteBook).toHaveBeenCalledWith('b1', 'o1');
  });

  it('propaga errores', async () => {
    const repo = makeBookRepoMock({
      deleteBook: jest.fn().mockRejectedValue(new Error('FORBIDDEN')),
    });
    const del = deleteBookUseCase(repo as any);

    await expect(del('b1', 'o1')).rejects.toThrow(/FORBIDDEN/);
  });
});
