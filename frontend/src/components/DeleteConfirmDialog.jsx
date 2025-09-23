import React from 'react';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from './magicui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './magicui/dialog';

const DeleteConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading = false,
  itemType = "item", // "task" or "subtask"
  itemTitle = "",
  showCascadeWarning = false
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            <span>Delete {itemType}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>Are you sure you want to delete this {itemType}?</p>
            {itemTitle && (
              <p className="font-medium text-gray-900 mt-1">"{itemTitle}"</p>
            )}
          </div>
          
          {showCascadeWarning && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Warning: This will also delete all associated subtasks.</p>
                  <p className="text-xs mt-1">This action cannot be undone.</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">This will permanently delete:</p>
              <ul className="space-y-1 text-xs">
                <li>• The {itemType} and all its data</li>
                {showCascadeWarning && <li>• All associated subtasks</li>}
                <li>• All comments and attachments</li>
                <li>• All activity history</li>
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
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete {itemType}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
