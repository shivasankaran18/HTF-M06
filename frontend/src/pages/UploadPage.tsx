import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FileUpload, { DirectoryStructure } from '../components/FileUpload';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import axios from 'axios';

const UploadPage: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [directoryStructure, setDirectoryStructure] = useState<DirectoryStructure | undefined>(undefined);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const navigate = useNavigate();

  const handleFilesUploaded = async (files: File[]) => {
    setUploadedFiles(files);
    setIsUploadComplete(true);
    console.log('Uploaded files:', files);
    console.log(typeof files[0])
    await axios.post("http://localhost:8000/getfileinfo",{
      data:"/home/shiva_18/htf/AzureInterior.pdf"
    })
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

  const handleDirectoryStructure = (structure: DirectoryStructure) => {
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
    navigate('/chat', { 
      state: { 
        uploadedFiles,
        directoryStructure
      } 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col"
    >
      <Navbar 
        userName="Shiva"
        uploadedFilesCount={uploadedFiles.length}
        isUploadComplete={isUploadComplete}
      />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <motion.div
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
      </div>
    </motion.div>
  );
};

export default UploadPage;