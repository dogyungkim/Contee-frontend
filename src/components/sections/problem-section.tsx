import { FileText, Repeat, Share2 } from 'lucide-react';

const features = [
  {
    icon: <FileText className="h-10 w-10 text-primary" />,
    title: '자료 분산',
    description: '악보, 음원 링크, 콘티 파일이 여러 곳에 흩어져 있어 찾기 힘드셨나요? Contee는 모든 자료를 한 곳에 모아줍니다.',
  },
  {
    icon: <Repeat className="h-10 w-10 text-primary" />,
    title: '비효율적인 재사용',
    description: '과거에 사용했던 좋은 콘티와 곡 조합을 다시 찾기 어려우셨죠? Contee는 모든 히스토리를 기록하고 쉽게 검색할 수 있게 합니다.',
  },
  {
    icon: <Share2 className="h-10 w-10 text-primary" />,
    title: '공유의 혼선',
    description: '수정된 콘티를 팀원들에게 다시 공유하는 과정에서 버전이 꼬인 경험, 다들 있으시죠? Contee는 실시간으로 최신 버전을 공유합니다.',
  },
];

const ProblemSection = () => {
  return (
    <section id="features" className="bg-muted py-20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">왜 Contee가 필요한가요?</h2>
          <p className="mx-auto mt-4 max-w-[700px] text-lg text-muted-foreground">
            찬양팀 리더와 팀원들이 겪는 고질적인 문제들을 해결합니다.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-md">
              {feature.icon}
              <h3 className="mt-5 mb-2 text-xl font-bold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
