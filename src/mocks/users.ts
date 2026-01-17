import type { User } from '../types';

export const mockUsers: User[] = [
  {
    id: 'user-001',
    email: 'admin@example.com',
    name: '管理者 太郎',
  },
];

export const mockCredentials = {
  email: 'admin@example.com',
  password: 'password123',
};
