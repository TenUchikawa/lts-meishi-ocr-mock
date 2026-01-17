import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback } from 'react';
import type { BusinessCard, PaginatedResponse, DuplicateCandidate, CardStatus } from '../types';
import { mockBusinessCards } from '../mocks/businessCards';

interface BusinessCardContextType {
  cards: BusinessCard[];
  getCards: (params: {
    page: number;
    pageSize: number;
    search?: string;
    status?: CardStatus | 'all';
  }) => PaginatedResponse<BusinessCard>;
  getCardById: (id: string) => BusinessCard | undefined;
  addCard: (card: Omit<BusinessCard, 'id' | 'createdAt' | 'updatedAt'>) => BusinessCard;
  updateCard: (id: string, updates: Partial<BusinessCard>) => BusinessCard | undefined;
  deleteCard: (id: string) => boolean;
  findDuplicates: (email: string, excludeId?: string) => DuplicateCandidate[];
  exportToCSV: () => string;
}

const BusinessCardContext = createContext<BusinessCardContextType | undefined>(undefined);

export function BusinessCardProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<BusinessCard[]>(mockBusinessCards);

  const getCards = useCallback(
    ({
      page,
      pageSize,
      search = '',
      status = 'all',
    }: {
      page: number;
      pageSize: number;
      search?: string;
      status?: CardStatus | 'all';
    }): PaginatedResponse<BusinessCard> => {
      let filteredCards = [...cards];

      if (search) {
        const searchLower = search.toLowerCase();
        filteredCards = filteredCards.filter(
          (card) =>
            card.companyName.toLowerCase().includes(searchLower) ||
            card.personName.toLowerCase().includes(searchLower) ||
            card.email.toLowerCase().includes(searchLower) ||
            card.department.toLowerCase().includes(searchLower) ||
            card.position.toLowerCase().includes(searchLower)
        );
      }

      if (status !== 'all') {
        filteredCards = filteredCards.filter((card) => card.status === status);
      }

      filteredCards.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const total = filteredCards.length;
      const totalPages = Math.ceil(total / pageSize);
      const startIndex = (page - 1) * pageSize;
      const data = filteredCards.slice(startIndex, startIndex + pageSize);

      return {
        data,
        total,
        page,
        pageSize,
        totalPages,
      };
    },
    [cards]
  );

  const getCardById = useCallback(
    (id: string): BusinessCard | undefined => {
      return cards.find((card) => card.id === id);
    },
    [cards]
  );

  const addCard = useCallback(
    (cardData: Omit<BusinessCard, 'id' | 'createdAt' | 'updatedAt'>): BusinessCard => {
      const now = new Date().toISOString();
      const newCard: BusinessCard = {
        ...cardData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      setCards((prev) => [newCard, ...prev]);
      return newCard;
    },
    []
  );

  const updateCard = useCallback(
    (id: string, updates: Partial<BusinessCard>): BusinessCard | undefined => {
      let updatedCard: BusinessCard | undefined;
      setCards((prev) =>
        prev.map((card) => {
          if (card.id === id) {
            updatedCard = {
              ...card,
              ...updates,
              updatedAt: new Date().toISOString(),
            };
            return updatedCard;
          }
          return card;
        })
      );
      return updatedCard;
    },
    []
  );

  const deleteCard = useCallback((id: string): boolean => {
    let deleted = false;
    setCards((prev) => {
      const newCards = prev.filter((card) => card.id !== id);
      deleted = newCards.length < prev.length;
      return newCards;
    });
    return deleted;
  }, []);

  const findDuplicates = useCallback(
    (email: string, excludeId?: string): DuplicateCandidate[] => {
      if (!email) return [];

      const emailLower = email.toLowerCase();
      const duplicates: DuplicateCandidate[] = [];

      cards.forEach((card) => {
        if (excludeId && card.id === excludeId) return;

        const matchedFields: string[] = [];
        let similarity = 0;

        if (card.email.toLowerCase() === emailLower) {
          matchedFields.push('email');
          similarity += 0.8;
        }

        if (matchedFields.length > 0) {
          duplicates.push({
            existingCard: card,
            similarity,
            matchedFields,
          });
        }
      });

      return duplicates.sort((a, b) => b.similarity - a.similarity);
    },
    [cards]
  );

  const exportToCSV = useCallback((): string => {
    const headers = [
      '会社名',
      '氏名',
      '部署',
      '役職',
      'メールアドレス',
      '電話番号',
      '住所',
      'Webサイト',
      'ステータス',
      '登録日時',
      '更新日時',
    ];

    const rows = cards.map((card) => [
      card.companyName,
      card.personName,
      card.department,
      card.position,
      card.email,
      card.phone,
      card.address,
      card.website,
      card.status === 'verified' ? '確認済み' : '未確認',
      new Date(card.createdAt).toLocaleString('ja-JP'),
      new Date(card.updatedAt).toLocaleString('ja-JP'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    return csvContent;
  }, [cards]);

  return (
    <BusinessCardContext.Provider
      value={{
        cards,
        getCards,
        getCardById,
        addCard,
        updateCard,
        deleteCard,
        findDuplicates,
        exportToCSV,
      }}
    >
      {children}
    </BusinessCardContext.Provider>
  );
}

export function useBusinessCards() {
  const context = useContext(BusinessCardContext);
  if (context === undefined) {
    throw new Error('useBusinessCards must be used within a BusinessCardProvider');
  }
  return context;
}
