import { Book } from '@/domain/entities/Book';

export type AddBookInput = {
  title: string;
  author: string;
  imageUri: string;
  ownerId: string;
};

export interface BookRepository {
  addBook(input: AddBookInput): Promise<Book>;
  getByOwner(ownerId: string): Promise<Book[]>;
  searchPublic(query: string, limit?: number): Promise<Book[]>;
  requestBook(bookId: string, requesterId: string): Promise<void>;
  getByBorrower(borrowerId: string): Promise<Book[]>;
  cancelRequest(bookId: string, borrowerId: string): Promise<void>;
  returnBook(bookId: string, borrowerId: string): Promise<void>;
}
