import Image from 'next/image';

const FeatureSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">핵심 기능</h2>
          <p className="mx-auto mt-4 max-w-[700px] text-lg text-muted-foreground">
            Contee는 예배 준비에 필요한 모든 것을 제공합니다.
          </p>
        </div>
        <div className="grid gap-16">
          {/* Feature 1 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <h3 className="text-2xl font-bold mb-4">드래그 & 드롭 콘티 편집</h3>
              <p className="text-muted-foreground mb-4">
                직관적인 드래그 & 드롭 인터페이스로 곡 순서를 쉽게 변경하고, 예배의 흐름에 맞는 콘티를 빠르게 완성하세요. 모바일에서도 완벽하게 동작합니다.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>✓ 직관적인 순서 변경</li>
                <li>✓ 실시간 미리보기</li>
                <li>✓ 모바일 최적화</li>
              </ul>
            </div>
            <div className="order-1 md:order-2">
              <Image
                src="/placeholder.svg"
                alt="드래그 & 드롭 콘티 편집"
                width={500}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Image
                src="/placeholder.svg"
                alt="곡 데이터베이스 및 검색"
                width={500}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">강력한 곡 데이터베이스</h3>
              <p className="text-muted-foreground mb-4">
                모든 곡 정보를 한 곳에서 관리하세요. 곡명, 코드, BPM, 가사 등 필요한 모든 정보를 저장하고, 강력한 검색 기능으로 원하는 곡을 즉시 찾을 수 있습니다.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>✓ 모든 곡 정보 통합 관리</li>
                <li>✓ 상세 검색 (키, BPM, 태그)</li>
                <li>✓ YouTube 링크 및 악보 파일 첨부</li>
              </ul>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <h3 className="text-2xl font-bold mb-4">원클릭 공유 및 PDF 출력</h3>
              <p className="text-muted-foreground mb-4">
                완성된 콘티는 링크 하나로 팀원들에게 쉽게 공유할 수 있습니다. PDF로 변환하여 인쇄하거나, 모바일에서 바로 확인하여 모두가 동일한 정보를 보도록 하세요.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>✓ 간편한 링크 공유</li>
                <li>✓ 깔끔한 PDF 출력</li>
                <li>✓ 실시간 동기화</li>
              </ul>
            </div>
            <div className="order-1 md:order-2">
              <Image
                src="/placeholder.svg"
                alt="원클릭 공유 및 PDF 출력"
                width={500}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
