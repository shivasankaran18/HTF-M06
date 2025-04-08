import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Chatbot from '../components/Chatbot';
import Navbar from '../components/Navbar';
import { DirectoryStructure } from '../components/FileUpload';

interface LocationState {
  uploadedFiles: File[];
  directoryStructure?: DirectoryStructure;
}

const ChatPage: React.FC = () => {
  const location = useLocation();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [directoryStructure, setDirectoryStructure] = useState<DirectoryStructure | undefined>(undefined);

  useEffect(() => {
    const state = location.state as LocationState;
    if (state) {
      setUploadedFiles(state.uploadedFiles || []);
      setDirectoryStructure(state.directoryStructure);
    }
  }, [location.state]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col bg-[#FFFDF2]"
    >
      <Navbar 
        userName="Shiva"
        uploadedFilesCount={uploadedFiles.length}
        isUploadComplete={true}
      />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6"
        >
          <Chatbot 
            uploadedFiles={uploadedFiles}
            directoryStructure={directoryStructure} 
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ChatPage;