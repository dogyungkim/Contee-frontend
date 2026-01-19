import Link from 'next/link';
import { Button } from '@/components/ui/button';

const CtaSection = () => {
  return (
    <section className="bg-primary text-primary-foreground py-20">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">지금 바로 시작하세요</h2>
        <p className="mx-auto max-w-[600px] text-lg mb-8">
          더 이상 복잡한 콘티 준비는 없습니다. Contee와 함께 예배 준비의 혁신을 경험해보세요.
        </p>
        <div className="flex justify-center">
          <Button asChild size="lg" variant="secondary">
            <Link href="/login">무료로 시작하기</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
