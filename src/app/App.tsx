import { useEffect, useState } from 'react';
import { fetchCountData, CountData } from './utils/mockDb';
import { Card, CardDescription, CardTitle } from './components/ui/card';
import { Skeleton } from './components/ui/skeleton';
import { RefreshCw, Clock } from 'lucide-react';
import { Button } from './components/ui/button';
import { ImageWithFallback } from './components/figma/ImageWithFallback';

function CongestionGauge({ value }: { value: number }) {
  const size = 130;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, value));
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-[130px] h-[130px]">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="#f8fafc"
          stroke="#a3a3a3"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f57c00"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[82px] h-[82px]">
          <div className="absolute left-0 top-4">
            <div className="w-6 h-6 rounded-full bg-orange-200 mx-auto" />
            <div className="w-9 h-7 bg-orange-200 rounded-t-2xl mt-1" />
          </div>

          <div className="absolute right-0 top-4">
            <div className="w-6 h-6 rounded-full bg-orange-200 mx-auto" />
            <div className="w-9 h-7 bg-orange-200 rounded-t-2xl mt-1" />
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-7 h-7 rounded-full bg-orange-500 mx-auto" />
            <div className="w-10 h-8 bg-orange-500 rounded-t-2xl mt-1" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState<CountData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // DBからデータを取得する関数
  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchCountData();
      setData(result);
      // 最新の更新時刻を取得
      if (result.length > 0) {
        const latestDate = result.reduce((latest, item) => {
          return new Date(item.updatedAt) > new Date(latest) ? item.updatedAt : latest;
        }, result[0].updatedAt);
        setLastUpdated(latestDate);
      }
    } catch (error) {
      console.error('データの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // コンポーネントマウント時にDBからデータを取得
    loadData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      loadData();
    }, 60000); // 1分ごとにデータを更新

    return () => clearInterval(timer);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getCongestionPercent = (minutes: number) => {
    if (minutes <= 10) return 25;
    if (minutes <= 20) return 50;
    if (minutes <= 30) return 75;
    return 90;
  };

  const getCongestionLabel = (minutes: number) => {
    if (minutes <= 10) return '空いている';
    if (minutes <= 20) return 'やや混雑';
    if (minutes <= 30) return '混雑';
    return 'かなり混雑';
  };

  // 全ての待ち時間から平均を算出
  const averageWaitMinutes = data.length > 0 
    ? Math.round(data.reduce((sum, item) => sum + item.waitMinutes, 0) / data.length)
    : 0;

  const congestion = getCongestionPercent(averageWaitMinutes);

  const cards = [
    {
      id: 1,
      value: `${data[0]?.waitMinutes || 15}分`,
      label: '待ち時間',
      icon: <Clock className="w-3 h-3" />,
    },
    {
      id: 2,
      value: getCongestionLabel(data[0]?.waitMinutes || 15),
      label: '込み具合',
      icon: <Clock className="w-3 h-3" />,
    },
    {
      id: 3,
      value: formatTime(new Date()),
      label: '現在時刻',
      icon: <Clock className="w-3 h-3" />,
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'rgba(20, 184, 166, 0.03)' }}
    >
      <header className="bg-black text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1749104953185-d171e149ccb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wYW55JTIwbG9nbyUyMG1pbmltYWx8ZW58MXx8fHwxNzc0OTA3NDg0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="ロゴ"
            className="h-10 w-10 object-cover rounded"
          />
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={loadData}
            disabled={loading}
            variant="outline"
            size="sm"
            className="bg-white text-black hover:bg-gray-200"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Update
          </Button>
        </div>
      </header>

      <div className="flex-1 flex items-center p-8">
        <div className="max-w-6xl mx-auto w-full">
          {loading ? (
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-center mb-8">
                <Skeleton className="w-[130px] h-[130px] rounded-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card
                    key={i}
                    className="hover:shadow-lg transition-shadow overflow-visible border-none bg-transparent"
                  >
                    <div
                      className="bg-black text-white py-6 rounded-t-lg relative"
                      style={{ borderRadius: '8px 8px 0 0' }}
                    >
                      <div className="text-center">
                        <Skeleton className="h-9 w-24 mx-auto bg-gray-700" />
                      </div>
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-white"
                        style={{
                          height: '30px',
                          borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
                          transform: 'translateY(50%)',
                        }}
                      />
                    </div>

                    <div
                      className="bg-white pt-6 pb-4 px-4 rounded-b-lg"
                      style={{ borderRadius: '0 0 8px 8px' }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Skeleton className="h-4 w-32 mx-auto" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-col items-center mb-8">
                <CongestionGauge value={congestion} />
                <div className="mt-3 text-sm font-medium text-gray-700">
                  混雑度 {congestion}%
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.map((item) => (
                  <Card
                    key={item.id}
                    className="hover:shadow-lg transition-shadow overflow-visible border-none bg-transparent"
                  >
                    <div
                      className="bg-black text-white py-6 rounded-t-lg relative"
                      style={{ borderRadius: '8px 8px 0 0' }}
                    >
                      <CardDescription className="text-3xl font-bold text-white text-center">
                        {item.waitMinutes}分
                      </CardDescription>
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-white"
                        style={{
                          height: '30px',
                          borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
                          transform: 'translateY(50%)',
                        }}
                      />
                    </div>

                    <div
                      className="bg-white pt-6 pb-4 px-4 rounded-b-lg"
                      style={{ borderRadius: '0 0 8px 8px' }}
                    >
                      <CardTitle className="flex items-center justify-center gap-2 text-xs text-black font-medium">
                        <Clock className="w-3 h-3" />
                        {item.name}
                      </CardTitle>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="mt-6 text-center text-xs text-gray-500 leading-6">
                ※混雑度は待ち時間をもとに算出しています。<br />
                10分以下: 空いている / 20分以下: やや混雑 / 30分以下: 混雑 / 31分以上: かなり混雑
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 px-6 py-4 mt-auto">
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          {lastUpdated && (
            <span className="text-sm text-gray-600">
              最終更新: {formatDate(lastUpdated)}
            </span>
          )}
        </div>
      </footer>
    </div>
  );
}