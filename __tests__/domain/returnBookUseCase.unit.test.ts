import { makeBookRepoMock } from '@testutils/makeBookRepoMock';

import { requestReturnBookUseCase } from '@/domain/usecases/requestReturnBook';

describe('usecase: returnBookUseCase', () => {
  const bookId = 'book-1';
  const borrowerId = 'borrower-1';

  it('llama repo.returnBook(bookId, borrowerId)', async () => {
    const repo = makeBookRepoMock({
      requestReturn: jest.fn().mockResolvedValue(undefined),
    });

    const requestReturnBook = requestReturnBookUseCase(repo);
    await expect(requestReturnBook({ bookId, borrowerId })).resolves.toBeUndefined();
    expect(repo.requestReturn).toHaveBeenCalledWith(bookId, borrowerId);
  });

  it('propaga errores del repositorio', async () => {
    const repo = makeBookRepoMock({
      requestReturn: jest.fn().mockRejectedValue(new Error('NOT_LOANED')),
    });

    const requestReturnBook = requestReturnBookUseCase(repo);
    await expect(requestReturnBook({ bookId, borrowerId })).rejects.toThrow(/NOT_LOANED/);
  });
});
