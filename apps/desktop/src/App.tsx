import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          书中界
        </h1>
        <p className="text-center text-gray-600 mb-8">
          WorldInBooks - 小说辅助创作平台
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold text-blue-900">欢迎使用</h2>
            <p className="text-sm text-blue-700 mt-1">
              开始构建你的小说世界吧
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="p-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              人物管理
            </button>
            <button className="p-3 bg-green-600 text-white rounded hover:bg-green-700 transition">
              事件管理
            </button>
            <button className="p-3 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
              地点管理
            </button>
            <button className="p-3 bg-orange-600 text-white rounded hover:bg-orange-700 transition">
              世界观
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
