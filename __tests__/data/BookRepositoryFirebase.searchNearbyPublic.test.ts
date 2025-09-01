import * as fs from 'firebase/firestore';
import { geohashQueryBounds, distanceBetween } from 'geofire-common';

import { BookRepositoryFirebase } from '@/data/repositories/BookRepositoryFirebase';

function makeSnap(docs: { id: string; data: any }[]) {
  return {
    docs: docs.map((d) => ({
      id: d.id,
      data: () => d.data,
    })),
  };
}

describe('BookRepositoryFirebase.searchNearbyPublic', () => {
  const repo = new BookRepositoryFirebase();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('aplica bounds, dedupe, excludeOwnerId, sort por distancia y limit', async () => {
    (fs.collection as jest.Mock).mockReturnValue('/books');
    (geohashQueryBounds as jest.Mock).mockReturnValue([
      ['aaa', 'aaz'],
      ['aba', 'abz'],
    ]);

    (distanceBetween as jest.Mock).mockReturnValue(0.5);

    (fs.getDocs as jest.Mock)
      .mockResolvedValueOnce(
        makeSnap([
          {
            id: 'b1',
            data: {
              title: 'Clean Code',
              author: 'Uncle Bob',
              imageUrl: '',
              ownerId: 'ownerA',
              status: 'available',
              location: { latitude: -33.45, longitude: -70.67 },
            },
          },
          {
            id: 'b2',
            data: {
              title: 'DDD',
              author: 'Evans',
              imageUrl: '',
              ownerId: 'ownerX',
              status: 'requested',
              location: { latitude: -33.46, longitude: -70.68 },
            },
          },
        ]),
      )
      .mockResolvedValueOnce(
        makeSnap([
          {
            id: 'b1',
            data: {
              title: 'Clean Code',
              author: 'Uncle Bob',
              imageUrl: '',
              ownerId: 'ownerA',
              status: 'available',
              location: { latitude: -33.45, longitude: -70.67 },
            },
          },
          {
            id: 'b3',
            data: {
              title: 'Refactoring',
              author: 'Martin Fowler',
              imageUrl: '',
              ownerId: 'ownerB',
              status: 'available',
              location: { latitude: -33.47, longitude: -70.69 },
            },
          },
        ]),
      );

    const res = await repo.searchNearbyPublic({
      center: { latitude: -33.45, longitude: -70.67 },
      radiusKm: 2,
      excludeOwnerId: 'ownerX',
      limitNum: 2,
    });

    expect(res).toHaveLength(2);
    const ids = res.map((r) => r.id);
    expect(ids).toEqual(expect.arrayContaining(['b1', 'b3']));

    expect(res[0].distanceKm).toBeCloseTo(0.5);
    expect(res[1].distanceKm).toBeCloseTo(0.5);
  });
});
