// モックデータベースのAPIをシミュレート
export interface CountData {
  id: string;
  name: string;
  waitMinutes: number;
  updatedAt: string;
}

// データベースから取得したことを模擬するデータ
const mockData: CountData[] = [
  { id: '1', name: '受付待ち時間', waitMinutes: 15, updatedAt: '2026-04-01T10:30:00Z' },
  { id: '2', name: '診察待ち時間', waitMinutes: 32, updatedAt: '2026-04-01T10:30:00Z' },
  { id: '3', name: '会計待ち時間', waitMinutes: 8, updatedAt: '2026-04-01T10:30:00Z' },
];

// DBからデータを取得することをシミュレート（非同期処理）
export async function fetchCountData(): Promise<CountData[]> {
  // 実際のAPIコールをシミュレート
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockData);
    }, 500); // 500msの遅延でネットワークリクエストを模擬
  });
}

// 特定のIDでデータを取得
export async function fetchCountById(id: string): Promise<CountData | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = mockData.find(item => item.id === id);
      resolve(data || null);
    }, 300);
  });
}