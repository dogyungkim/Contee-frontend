'use client'

import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { ContiDetail } from '@/domains/conti/components/conti-detail'

export default function EditContiPage() {
  const params = useParams()
  const id = params.id as string

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/contis">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <span className="text-sm font-medium text-muted-foreground">콘티 목록으로</span>
      </div>

      <ContiDetail contiId={id} />
    </div>
  )
}
