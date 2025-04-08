import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, FolderOpen, User, FileText, CheckCircle, ChevronRight } from 'lucide-react';

interface NavbarProps {
  currentView: 'upload' | 'chat';
  onViewChange: (view: 'upload' | 'chat') => void;
  userName?: string;
  userAvatar?: string;
  uploadedFilesCount: number;
  isUploadComplete: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  onViewChange, 
  userName = 'User', 
  userAvatar, 
  uploadedFilesCount, 
  isUploadComplete 
}) => {
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);
  
  // Show success message when upload is complete
  useEffect(() => {
    if (isUploadComplete && uploadedFilesCount > 0) {
      setShowUploadSuccess(true);
      const timer = setTimeout(() => {
        setShowUploadSuccess(false);
      }, 5000); // Hide after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isUploadComplete, uploadedFilesCount]);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50/95 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-30 shadow-sm"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">DC</span>
            </div>
            <span className="text-xl font-semibold text-gray-800">DirectChat</span>
          </motion.div>
          
          {/* Navigation Links */}
          <div className="flex items-center gap-2 md:gap-4">
            <motion.button
              onClick={() => onViewChange('upload')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                currentView === 'upload' 
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              <FolderOpen size={18} />
              <span className="hidden md:inline">Upload Directory</span>
            </motion.button>
            
            <motion.button
              onClick={() => onViewChange('chat')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                currentView === 'chat' 
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-blue-600 hover:bg-blue-50'
              } ${uploadedFilesCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={uploadedFilesCount === 0}
            >
              <MessageSquare size={18} />
              <span className="hidden md:inline">Chatbot</span>
            </motion.button>
            
            {/* Upload Status / Success Message */}
            <AnimatedUploadStatus 
              showUploadSuccess={showUploadSuccess} 
              uploadedFilesCount={uploadedFilesCount}
              onGoChatClick={() => onViewChange('chat')}
            />
          </div>
          
          {/* User Profile */}
          <motion.div
            className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg hover:bg-blue-100 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="h-8 w-8 rounded-full ring-2 ring-teal-300 group-hover:ring-teal-400 transition-all" />
            ) : (
              <div className="h-8 w-8 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full flex items-center justify-center ring-2 ring-teal-200 group-hover:ring-teal-300 transition-all">
                <User size={16} className="text-white" />
              </div>
            )}
            <div className="hidden md:flex flex-col">
              <span className="text-gray-800 font-medium leading-tight">{userName}</span>
              <span className="text-blue-500 text-xs leading-tight">Account</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};

// Animated Upload Status Component
const AnimatedUploadStatus: React.FC<{ 
  showUploadSuccess: boolean; 
  uploadedFilesCount: number;
  onGoChatClick: () => void;
}> = ({ showUploadSuccess, uploadedFilesCount, onGoChatClick }) => {
  return (
    <AnimatePresence>
      {showUploadSuccess && (
        <motion.div
          initial={{ opacity: 0, width: 0, scale: 0.8 }}
          animate={{ opacity: 1, width: 'auto', scale: 1 }}
          exit={{ opacity: 0, width: 0, scale: 0.8 }}
          className="hidden md:flex items-center gap-2 px-3 py-2 bg-teal-100 text-teal-700 rounded-lg overflow-hidden"
        >
          <CheckCircle size={18} className="text-teal-600 flex-shrink-0" />
          <span className="whitespace-nowrap">
            Successfully uploaded {uploadedFilesCount} files!
          </span>
          <motion.button
            onClick={onGoChatClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 px-2 py-1 bg-teal-200 hover:bg-teal-300 text-teal-800 rounded-lg text-sm ml-2"
          >
            Go to Chat
            <ChevronRight size={14} />
          </motion.button>
        </motion.div>
      )}
      
      {!showUploadSuccess && uploadedFilesCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="hidden md:flex items-center gap-2 px-3 py-1 text-blue-600 rounded-lg"
        >
          <FileText size={16} />
          <span className="text-sm">{uploadedFilesCount} files</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Navbar;