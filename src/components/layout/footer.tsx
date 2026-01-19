import Link from 'next/link';
import { Music } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Music className="h-6 w-6" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Contee. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
            이용약관
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
            개인정보처리방침
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
