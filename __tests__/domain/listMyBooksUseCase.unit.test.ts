import { makeBookRepoMock } from '@testutils/makeBookRepoMock';

import { listMyBooksUseCase } from '@/domain/usecases/listMyBooks';

describe('usecase: listMyBooksUseCase', () => {
  it('retorna libros del owner usando repo.getByOwner(ownerId)', async () => {
    const repo = makeBookRepoMock({
      getByOwner: jest
        .fn()
        .mockResolvedValue([
          { id: 'b1', title: 'Clean Code', author: 'Uncle Bob', imageUrl: '', status: 'available' },
        ]),
    });

    const listMyBooks = listMyBooksUseCase(repo as any);
    const books = await listMyBooks('o1');

    expect(repo.getByOwner).toHaveBeenCalledWith('o1');
    expect(books).toHaveLength(1);
    expect(books[0]).toMatchObject({ id: 'b1' });
  });
});
