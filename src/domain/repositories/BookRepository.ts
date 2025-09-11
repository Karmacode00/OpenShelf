import { Loan } from '../entities/Loan';

import { Book } from '@/domain/entities/Book';

export type AddBookInput = {
  title: string;
  author: string;
  imageUri: string;
  ownerId: string;
};

export interface BookRepository {
  addBook(input: AddBookInput): Promise<Book>;
  deleteBook(bookId: string, ownerId: string): Promise<void>;
  getByOwner(ownerId: string): Promise<Book[]>;
  searchNearbyPublic(params: {
    center: { latitude: number; longitude: number };
    radiusKm: number;
    limitNum?: number;
    excludeOwnerId?: string;
    showBorrowed?: boolean;
    queryText?: string;
  }): Promise<(Book & { distanceKm: number })[]>;
  requestBook(bookId: string, requesterId: string): Promise<void>;
  getByBorrower(borrowerId: string): Promise<Book[]>;
  getLoansByBorrower(
    borrowerId: string,
    opts?: { activeOnly?: boolean; limit?: number },
  ): Promise<
    (Loan & {
      book: Pick<Book, 'id' | 'title' | 'author' | 'imageUrl' | 'status' | 'returnRequested'>;
    })[]
  >;
  cancelRequest(bookId: string, borrowerId: string): Promise<void>;
  acceptRequest(bookId: string, ownerId: string): Promise<void>;
  rejectRequest(bookId: string, ownerId: string): Promise<void>;
  requestReturn(bookId: string, borrowerId: string): Promise<void>;
  confirmReturn(bookId: string, ownerId: string): Promise<void>;
  rejectReturn(bookId: string, ownerId: string): Promise<void>;
}
