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
      <DialogContent className="max-w-none w-[90vw] sm:!max-w-none h-[65vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle>송 폼 편집 (Song Form Editor)</DialogTitle>
          <DialogDescription>
            알맞은 곡의 구성을 생성하고 편집하세요.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden min-h-0 bg-slate-50/50 rounded-lg border relative">
             {/* Render Editor inside the dialog content area */}
             {/* SongFormEditor needs to be scrollable if content overflows, 
                 but SongFormEditor has its own layout styles. 
                 We might need to adjust SongFormEditor to fit nicely or wrapping it here.
             */}
             <div className="h-full overflow-y-auto p-4">
                <SongFormEditor value={localValue} onChange={setLocalValue} />
             </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
          <Button onClick={handleSave}>완료</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
