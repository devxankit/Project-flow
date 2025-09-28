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
      console.log('Starting download for attachment:', attachment);
      
      // Use the new file ID-based download route with authorization
      const downloadUrl = `/api/files/${attachment._id}`;
      console.log('Download URL:', downloadUrl);
      
      // Create a direct download link with authorization
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = attachment.originalName || attachment.filename;
      link.target = '_blank';
      
      // Add authorization header
      const token = localStorage.getItem('token');
      if (token) {
        // Create a fetch request to get the file with proper headers
        const response = await fetch(downloadUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Download failed: ${response.statusText}`);
        }
        
        // Get the blob and create download
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        link.href = blobUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        window.URL.revokeObjectURL(blobUrl);
      } else {
        // Fallback to direct link
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      console.log('Download initiated successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
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
            className="flex items-start sm:items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200 gap-3"
          >
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <div className="flex-shrink-0">{getFileIcon(attachment.mimetype)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate" title={attachment.originalName || attachment.filename}>
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
            
            <div className="flex items-center space-x-2 flex-shrink-0">
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
