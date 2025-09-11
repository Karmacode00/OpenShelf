export type BookStatus = 'available' | 'requested' | 'loaned';

export type Book = {
  id: string;
  title: string;
  author: string;
  imageUrl: string;
  ownerId: string;
  status: BookStatus;
  borrowerId?: string | null;
  createdAt?: Date;
  location: {
    latitude: number;
    longitude: number;
    formattedAddress: string | null;
  };
  geohash: string;
  returnRequested?: boolean;
};
