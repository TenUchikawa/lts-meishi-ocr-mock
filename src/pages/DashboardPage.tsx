import { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Eye,
  Edit2,
  Trash2,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Filter,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import { StatusBadge } from '../components/StatusBadge';
import { useBusinessCards } from '../context/BusinessCardContext';
import type { BusinessCard, CardStatus } from '../types';

export function DashboardPage() {
  const { getCards, updateCard, deleteCard, exportToCSV } = useBusinessCards();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CardStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selectedCard, setSelectedCard] = useState<BusinessCard | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<BusinessCard>>({});
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const paginatedData = useMemo(() => {
    return getCards({ page, pageSize, search, status: statusFilter });
  }, [getCards, page, pageSize, search, statusFilter]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilter = (status: CardStatus | 'all') => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleView = (card: BusinessCard) => {
    setSelectedCard(card);
    setIsViewModalOpen(true);
  };

  const handleEdit = (card: BusinessCard) => {
    setSelectedCard(card);
    setEditFormData({
      companyName: card.companyName,
      personName: card.personName,
      department: card.department,
      position: card.position,
      email: card.email,
      phone: card.phone,
      address: card.address,
      website: card.website,
      status: card.status,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedCard) {
      updateCard(selectedCard.id, editFormData);
      setIsEditModalOpen(false);
      setSelectedCard(null);
    }
  };

  const handleDeleteClick = (card: BusinessCard) => {
    setSelectedCard(card);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedCard) {
      deleteCard(selectedCard.id);
      setIsDeleteConfirmOpen(false);
      setSelectedCard(null);
    }
  };

  const handleExportCSV = () => {
    const csv = exportToCSV();
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `名刺データ_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">名刺一覧</h1>
            <p className="text-gray-500 mt-1">
              全{paginatedData.total}件の名刺データ
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            CSVエクスポート
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="会社名、氏名、メールアドレスで検索..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value as CardStatus | 'all')}
                className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white min-w-[150px]"
              >
                <option value="all">すべて</option>
                <option value="verified">確認済み</option>
                <option value="unverified">未確認</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    会社名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    氏名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    部署・役職
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    連絡先
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    登録日
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedData.data.map((card) => (
                  <tr key={card.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {card.companyName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{card.personName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        <div>{card.department}</div>
                        <div className="text-gray-500">{card.position}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {card.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {card.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={card.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {new Date(card.createdAt).toLocaleDateString('ja-JP')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(card)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="詳細"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(card)}
                          className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="編集"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(card)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paginatedData.data.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500">
              該当する名刺データがありません
            </div>
          )}

          {paginatedData.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={page}
                totalPages={paginatedData.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="名刺詳細"
        size="lg"
      >
        {selectedCard && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs font-medium text-gray-500 uppercase">会社名</label>
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{selectedCard.companyName}</span>
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs font-medium text-gray-500 uppercase">氏名</label>
                <div className="flex items-center gap-2 mt-1">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{selectedCard.personName}</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">部署</label>
                <p className="text-gray-900 mt-1">{selectedCard.department}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">役職</label>
                <p className="text-gray-900 mt-1">{selectedCard.position}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">メールアドレス</label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{selectedCard.email}</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">電話番号</label>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{selectedCard.phone}</span>
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 uppercase">住所</label>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{selectedCard.address}</span>
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 uppercase">Webサイト</label>
                <div className="flex items-center gap-2 mt-1">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <a
                    href={selectedCard.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {selectedCard.website}
                  </a>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">ステータス</label>
                <div className="mt-1">
                  <StatusBadge status={selectedCard.status} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">OCR信頼度</label>
                <p className="text-gray-900 mt-1">
                  {(selectedCard.ocrText.confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                閉じる
              </button>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEdit(selectedCard);
                }}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                編集する
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="名刺編集"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">会社名</label>
              <input
                type="text"
                value={editFormData.companyName || ''}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, companyName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">氏名</label>
              <input
                type="text"
                value={editFormData.personName || ''}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, personName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">部署</label>
              <input
                type="text"
                value={editFormData.department || ''}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, department: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">役職</label>
              <input
                type="text"
                value={editFormData.position || ''}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, position: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                value={editFormData.email || ''}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
              <input
                type="tel"
                value={editFormData.phone || ''}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, phone: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
              <input
                type="text"
                value={editFormData.address || ''}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, address: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Webサイト</label>
              <input
                type="url"
                value={editFormData.website || ''}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, website: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
              <select
                value={editFormData.status || 'unverified'}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    status: e.target.value as CardStatus,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="unverified">未確認</option>
                <option value="verified">確認済み</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              保存する
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="削除確認"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            「{selectedCard?.personName}」（{selectedCard?.companyName}）の名刺データを削除しますか？
          </p>
          <p className="text-sm text-red-600">この操作は取り消せません。</p>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              削除する
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
