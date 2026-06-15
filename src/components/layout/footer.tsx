import Link from 'next/link';
import { Music } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contact" className="border-t border-border/80 bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:px-8">
        <div className="flex flex-col items-center gap-4 lg:flex-row lg:gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white">
            <Music className="h-4 w-4" />
          </div>
          <p className="text-center text-sm leading-loose text-muted-foreground lg:text-left">
            © {new Date().getFullYear()} Contee. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            이용약관
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            개인정보처리방침
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
