
import { BottomNav } from "@/components/bottom-nav";
import { DesktopNav } from "@/components/desktop-nav";
import { ModeToggle } from "@/components/mode-toggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="md:hidden p-4 border-b flex justify-between items-center bg-background sticky top-0 z-10">
        <h1 className="text-xl font-bold">SajiTrack</h1>
        <ModeToggle />
      </div>
      <DesktopNav />
      <main className="flex-1 pb-16 md:pb-0 md:pl-64">
        {children}
      </main>
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
