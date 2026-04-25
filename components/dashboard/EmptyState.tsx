import Link from 'next/link';
import { FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-16 h-16 rounded-xl bg-royal-50 flex items-center justify-center mb-6">
        <FilePlus className="w-8 h-8 text-royal" />
      </div>
      <h2 className="text-h3 text-neutral-900 mb-2">아직 프로젝트가 없습니다</h2>
      <p className="text-body text-neutral-500 max-w-sm mb-8">
        지식재산권 등록의 첫 걸음을 시작해보세요. AI가 필요한 서류를 자동으로 준비해드립니다.
      </p>
      <Button asChild className="bg-royal text-white hover:bg-royal-600">
        <Link href="/register/new">
          <FilePlus className="w-4 h-4 mr-2" />
          첫 프로젝트 시작하기
        </Link>
      </Button>
    </div>
  );
}
