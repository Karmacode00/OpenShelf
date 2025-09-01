import { Location, UserProfile } from '../entities/UserProfile';

export interface UserRepository {
  getUserLocation(userId: string): Promise<Location | null>;
  saveUserLocation(userId: string, location: Location): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  rateUser(raterId: string, ratedId: string, rating: number, comment?: string): Promise<void>;
  getUserRatingScore(userId: string): Promise<number | null>;
  upsertProfile(user: UserProfile): Promise<void>;
}
