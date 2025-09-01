import { makeBookRepoMock } from '@testutils/makeBookRepoMock';

import { returnBookUseCase } from '@/domain/usecases/returnBook';

describe('usecase: returnBookUseCase', () => {
  const bookId = 'book-1';
  const borrowerId = 'borrower-1';

  it('llama repo.returnBook(bookId, borrowerId)', async () => {
    const repo = makeBookRepoMock({
      returnBook: jest.fn().mockResolvedValue(undefined),
    });

    const returnBook = returnBookUseCase(repo);
    await expect(returnBook({ bookId, borrowerId })).resolves.toBeUndefined();
    expect(repo.returnBook).toHaveBeenCalledWith(bookId, borrowerId);
  });

  it('propaga errores del repositorio', async () => {
    const repo = makeBookRepoMock({
      returnBook: jest.fn().mockRejectedValue(new Error('NOT_LOANED')),
    });

    const returnBook = returnBookUseCase(repo);
    await expect(returnBook({ bookId, borrowerId })).rejects.toThrow(/NOT_LOANED/);
  });
});
