export type UserLocation = {
  latitude: number;
  longitude: number;
  formattedAddress?: string | null;
};

export interface UserRepository {
  getUserLocation(userId: string): Promise<UserLocation | null>;
  saveUserLocation(userId: string, location: UserLocation): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  rateUser(raterId: string, ratedId: string, rating: number): Promise<void>;
  getUserRatingScore(userId: string): Promise<number>;
}
