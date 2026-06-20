'use client'

import { useParams } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { ContiDetail } from '@/domains/conti/components/conti-detail'

export default function EditContiPage() {
  const params = useParams()
  const id = params.id as string

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/contis">
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm font-medium">콘티 목록으로</span>
          </Link>
        </Button>
      </div>

      <ContiDetail contiId={id} />
    </div>
  )
}
