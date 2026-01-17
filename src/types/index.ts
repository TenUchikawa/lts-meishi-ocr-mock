export type CardStatus = 'unverified' | 'verified';

export interface BusinessCard {
  id: string;
  imageData: string;
  ocrText: OcrResult;
  companyName: string;
  personName: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  status: CardStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OcrResult {
  raw: string;
  confidence: number;
  extractedFields: {
    companyName?: string;
    personName?: string;
    department?: string;
    position?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DuplicateCandidate {
  existingCard: BusinessCard;
  similarity: number;
  matchedFields: string[];
}
