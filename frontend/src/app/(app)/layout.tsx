import { Sidebar } from "@/src/components/dashboard/sidebar";
import { MobileNav } from "@/src/components/dashboard/mobile-nav";
import { ExportProgressContainer } from "@/src/components/export-progress";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">
        {children}
      </div>
      <MobileNav />
      <ExportProgressContainer />
    </div>
  );
}
