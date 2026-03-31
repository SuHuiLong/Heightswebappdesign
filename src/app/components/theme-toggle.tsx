import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '../components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="h-9 px-3"
      style={{
        background: 'var(--surface-raised)',
        borderColor: 'var(--border)',
      }}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" style={{ color: 'var(--foreground)' }} />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" style={{ color: 'var(--foreground)' }} />
      <span className="sr-only">Toggle theme</span>
      <span className="ml-2 text-xs font-medium hidden dark:inline" style={{ color: 'var(--foreground)' }}>Light</span>
      <span className="ml-2 text-xs font-medium inline dark:hidden" style={{ color: 'var(--foreground)' }}>Dark</span>
    </Button>
  );
}
