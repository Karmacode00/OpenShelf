import { makeBookRepoMock } from '@testutils/makeBookRepoMock';

import { addBookUseCase } from '@/domain/usecases/addBook';

describe('usecase: addBookUseCase', () => {
  it('llama repo.addBook y retorna el Book', async () => {
    const repo = makeBookRepoMock({
      addBook: jest.fn().mockResolvedValue({
        id: 'b1',
        title: 'Clean Code',
        author: 'Robert C. Martin',
        imageUrl: 'https://...',
        status: 'available',
      }),
    });

    const addBook = addBookUseCase(repo as any);
    const input = {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      imageUri: 'file://img.jpg',
      ownerId: 'o1',
    };

    const book = await addBook(input);

    expect(repo.addBook).toHaveBeenCalledWith(input);
    expect(book).toMatchObject({ id: 'b1', title: 'Clean Code', status: 'available' });
  });

  it('propaga errores del repositorio', async () => {
    const repo = makeBookRepoMock({
      addBook: jest.fn().mockRejectedValue(new Error('VALIDATION_ERROR')),
    });
    const addBook = addBookUseCase(repo as any);

    await expect(addBook({ title: '', author: '', imageUri: '', ownerId: 'o1' })).rejects.toThrow(
      /VALIDATION_ERROR/,
    );
  });
});
