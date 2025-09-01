import { makeBookRepoMock } from '@testutils/makeBookRepoMock';

import { searchNearbyBooksUseCase } from '@/domain/usecases/searchNearbyBooks';

describe('usecase: searchNearbyBooksUseCase', () => {
  it('pasa parámetros al repo.searchNearbyPublic y retorna resultados', async () => {
    const repo = makeBookRepoMock({
      searchNearbyPublic: jest.fn().mockResolvedValue([
        {
          id: 'b1',
          title: 'Clean Code',
          author: 'Robert C. Martin',
          imageUrl: '',
          status: 'available',
          distanceKm: 0.7,
        },
      ]),
    });

    const searchNearby = searchNearbyBooksUseCase(repo as any);
    const params = {
      center: { latitude: -33.45, longitude: -70.67 },
      radiusKm: 5,
      limitNum: 20,
      excludeOwnerId: 'o1',
      showBorrowed: false,
      queryText: 'clean',
    };
    const result = await searchNearby(params);

    expect(repo.searchNearbyPublic).toHaveBeenCalledWith(params);
    expect(result[0]).toMatchObject({ id: 'b1', distanceKm: expect.any(Number) });
  });
});
