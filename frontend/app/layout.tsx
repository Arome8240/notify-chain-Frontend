import { WebSocketProvider } from '@/lib/WebSocketContext';
import { ConnectionStatus } from '@/components/ConnectionStatus';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <WebSocketProvider url={process.env.NEXT_PUBLIC_WS_URL || 'wss://your-api.com/ws'}>
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <h1>Notify Chain</h1>
        <ConnectionStatus wsUrl={process.env.NEXT_PUBLIC_WS_URL || 'wss://your-api.com/ws'} />
      </header>
      <main>{children}</main>
    </WebSocketProvider>
  );
}