import Link from 'next/link';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="container mx-auto flex flex-col items-center justify-center gap-8 py-20 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          찬양팀 콘티, 이제 Contee로 쉽고 빠르게
        </h1>
        <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
          흩어져 있는 악보와 링크, 복잡한 수정 요청은 이제 그만. Contee에서 모든 것을 한 번에 해결하고, 예배 준비 시간을 획기적으로 줄여보세요.
        </p>
      </div>
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/login">지금 시작하기</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="#features">기능 둘러보기</Link>
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;
