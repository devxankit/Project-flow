import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Copy, Edit, Trash2 } from 'lucide-react';
import { Button } from './magicui/button';

const ThreeDotMenu = ({ 
  onCopy, 
  onEdit, 
  onDelete, 
  showCopy = true, 
  showEdit = false, 
  showDelete = false,
  className = "",
  itemType = "item" // "task" or "subtask"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuClick = (e) => {
    e.stopPropagation(); // Prevent card click when menu is clicked
    setIsOpen(!isOpen);
  };

  const handleAction = (action) => {
    setIsOpen(false);
    action();
  };

  const hasActions = showCopy || showEdit || showDelete;

  if (!hasActions) {
    return null;
  }

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* Three-dot button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleMenuClick}
        className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <MoreVertical className="h-4 w-4" />
        <span className="sr-only">Open menu</span>
      </Button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 top-8 z-50 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1">
          {showCopy && (
            <button
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleAction(onCopy); }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
            >
              <Copy className="h-4 w-4" />
              <span>Copy {itemType}</span>
            </button>
          )}
          
          {showEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleAction(onEdit); }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>Edit {itemType}</span>
            </button>
          )}
          
          {showDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleAction(onDelete); }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete {itemType}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ThreeDotMenu;
