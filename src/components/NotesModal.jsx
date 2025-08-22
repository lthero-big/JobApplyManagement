import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const NotesModal = ({ isOpen, onOpenChange, status, initialNotes, onSave }) => {
  const [notes, setNotes] = useState(initialNotes || '');
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNotes(initialNotes || '');
      setIsChanged(false);
    }
  }, [isOpen, initialNotes]);

  const handleNotesChange = (e) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    setIsChanged(newNotes !== (initialNotes || ''));
  };

  const handleSave = () => {
    onSave(notes);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑 {status} 备注</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              备注内容
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={handleNotesChange}
              className="col-span-3"
              rows={6}
              placeholder="请输入与该状态相关的备注信息..."
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={!isChanged}>
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotesModal;
