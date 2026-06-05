import { useState, useEffect, useCallback } from 'react';
import { ChatProvider, useChat } from './store/chatStore';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';

function ChatApp() {
  const { state } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close sidebar when switching chat on mobile
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [state.activeChat?.id, state.activeChat?.type, isMobile]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  if (!state.isLoggedIn) {
    return <Login />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-gray-900">
      {/* Desktop Sidebar - always visible on desktop */}
      {!isMobile && (
        <Sidebar isMobile={false} onClose={() => {}} />
      )}

      {/* Mobile Sidebar Drawer */}
      {isMobile && (
        <>
          {/* Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 transition-opacity"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          {/* Drawer */}
          <div
            className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] z-50 transform transition-transform duration-300 ease-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <Sidebar isMobile={true} onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Main Chat Area */}
      <ChatArea
        isMobile={isMobile}
        onToggleSidebar={toggleSidebar}
      />
    </div>
  );
}

export default function App() {
  return (
    <ChatProvider>
      <ChatApp />
    </ChatProvider>
  );
}
