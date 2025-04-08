import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, FileText, X, Paperclip, FolderTree, File, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import { DirectoryStructure } from './FileUpload';
import axios from 'axios';

interface ChatbotProps {
  uploadedFiles: File[];
  directoryStructure?: DirectoryStructure;
}

interface Message {
  text: string;
  isUser: boolean;
  attachedFiles?: File[];
  timestamp: Date;
}

const Chatbot: React.FC<ChatbotProps> = ({ uploadedFiles, directoryStructure }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      text: "I'm ready to help you analyze your files and directory structure. What would you like to know?", 
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [showDirectoryExplorer, setShowDirectoryExplorer] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && selectedFiles.length === 0) return;
    console.log(input);
    console.log(selectedFiles)
    const userMessage: Message = {
      text: input || "Analyzing attached files...",
      isUser: true,
      attachedFiles: selectedFiles.length > 0 ? selectedFiles : undefined,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedFiles([]);
    setShowFileSelector(false);
    setIsLoading(true);
    console.log(input)

    try {
      const files = selectedFiles.map(file => ({  
        name: file.name,
      }));
      if(selectedFiles.length > 0) {
        const response = await axios.post("http://localhost:8000/getspecificfileinfo",{
          data : input,
          files : files,
          feedback : 1
        })
      }
      else {
        const response = await axios.post("http://localhost:8000/getuserquery", {
          data : input,
          feedback : 1
        });
        const botMessage: Message = {
          text: response.data.response,  
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
 
      const errorMessage: Message = {
        text: "Sorry, I encountered an error while processing your request. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFileSelection = (file: File) => {
    setSelectedFiles(prev => 
      prev.some(f => f.name === file.name && f.size === file.size)
        ? prev.filter(f => !(f.name === file.name && f.size === file.size))
        : [...prev, file]
    );
  };

  const removeSelectedFile = (fileToRemove: File, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFiles(prev => prev.filter(file => !(file.name === fileToRemove.name && file.size === fileToRemove.size)));
  };
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const handleDragStart = (event: React.DragEvent, file: File) => {
    event.dataTransfer.setData('application/json', JSON.stringify({
      name: file.name,
      size: file.size,
      type: file.type
    }));
    event.dataTransfer.effectAllowed = 'copy';
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    
    try {
      const fileData = JSON.parse(event.dataTransfer.getData('application/json'));
      const file = uploadedFiles.find(f => f.name === fileData.name && f.size === fileData.size);
      
      if (file) {
        toggleFileSelection(file);
      }
    } catch (error) {
      console.error('Error handling dropped file', error);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderDirectoryItem = (item: DirectoryStructure, level: number = 0): React.ReactNode => {
    const isExpanded = expandedFolders.has(item.path);
    
    return (
      <div key={item.path} className="py-1">
        <div 
          className={`flex items-center gap-2 rounded-lg px-2 py-1 ${
            item.type === 'directory' 
              ? 'hover:bg-teal-100 text-teal-700' 
              : 'hover:bg-teal-100 text-teal-700'
          } cursor-pointer ml-${level * 2}`}
          onClick={() => item.type === 'directory' ? toggleFolder(item.path) : undefined}
          draggable={item.type === 'file'}
          onDragStart={item.type === 'file' && item.file ? (e) => handleDragStart(e, item.file!) : undefined}
        >
          {item.type === 'directory' && (
            <span className="text-teal-500">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          )}
          {item.type === 'directory' ? (
            <Folder size={16} className="text-teal-500" />
          ) : (
            <File size={16} className="text-teal-600" />
          )}
          <span className="truncate text-sm">
            {item.name}
          </span>
          {item.type === 'file' && item.file && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                toggleFileSelection(item.file!);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`ml-auto rounded-full p-1 ${
                selectedFiles.some(f => f.name === item.file!.name && f.size === item.file!.size)
                  ? 'bg-teal-500 text-white'
                  : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
              }`}
            >
              {selectedFiles.some(f => f.name === item.file!.name && f.size === item.file!.size) ? (
                <X size={12} />
              ) : (
                <span className="text-xs">+</span>
              )}
            </motion.button>
          )}
        </div>
        {item.children && isExpanded && (
          <div>
            {item.children.map(child => renderDirectoryItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-70px)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-teal-200 flex-1 overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-teal-200">
          <div className="flex items-center gap-3">
            <Bot className="text-teal-600" size={24} />
            <h3 className="text-xl font-semibold text-teal-800">
              AI Assistant
            </h3>
            
            <motion.button
              onClick={() => setShowDirectoryExplorer(!showDirectoryExplorer)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`ml-auto px-3 py-1 rounded-full text-sm border ${
                showDirectoryExplorer
                  ? 'bg-teal-500 text-white border-teal-500'
                  : 'border-teal-300 text-teal-700 hover:bg-teal-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <FolderTree size={16} />
                <span>Directory Explorer</span>
              </div>
            </motion.button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div className="space-y-2 max-w-[80%]">
                  <div className="flex flex-col">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`rounded-2xl px-4 py-2 ${
                        message.isUser
                          ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg'
                          : 'bg-gradient-to-r from-gray-100 to-teal-100 text-gray-800'
                      }`}
                    >
                      {message.text}
                    </motion.div>
                    <span className={`text-xs mt-1 ${message.isUser ? 'text-right' : ''} text-gray-500`}>
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  {message.attachedFiles && message.attachedFiles.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-wrap gap-2"
                    >
                      {message.attachedFiles.map((file, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                            message.isUser 
                              ? 'bg-teal-100 text-teal-800' 
                              : 'bg-teal-100 text-teal-800'
                          }`}
                        >
                          <FileText size={14} />
                          {file.name}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
            <div ref={chatEndRef} />
          </AnimatePresence>
        </div>

        <div className="p-4 border-t border-teal-200">
          {selectedFiles.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-2 flex flex-wrap gap-2"
            >
              {selectedFiles.map((file, index) => (
                <motion.div
                  key={`selected-${index}`}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 bg-teal-500 text-white px-3 py-1 rounded-full text-sm"
                >
                  <FileText size={14} />
                  <span className="max-w-[150px] truncate">{file.name}</span>
                  <motion.button
                    onClick={(e) => removeSelectedFile(file, e)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="hover:bg-red-500 rounded-full p-1"
                  >
                    <X size={12} />
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}
          
          <AnimatePresence>
            {showFileSelector && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3"
              >
                <div className="flex flex-wrap gap-2 p-3 bg-teal-50 rounded-lg max-h-[200px] overflow-y-auto">
                  <div className="w-full flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-teal-700">Select files to attach</span>
                    <motion.button
                      onClick={() => setShowFileSelector(false)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-teal-500 hover:text-teal-700"
                    >
                      <X size={16} />
                    </motion.button>
                  </div>
                  
                  <motion.button
                    onClick={triggerFileInput}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-3 py-2 bg-teal-100 text-teal-700 hover:bg-teal-200 rounded-lg"
                  >
                    <Paperclip size={16} />
                    <span>Upload new files</span>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileInput} 
                      className="hidden" 
                      multiple 
                    />
                  </motion.button>
                  
                  {uploadedFiles.map((file, index) => (
                    <motion.button
                      key={index}
                      onClick={() => toggleFileSelection(file)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedFiles.some(f => f.name === file.name && f.size === file.size)
                          ? 'bg-teal-500 text-white'
                          : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                      }`}
                    >
                      <FileText size={14} />
                      <span className="max-w-[150px] truncate">{file.name}</span>
                      {selectedFiles.some(f => f.name === file.name && f.size === file.size) && (
                        <motion.button
                          onClick={(e) => removeSelectedFile(file, e)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="hover:bg-red-500 hover:text-white rounded-full p-1"
                        >
                          <X size={12} />
                        </motion.button>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <form 
            onSubmit={handleSubmit} 
            className="flex gap-2"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <motion.input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message or drag files here..."
              className="flex-1 px-4 py-2 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300"
              whileFocus={{ scale: 1.02 }}
            />
            <motion.button
              type="button"
              onClick={() => setShowFileSelector(!showFileSelector)}
              className={`p-2 rounded-lg border ${
                showFileSelector 
                  ? 'bg-teal-500 text-white border-teal-500' 
                  : 'border-teal-300 text-teal-600 hover:bg-teal-50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Paperclip size={20} />
            </motion.button>
            <motion.button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
            >
              <Send size={20} />
            </motion.button>
          </form>
        </div>
      </motion.div>

      <AnimatePresence>
        {showDirectoryExplorer && directoryStructure && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: '300px' }}
            exit={{ opacity: 0, width: 0 }}
            className="border-l border-teal-200 bg-white/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="p-3 border-b border-teal-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-teal-800 font-medium">
                  <FolderTree size={18} className="text-teal-500" />
                  Directory Structure
                </div>
                <motion.button
                  onClick={() => setShowDirectoryExplorer(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-teal-500 hover:text-teal-700 p-1 rounded-full hover:bg-teal-100"
                >
                  <X size={16} />
                </motion.button>
              </div>
              <div className="text-xs text-teal-500 mt-1">
                Drag files to the chat input to attach them
              </div>
            </div>
            <div className="h-full overflow-y-auto p-2 max-h-[calc(100vh-140px)]">
              {renderDirectoryItem(directoryStructure)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;