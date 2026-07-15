'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { SongFormEditor } from './song-form-editor'
import { SongFormPart } from '@/types/song'

interface SongFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: SongFormPart[]
  onChange: (value: SongFormPart[]) => void
}

export function SongFormDialog({ open, onOpenChange, value, onChange }: SongFormDialogProps) {
  // Local state to handle changes before saving
  const [localValue, setLocalValue] = useState<SongFormPart[]>([])

  // Sync local state when dialog opens
  useEffect(() => {
    if (open) {
      setLocalValue([...value])
    }
  }, [open, value])

  const handleSave = () => {
    onChange(localValue)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[calc(100dvh-1rem)] max-h-[860px] w-[calc(100vw-0.75rem)] max-w-none flex-col gap-3 p-3 sm:h-[80vh] sm:w-[92vw] sm:!max-w-none sm:gap-4 sm:p-6">
        <DialogHeader className="shrink-0 gap-1 pr-8 sm:gap-2 sm:pr-10">
          <DialogTitle className="type-card-title">송 폼 편집</DialogTitle>
          <DialogDescription className="type-body-sm">
            알맞은 곡의 구성을 생성하고 편집하세요.
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg border bg-slate-50/50">
             {/* Render Editor inside the dialog content area */}
             {/* SongFormEditor needs to be scrollable if content overflows, 
                 but SongFormEditor has its own layout styles. 
                 We might need to adjust SongFormEditor to fit nicely or wrapping it here.
             */}
             <div className="h-full overflow-y-auto p-2 sm:p-4">
                <SongFormEditor value={localValue} onChange={setLocalValue} />
             </div>
        </div>

        <DialogFooter className="mt-1 shrink-0 sm:mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-8 w-full sm:h-9 sm:w-auto">취소</Button>
          <Button onClick={handleSave} className="h-8 w-full sm:h-9 sm:w-auto">완료</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
