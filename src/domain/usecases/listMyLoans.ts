import { Loan } from '../entities/Loan';

import type { Book } from '@/domain/entities/Book';
import type { BookRepository } from '@/domain/repositories/BookRepository';

export type LoanWithBook = Loan & {
  book: Pick<Book, 'id' | 'title' | 'author' | 'imageUrl' | 'status' | 'returnRequested'>;
};

export function listMyLoansUseCase(repo: BookRepository) {
  return (
    borrowerId: string,
    opts?: { activeOnly?: boolean; limit?: number },
  ): Promise<LoanWithBook[]> => repo.getLoansByBorrower(borrowerId, opts);
}
