import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, FolderOpen, User, FileText } from 'lucide-react';

interface NavbarProps {
  userName?: string;
  userAvatar?: string;
  uploadedFilesCount: number;
  isUploadComplete: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ 
  userName = 'User', 
  userAvatar, 
  uploadedFilesCount, 
  isUploadComplete 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentView = location.pathname === '/upload' ? 'upload' : 'chat';
  
  const handleViewChange = (view: 'upload' | 'chat') => {
    if (view === 'upload') {
      navigate('/upload');
    } else if (view === 'chat') {
      navigate('/chat');
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#FFFDF2] border-b-2 border-black sticky top-0 z-30 shadow-sm"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="h-10 w-10 bg-black rounded-lg flex items-center justify-center">
              <span className="text-[#FFFDF2] font-bold text-xl">DM</span>
            </div>
            <span className="text-xl font-semibold text-black">DocuMind</span>
          </motion.div>
          
          {/* Navigation Links */}
          <div className="flex items-center gap-2 md:gap-4">
            <motion.button
              onClick={() => handleViewChange('upload')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                currentView === 'upload' 
                  ? 'bg-black text-[#FFFDF2] font-medium'
                  : 'text-black hover:bg-black/10'
              }`}
            >
              <FolderOpen size={18} />
              <span className="hidden md:inline">Upload Directory</span>
            </motion.button>
            
            <motion.button
              onClick={() => handleViewChange('chat')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                currentView === 'chat' 
                  ? 'bg-black text-[#FFFDF2] font-medium'
                  : 'text-black hover:bg-black/10'
              } ${uploadedFilesCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={uploadedFilesCount === 0}
            >
              <MessageSquare size={18} />
              <span className="hidden md:inline">Chatbot</span>
            </motion.button>
            
            {/* Upload Status / Success Message */}
            {isUploadComplete && uploadedFilesCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden md:flex items-center gap-2 px-3 py-1 text-black rounded-lg"
              >
                <FileText size={16} />
                <span className="text-sm">{uploadedFilesCount} files</span>
              </motion.div>
            )}
          </div>
          
          {/* User Profile */}
          <motion.div
            className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg hover:bg-black/10 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="h-8 w-8 rounded-full ring-2 ring-black group-hover:ring-black transition-all" />
            ) : (
              <div className="h-8 w-8 bg-black rounded-full flex items-center justify-center ring-2 ring-black group-hover:ring-black transition-all">
                <User size={16} className="text-[#FFFDF2]" />
              </div>
            )}
            <div className="hidden md:flex flex-col">
              <span className="text-black font-medium leading-tight">{userName}</span>
              <span className="text-black/60 text-xs leading-tight">Account</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;