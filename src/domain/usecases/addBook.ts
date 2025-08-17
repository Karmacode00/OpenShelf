import type { Book } from '../entities/Book';
import type { BookRepository, AddBookInput } from '../repositories/BookRepository';

export function addBookUseCase(repo: BookRepository) {
  return (input: AddBookInput): Promise<Book> => repo.addBook(input);
}
