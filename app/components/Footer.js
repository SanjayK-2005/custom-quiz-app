import Link from 'next/link';
import { Github, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background">
      <div className="container flex h-14 items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">
          Built with ❤️ by Sanjay
        </p>
        <div className="flex gap-2">
          <Link
            href="https://github.com/SanjayK-2005"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-5 w-5" />
          </Link>
          <Link
            href="https://www.linkedin.com/in/sanjay-aachla-nitp/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Linkedin className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
} 