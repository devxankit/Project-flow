import React from 'react';
import { Copy, Loader2 } from 'lucide-react';
import { Button } from './magicui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './magicui/dialog';

const CopyConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading = false,
  itemType = "item", // "task" or "subtask"
  itemTitle = ""
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Copy className="h-5 w-5 text-primary" />
            <span>Copy {itemType}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>Are you sure you want to copy this {itemType}?</p>
            {itemTitle && (
              <p className="font-medium text-gray-900 mt-1">"{itemTitle}"</p>
            )}
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">What will be copied:</p>
              <ul className="space-y-1 text-xs">
                <li>• Title and description</li>
                <li>• Priority and due date</li>
                <li>• Assigned team members</li>
                <li>• Sequence number (next available)</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">What will be reset:</p>
              <ul className="space-y-1 text-xs">
                <li>• Status to "Pending"</li>
                <li>• Progress to 0%</li>
                <li>• No file attachments</li>
                <li>• No comments</li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="bg-primary hover:bg-primary-hover text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Copying...
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy {itemType}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CopyConfirmDialog;
