import type { ChangeEvent } from 'react';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Image,
  Loader2,
  CheckCircle,
  AlertTriangle,
  X,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  RefreshCw,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { useBusinessCards } from '../context/BusinessCardContext';
import type { BusinessCard, OcrResult, DuplicateCandidate } from '../types';

type UploadStep = 'select' | 'processing' | 'review' | 'duplicate' | 'complete';

const mockOcrResults = [
  {
    companyName: '株式会社サンプルテック',
    personName: '山田 太郎',
    department: '営業部',
    position: '主任',
    email: 'taro.yamada@sample-tech.co.jp',
    phone: '03-1234-5678',
    address: '東京都千代田区丸の内1-1-1',
    website: 'https://sample-tech.co.jp',
  },
  {
    companyName: 'グローバルシステムズ株式会社',
    personName: '佐藤 美咲',
    department: '技術開発部',
    position: 'エンジニア',
    email: 'm.sato@global-systems.jp',
    phone: '06-9999-8888',
    address: '大阪府大阪市中央区本町2-3-4',
    website: 'https://global-systems.jp',
  },
  {
    companyName: 'イノベーション株式会社',
    personName: '鈴木 健太',
    department: '企画部',
    position: 'マネージャー',
    email: 'k.suzuki@innovation.co.jp',
    phone: '045-555-1234',
    address: '神奈川県横浜市西区北幸1-2-3',
    website: 'https://innovation.co.jp',
  },
];

