import { Bell, UserCircle } from "lucide-react";

export const Header = () => {
  return (
    <header className="h-16 glass border-b sticky top-0 z-40 flex items-center justify-between px-8">
      <div className="flex-1">
        <h2 className="text-sm font-medium text-muted-foreground hidden sm:block">
          Workspace / Auto WP Publisher
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white cursor-pointer hover:ring-2 ring-primary/50 transition-all">
          <UserCircle className="w-5 h-5" />
        </div>
      </div>
    </header>
  );
};
