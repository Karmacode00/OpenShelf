// src/di/container.ts

import { BookRepositoryFirebase } from '@/data/repositories/BookRepositoryFirebase';
import { UserRepositoryFirebase } from '@/data/repositories/UserRepositoryFirebase';
import type { BookRepository } from '@/domain/repositories/BookRepository';
import type { UserRepository } from '@/domain/repositories/UserRepository';

let _bookRepo: BookRepository | null = null;
let _userRepo: UserRepository | null = null;

export function getBookRepository(): BookRepository {
  if (!_bookRepo) _bookRepo = new BookRepositoryFirebase();
  return _bookRepo;
}

export function getUserRepository(): UserRepository {
  if (!_userRepo) _userRepo = new UserRepositoryFirebase();
  return _userRepo;
}
