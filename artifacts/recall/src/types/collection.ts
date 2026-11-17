export interface Collection {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}
export interface Category {
  id: string;
  collectionId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
