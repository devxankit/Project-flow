import React from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Image, Video, Music, Archive, File, X } from 'lucide-react';
import { Button } from './magicui/button';

const AttachmentDisplay = ({ attachments = [], onDelete, canDelete = false }) => {
  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) return <Image className="h-5 w-5 text-blue-500" />;
    if (mimetype.startsWith('video/')) return <Video className="h-5 w-5 text-purple-500" />;
    if (mimetype.startsWith('audio/')) return <Music className="h-5 w-5 text-green-500" />;
    if (mimetype.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (mimetype.includes('zip') || mimetype.includes('rar')) return <Archive className="h-5 w-5 text-orange-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async (attachment) => {
    try {
      // Determine the correct download URL based on attachment context
      let downloadUrl;
      
      if (attachment.taskId && attachment.customerId) {
        // Task attachment
        downloadUrl = `/api/files/task/${attachment.taskId}/customer/${attachment.customerId}/attachment/${attachment._id}/download`;
      } else if (attachment.subtaskId && attachment.customerId) {
        // Subtask attachment
        downloadUrl = `/api/files/subtask/${attachment.subtaskId}/customer/${attachment.customerId}/attachment/${attachment._id}/download`;
      } else {
        // Fallback - try direct download
        downloadUrl = `/api/files/download/${attachment._id || attachment.filename}`;
      }
      
      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = attachment.originalName || attachment.filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  if (!attachments || attachments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm">No attachments</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
        <FileText className="h-4 w-4 text-primary" />
        <span>Attachments ({attachments.length})</span>
      </h4>
      
      <div className="grid gap-3">
        {attachments.map((attachment, index) => (
          <motion.div
            key={attachment._id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {getFileIcon(attachment.mimetype)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {attachment.originalName || attachment.filename}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(attachment.size)} • {attachment.mimetype}
                </p>
                {attachment.uploadedAt && (
                  <p className="text-xs text-gray-400">
                    Uploaded {new Date(attachment.uploadedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(attachment)}
                className="text-primary hover:text-primary-dark hover:bg-primary/10"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              {canDelete && onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(attachment._id || index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AttachmentDisplay;
