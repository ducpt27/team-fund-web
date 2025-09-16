import { Button } from '@/components/ui/button';
import { Users, Calendar, DollarSign, Calculator } from 'lucide-react';

type View = 'members' | 'sessions' | 'funds' | 'calculator';

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const navItems = [
    { key: 'members' as View, label: 'Thành viên', icon: Users },
    { key: 'sessions' as View, label: 'Lịch sử đánh', icon: Calendar },
    { key: 'funds' as View, label: 'Quỹ đội', icon: DollarSign },
    { key: 'calculator' as View, label: 'Tính tiền', icon: Calculator },
  ];

  return (
    <nav className="flex flex-wrap gap-2">
      {navItems.map(({ key, label, icon: Icon }) => (
        <Button
          key={key}
          variant={currentView === key ? 'default' : 'outline'}
          onClick={() => onViewChange(key)}
          className="flex items-center gap-2"
        >
          <Icon className="w-4 h-4" />
          {label}
        </Button>
      ))}
    </nav>
  );
}
