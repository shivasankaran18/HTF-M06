import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import AuthForm from './components/AuthForm';
import FileUpload, { DirectoryStructure } from './components/FileUpload';
import Chatbot from './components/Chatbot';
import Navbar from './components/Navbar';
import axios from 'axios';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [directoryStructure, setDirectoryStructure] = useState<DirectoryStructure | undefined>(undefined);
  const [currentView, setCurrentView] = useState<'upload' | 'chat'>('upload');
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const [userName, setUserName] = useState('John Doe');

  const handleFilesUploaded = (files: File[]) => {
    setUploadedFiles(files);

    setIsUploadComplete(true);
    console.log(files+"");
    toast.success(`Successfully uploaded ${files.length} files!`, {
      style: {
        background: '#FFFDF2',
        color: '#000000',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      },
      iconTheme: {
        primary: '#000000',
        secondary: '#FFFDF2',
      },
    });
  };

  const handleDirectoryStructure = async(structure: DirectoryStructure) => {
    await axios.post("http://localhost:8000/getfileinfo", {
      data: "/home/shiva_18/htf/HTF-M06/backend/documentRepo"
  })
    setDirectoryStructure(structure);

  };

  const handleViewChange = (view: 'upload' | 'chat') => {
    if (view === 'chat' && uploadedFiles.length === 0) {
      toast.error('Please upload files first!', {
        style: {
          background: '#FFFDF2',
          color: '#000000',
          borderRadius: '1rem',
        },
      });
      return;
    }
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF2]">
      <Toaster position="top-right" />
      
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex items-center justify-center px-4"
          >
            <div className="max-w-md w-full">
              <AuthForm 
                isSignUp={false} 
                onAuth={() => setIsAuthenticated(true)} 
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col"
          >
            <Navbar 
              currentView={currentView}
              onViewChange={handleViewChange}
              userName={userName}
              uploadedFilesCount={uploadedFiles.length}
              isUploadComplete={isUploadComplete}
            />
            
            <div className="container mx-auto px-4 py-8 flex-grow">
              <AnimatePresence mode="wait">
                {currentView === 'upload' && (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="max-w-4xl mx-auto"
                  >
                    <FileUpload 
                      onFilesUploaded={handleFilesUploaded} 
                      onDirectoryStructure={handleDirectoryStructure} 
                    />
                    
                    {uploadedFiles.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 flex justify-center"
                      >
                        <motion.button
                          onClick={() => handleViewChange('chat')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-6 py-3 bg-black text-[#FFFDF2] rounded-xl shadow-lg flex items-center gap-2"
                        >
                          Continue to Chatbot
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m9 18 6-6-6-6"/>
                          </svg>
                        </motion.button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
                
                {currentView === 'chat' && uploadedFiles.length > 0 && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="max-w-4xl mx-auto"
                  >
                    <Chatbot 
                      uploadedFiles={uploadedFiles}
                      directoryStructure={directoryStructure} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;