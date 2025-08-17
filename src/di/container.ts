import { BookRepositoryFirebase } from '@/data/repositories/BookRepositoryFirebase';
import type { BookRepository } from '@/domain/repositories/BookRepository';

let _bookRepo: BookRepository | null = null;

export function getBookRepository(): BookRepository {
  if (!_bookRepo) _bookRepo = new BookRepositoryFirebase();
  return _bookRepo;
}