export function UploadPage() {
  const navigate = useNavigate();
  const { addCard, findDuplicates, updateCard } = useBusinessCards();

  const [step, setStep] = useState<UploadStep>('select');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [extractedData, setExtractedData] = useState<Partial<BusinessCard>>({});
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const simulateOcr = useCallback(async () => {
    setStep('processing');

    // Simulate OCR processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Random mock result
    const mockData = mockOcrResults[Math.floor(Math.random() * mockOcrResults.length)];

    const result: OcrResult = {
      raw: JSON.stringify(mockData),
      confidence: 0.85 + Math.random() * 0.14,
      extractedFields: mockData,
    };

    setOcrResult(result);
    setExtractedData({
      companyName: mockData.companyName,
      personName: mockData.personName,
      department: mockData.department,
      position: mockData.position,
      email: mockData.email,
      phone: mockData.phone,
      address: mockData.address,
      website: mockData.website,
      status: 'unverified',
    });
    setStep('review');
  }, []);

  const handleSaveCard = useCallback(() => {
    if (!extractedData.email) return;

    // Check for duplicates
    const foundDuplicates = findDuplicates(extractedData.email);

    if (foundDuplicates.length > 0) {
      setDuplicates(foundDuplicates);
      setStep('duplicate');
      setIsDuplicateModalOpen(true);
    } else {
      // No duplicates, save directly
      saveAsNew();
    }
  }, [extractedData, findDuplicates]);

  const saveAsNew = useCallback(() => {
    if (!ocrResult) return;

    addCard({
      imageData: previewUrl || '',
      ocrText: ocrResult,
      companyName: extractedData.companyName || '',
      personName: extractedData.personName || '',
      department: extractedData.department || '',
      position: extractedData.position || '',
      email: extractedData.email || '',
      phone: extractedData.phone || '',
      address: extractedData.address || '',
      website: extractedData.website || '',
      status: 'unverified',
    });

    setStep('complete');
    setIsDuplicateModalOpen(false);
  }, [addCard, extractedData, ocrResult, previewUrl]);

  const handleUpdateExisting = useCallback(
    (existingCard: BusinessCard) => {
      updateCard(existingCard.id, {
        ...extractedData,
        status: 'unverified',
      });

      setStep('complete');
      setIsDuplicateModalOpen(false);
    },
    [updateCard, extractedData]
  );

  const resetUpload = useCallback(() => {
    setStep('select');
    setSelectedFile(null);
    setPreviewUrl(null);
    setOcrResult(null);
    setExtractedData({});
    setDuplicates([]);
  }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">名刺アップロード</h1>
          <p className="text-gray-500 mt-1">名刺画像をアップロードしてAI OCRで自動読み取り</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2">
          {['画像選択', 'OCR処理', '内容確認', '完了'].map((label, index) => {
            const stepIndex = ['select', 'processing', 'review', 'complete'].indexOf(step);
            const isActive = index <= stepIndex || (step === 'duplicate' && index <= 2);
            const isCurrent =
              (step === 'select' && index === 0) ||
              (step === 'processing' && index === 1) ||
              ((step === 'review' || step === 'duplicate') && index === 2) ||
              (step === 'complete' && index === 3);

            return (
              <div key={label} className="flex items-center gap-2">
                {index > 0 && (
                  <div
                    className={`w-12 h-0.5 ${isActive ? 'bg-blue-500' : 'bg-gray-300'}`}
                  />
                )}
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  {label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Step: Select */}
        {step === 'select' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                selectedFile
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {previewUrl ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-64 rounded-lg shadow-md"
                    />
                    <button
                      onClick={resetUpload}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">{selectedFile?.name}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      名刺画像をドラッグ&ドロップ
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      または
                      <label className="text-blue-600 hover:text-blue-700 cursor-pointer mx-1">
                        ファイルを選択
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                      してください
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    対応形式: JPG, PNG, GIF (最大10MB)
                  </p>
                </div>
              )}
            </div>

            {selectedFile && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={simulateOcr}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  OCR処理を開始
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step: Processing */}
        {step === 'processing' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="space-y-4">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900">AI OCR処理中...</p>
                <p className="text-sm text-gray-500 mt-1">
                  名刺画像を解析しています。しばらくお待ちください。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step: Review */}
        {(step === 'review' || step === 'duplicate') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">名刺画像</h3>
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Business Card"
                  className="w-full rounded-lg shadow-md"
                />
              )}
              {ocrResult && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    OCR信頼度:{' '}
                    <span className="font-medium text-gray-900">
                      {(ocrResult.confidence * 100).toFixed(1)}%
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Extracted Data Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">読み取り結果</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Building2 className="inline w-4 h-4 mr-1" />
                    会社名
                  </label>
                  <input
                    type="text"
                    value={extractedData.companyName || ''}
                    onChange={(e) =>
                      setExtractedData({ ...extractedData, companyName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="inline w-4 h-4 mr-1" />
                    氏名
                  </label>
                  <input
                    type="text"
                    value={extractedData.personName || ''}
                    onChange={(e) =>
                      setExtractedData({ ...extractedData, personName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      部署
                    </label>
                    <input
                      type="text"
                      value={extractedData.department || ''}
                      onChange={(e) =>
                        setExtractedData({ ...extractedData, department: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      役職
                    </label>
                    <input
                      type="text"
                      value={extractedData.position || ''}
                      onChange={(e) =>
                        setExtractedData({ ...extractedData, position: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="inline w-4 h-4 mr-1" />
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={extractedData.email || ''}
                    onChange={(e) =>
                      setExtractedData({ ...extractedData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="inline w-4 h-4 mr-1" />
                    電話番号
                  </label>
                  <input
                    type="tel"
                    value={extractedData.phone || ''}
                    onChange={(e) =>
                      setExtractedData({ ...extractedData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    住所
                  </label>
                  <input
                    type="text"
                    value={extractedData.address || ''}
                    onChange={(e) =>
                      setExtractedData({ ...extractedData, address: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Globe className="inline w-4 h-4 mr-1" />
                    Webサイト
                  </label>
                  <input
                    type="url"
                    value={extractedData.website || ''}
                    onChange={(e) =>
                      setExtractedData({ ...extractedData, website: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={resetUpload}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  やり直す
                </button>
                <button
                  onClick={handleSaveCard}
                  className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  保存する
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step: Complete */}
        {step === 'complete' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">登録完了</p>
                <p className="text-sm text-gray-500 mt-1">
                  名刺データが正常に登録されました。
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={resetUpload}
                  className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  続けてアップロード
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  名刺一覧へ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Duplicate Detection Modal */}
        <Modal
          isOpen={isDuplicateModalOpen}
          onClose={() => {
            setIsDuplicateModalOpen(false);
            setStep('review');
          }}
          title="重複データの検出"
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">
                  同じメールアドレスの名刺データが見つかりました
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  新規登録するか、既存データを更新するか選択してください。
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">既存の名刺データ:</p>
              {duplicates.map((dup) => (
                <div
                  key={dup.existingCard.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900">
                        {dup.existingCard.personName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {dup.existingCard.companyName}
                      </p>
                      <p className="text-sm text-gray-500">{dup.existingCard.email}</p>
                      <div className="mt-2">
                        <StatusBadge status={dup.existingCard.status} />
                      </div>
                    </div>
                    <button
                      onClick={() => handleUpdateExisting(dup.existingCard)}
                      className="px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      このデータを更新
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsDuplicateModalOpen(false);
                  setStep('review');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={saveAsNew}
                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                新規登録する
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
