export type Location = {
  latitude: number;
  longitude: number;
  formattedAddress?: string | null;
};

export type UserProfile = {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  location?: Location | null;
};
