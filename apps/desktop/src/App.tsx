import { useState } from 'react';
import './App.css';
import { CharacterManagement } from './features/character';
import { LocationManagementPage } from './pages/location-page';

type Page = 'home' | 'characters' | 'events' | 'locations' | 'world';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'characters':
        return <CharacterManagement />;
      case 'locations':
        return <LocationManagementPage onBack={() => setCurrentPage('home')} />;
      default:
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
                  <button
                    onClick={() => setCurrentPage('characters')}
                    className="p-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    人物管理
                  </button>
                  <button className="p-3 bg-green-600 text-white rounded hover:bg-green-700 transition">
                    事件管理
                  </button>
                  <button
                    onClick={() => setCurrentPage('locations')}
                    className="p-3 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                  >
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
  };

  return (
    <div className="h-screen w-screen overflow-hidden">
      {currentPage === 'home' ? (
        renderPage()
      ) : (
        <div className="h-full flex flex-col">
          {/* 顶部导航栏 */}
          <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentPage('home')}
                className="text-gray-600 hover:text-gray-900 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-gray-900">
                {currentPage === 'characters' ? '人物管理' : currentPage === 'locations' ? '地点管理' : ''}
              </h1>
            </div>
            <nav className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage('characters')}
                className={`px-3 py-1.5 rounded text-sm transition ${
                  currentPage === 'characters'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                人物
              </button>
              <button
                onClick={() => setCurrentPage('events')}
                className="px-3 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-100 transition"
              >
                事件
              </button>
              <button
                onClick={() => setCurrentPage('locations')}
                className="px-3 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-100 transition"
              >
                地点
              </button>
              <button
                onClick={() => setCurrentPage('world')}
                className="px-3 py-1.5 rounded text-sm text-gray-600 hover:bg-gray-100 transition"
              >
                世界观
              </button>
            </nav>
          </header>

          {/* 页面内容 */}
          <main className="flex-1 overflow-hidden bg-gray-100 p-4">
            {renderPage()}
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
