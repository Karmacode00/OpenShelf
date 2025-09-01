import type { UserRepository, UserLocation } from '@/domain/repositories/UserRepository';

export function makeUserRepoMock(
  overrides?: Partial<jest.Mocked<UserRepository>>,
): jest.Mocked<UserRepository> {
  const repo: jest.Mocked<UserRepository> = {
    getUserLocation: jest.fn<Promise<UserLocation | null>, [string]>().mockResolvedValue(null),
    saveUserLocation: jest.fn<Promise<void>, [string, UserLocation]>().mockResolvedValue(undefined),
    sendPasswordReset: jest.fn<Promise<void>, [string]>().mockResolvedValue(undefined),
    rateUser: jest
      .fn<Promise<void>, [string, string, number, string | undefined]>()
      .mockResolvedValue(undefined),
    getUserRatingScore: jest.fn<Promise<number | null>, [string]>().mockResolvedValue(null),
  };

  return Object.assign(repo, overrides);
}
