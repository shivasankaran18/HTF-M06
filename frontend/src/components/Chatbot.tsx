import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, FileText, X, Paperclip, FolderTree, File, Folder, ChevronRight, ChevronDown, FileOutput, ThumbsUp, ThumbsDown } from 'lucide-react';
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

interface FeedbackData {
  rating: 'like' | 'neutral' | 'dislike';
  comment?: string;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [reportPrompt, setReportPrompt] = useState('');
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  // Feedback related states
  const [userInteractionCount, setUserInteractionCount] = useState(0);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [feedbackInterval] = useState(2); // Show feedback popup every 2 interactions
  const [feedbackComment, setFeedbackComment] = useState('');
  // This state stores feedback history for potential future analytics or backend sync
  // The ESLint warning is suppressed as this is intended to be used by backend integration
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackData[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if feedback should be shown based on interaction count
  useEffect(() => {
    console.log('User interaction count:', userInteractionCount);
    if (userInteractionCount > 0 && userInteractionCount % feedbackInterval === 0) {
      console.log('Showing feedback popup, count:', userInteractionCount);
      setShowFeedbackPopup(true);
    }
  }, [userInteractionCount, feedbackInterval]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && selectedFiles.length === 0) return;

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
    setIsSubmitting(true);
    console.log(input)

    try {
      const response = await axios.post("http://localhost:8000/getuserquery", {
        data: input  
      });

      const botMessage: Message = {
        text: response.data.response,  
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      
      // Increment the user interaction count after successful response
      setUserInteractionCount(prev => prev + 1);
    } catch (error) {
      console.error('Error sending message:', error);
 
      const errorMessage: Message = {
        text: "Sorry, I encountered an error while processing your request. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Still increment interaction count even on error
      setUserInteractionCount(prev => prev + 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateReport = async () => {
    if (!reportPrompt.trim()) return;
    
    setIsGeneratingReport(true);
    
    try {
      // Replace with actual API endpoint for report generation
      const response = await axios.post("http://localhost:8000/generatereport", {
        prompt: reportPrompt,
        files: selectedFiles.map(file => file.name)
      });
      
      setGeneratedReport(response.data.report);
      
      // Add a message to the chat about the report
      const botMessage: Message = {
        text: `I've generated a report based on your request: "${reportPrompt}". You can download it below.`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error('Error generating report:', error);
      
      // Mock generated report for demonstration
      const mockReport = `# Analysis Report
## Overview
This is an automatically generated report based on your prompt: "${reportPrompt}"

## File Analysis
${selectedFiles.map(file => `- ${file.name}: ${(file.size / 1024).toFixed(2)} KB`).join('\n')}

## Summary
This is a placeholder for the actual report content that would be generated by your backend service.

## Recommendations
- Consider reviewing file structure for better organization
- Implement proper documentation for key components
- Follow consistent naming conventions`;
      
      setGeneratedReport(mockReport);
      
      const botMessage: Message = {
        text: `I've generated a report based on your request. You can download it below. (Note: This is a demo report)`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsGeneratingReport(false);
      setShowReportGenerator(false);
    }
  };

  const downloadReport = () => {
    if (!generatedReport) return;
    
    const blob = new Blob([generatedReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
              ? 'hover:bg-black/5 text-black' 
              : 'hover:bg-black/5 text-black'
          } cursor-pointer ml-${level * 2}`}
          onClick={() => item.type === 'directory' ? toggleFolder(item.path) : undefined}
          draggable={item.type === 'file'}
          onDragStart={item.type === 'file' && item.file ? (e) => handleDragStart(e, item.file!) : undefined}
        >
          {item.type === 'directory' && (
            <span className="text-black">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          )}
          {item.type === 'directory' ? (
            <Folder size={16} className="text-black" />
          ) : (
            <File size={16} className="text-black" />
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
                  ? 'bg-black text-white'
                  : 'bg-black/10 text-black hover:bg-black/20'
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

  // Function to handle feedback submission
  const submitFeedback = (rating: 'like' | 'neutral' | 'dislike') => {
    const feedback: FeedbackData = {
      rating,
      comment: feedbackComment.trim() || undefined
    };
    
    // Store the feedback in history for potential future analytics
    setFeedbackHistory(prev => [...prev, feedback]);
    
    // Here you would typically send the feedback to the backend
    console.log('Feedback submitted:', feedback);
    
    // Reset the feedback state
    setFeedbackComment('');
    setShowFeedbackPopup(false);
    
    // Make an API call to store the feedback with proper error handling
    axios.post("http://localhost:8000/submit-feedback", feedback)
      .then(response => {
        console.log("Feedback submitted successfully:", response.data);
      })
      .catch(error => {
        console.error('Error submitting feedback:', error);
        // Still continue even if API call fails
      });
  };

  // Function to manually test feedback popup
  const testFeedbackPopup = () => {
    setShowFeedbackPopup(true);
  };

  return (
    <div className="flex h-[calc(100vh-70px)] w-screen absolute left-0 right-0 bottom-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-black/20 flex-1 overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-black/20">
          <div className="flex items-center gap-3">
            <Bot className="text-black" size={24} />
            <h3 className="text-xl font-semibold text-black">
              AI Assistant
            </h3>
            
            <div className="ml-auto flex gap-2">
              <motion.button
                onClick={testFeedbackPopup}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1 rounded-full text-sm border border-black text-black hover:bg-black/5"
              >
                <div className="flex items-center gap-2">
                  <span>Test Feedback</span>
                </div>
              </motion.button>
              
              <motion.button
                onClick={() => setShowReportGenerator(!showReportGenerator)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-3 py-1 rounded-full text-sm border ${
                  showReportGenerator
                    ? 'bg-black text-white border-black'
                    : 'border-black text-black hover:bg-black/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileOutput size={16} />
                  <span>Generate Report</span>
                </div>
              </motion.button>
              
              <motion.button
                onClick={() => setShowDirectoryExplorer(!showDirectoryExplorer)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-3 py-1 rounded-full text-sm border ${
                  showDirectoryExplorer
                    ? 'bg-black text-white border-black'
                    : 'border-black text-black hover:bg-black/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FolderTree size={16} />
                  <span>Directory Explorer</span>
                </div>
              </motion.button>
            </div>
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
                          ? 'bg-gradient-to-r from-black to-black/80 text-white shadow-lg'
                          : 'bg-gradient-to-r from-gray-100 to-black/5 text-gray-800'
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
                              ? 'bg-black/10 text-black' 
                              : 'bg-black/10 text-black'
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
            {generatedReport && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="my-4 p-4 border border-black/20 rounded-xl bg-black/5"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileOutput size={18} />
                    <h4 className="font-medium">Generated Report</h4>
                  </div>
                  <motion.button
                    onClick={downloadReport}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-black text-white px-3 py-1 rounded-full text-sm"
                  >
                    Download Report
                  </motion.button>
                </div>
                <div className="text-sm text-black/70 mb-2">
                  Based on: "{reportPrompt}"
                </div>
                <div className="bg-white p-3 rounded-lg max-h-[200px] overflow-y-auto text-sm">
                  <pre className="whitespace-pre-wrap font-mono text-xs">
                    {generatedReport.substring(0, 300)}
                    {generatedReport.length > 300 && '...'}
                  </pre>
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showReportGenerator && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-black/20 bg-black/5 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileOutput size={18} />
                  <h4 className="font-medium">Generate Report</h4>
                </div>
                <motion.button
                  onClick={() => setShowReportGenerator(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-black hover:text-black/70 p-1"
                >
                  <X size={16} />
                </motion.button>
              </div>
              <textarea
                value={reportPrompt}
                onChange={(e) => setReportPrompt(e.target.value)}
                placeholder="What kind of report do you need? Describe what you want to analyze or summarize..."
                className="w-full p-3 rounded-lg border border-black/20 focus:ring-2 focus:ring-black focus:border-transparent bg-white/80 mb-3"
                rows={3}
              />
              
              {selectedFiles.length > 0 ? (
                <div className="mb-3">
                  <div className="text-sm font-medium mb-2">Selected files for report:</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-white px-2 py-1 rounded-full text-xs border border-black/10"
                      >
                        <FileText size={12} />
                        {file.name}
                        <button
                          onClick={(e) => removeSelectedFile(file, e)}
                          className="hover:text-red-500 ml-1"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-black/70 mb-3">
                  No files selected. You can select files from the directory explorer or file selector.
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <motion.button
                  onClick={() => setShowReportGenerator(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 border border-black/30 text-black rounded-lg hover:bg-black/5"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={generateReport}
                  disabled={isGeneratingReport || !reportPrompt.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 ${
                    isGeneratingReport || !reportPrompt.trim()
                      ? 'bg-black/40 cursor-not-allowed'
                      : 'bg-black hover:bg-black/80 cursor-pointer'
                  } text-white rounded-lg shadow-md`}
                >
                  {isGeneratingReport ? 'Generating...' : 'Generate Report'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4 border-t border-black/20">
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
                  className="flex items-center gap-2 bg-black text-white px-3 py-1 rounded-full text-sm"
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
                <div className="flex flex-wrap gap-2 p-3 bg-black/5 rounded-lg max-h-[200px] overflow-y-auto">
                  <div className="w-full flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-black">Select files to attach</span>
                    <motion.button
                      onClick={() => setShowFileSelector(false)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-black hover:text-black/70"
                    >
                      <X size={16} />
                    </motion.button>
                  </div>
                  
                  <motion.button
                    onClick={triggerFileInput}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-3 py-2 bg-black/10 text-black hover:bg-black/20 rounded-lg"
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
                          ? 'bg-black text-white'
                          : 'bg-black/10 text-black hover:bg-black/20'
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
              className="flex-1 px-4 py-2 border border-black/30 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300"
              whileFocus={{ scale: 1.02 }}
              disabled={isSubmitting}
            />
            <motion.button
              type="button"
              onClick={() => setShowFileSelector(!showFileSelector)}
              className={`p-2 rounded-lg border ${
                showFileSelector 
                  ? 'bg-black text-white border-black' 
                  : 'border-black/30 text-black hover:bg-black/5'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isSubmitting}
            >
              <Paperclip size={20} />
            </motion.button>
            <motion.button
              type="submit"
              className={`px-4 py-2 bg-gradient-to-r from-black to-black/80 text-white rounded-lg shadow-lg ${isSubmitting ? 'opacity-70' : ''}`}
              whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                <Send size={20} />
              )}
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
            className="border-l border-black/20 bg-white/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="p-3 border-b border-black/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-black font-medium">
                  <FolderTree size={18} className="text-black" />
                  Directory Structure
                </div>
                <motion.button
                  onClick={() => setShowDirectoryExplorer(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-black hover:text-black/70 p-1 rounded-full hover:bg-black/10"
                >
                  <X size={16} />
                </motion.button>
              </div>
              <div className="text-xs text-black/70 mt-1">
                Drag files to the chat input to attach them
              </div>
            </div>
            <div className="h-full overflow-y-auto p-2 max-h-[calc(100vh-140px)]">
              {renderDirectoryItem(directoryStructure)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Popup */}
      <AnimatePresence>
        {showFeedbackPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowFeedbackPopup(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4"
              onClick={e => e.stopPropagation()}
              initial={{ y: 20 }}
              animate={{ y: 0 }}
            >
              <h3 className="text-xl font-semibold text-black mb-4">
                How's your experience with the assistant?
              </h3>
              <p className="text-black/70 mb-2">
                Your feedback helps us improve. Would you mind sharing your thoughts?
              </p>
              <p className="text-black/70 text-xs mb-6">
                (Interaction count: {userInteractionCount})
              </p>
              
              <div className="flex justify-center gap-4 mb-6">
                <motion.button
                  onClick={() => submitFeedback('like')}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-black/5"
                >
                  <div className="bg-green-100 p-3 rounded-full">
                    <ThumbsUp className="text-green-600" size={24} />
                  </div>
                  <span className="font-medium">I like it</span>
                </motion.button>
                
                <motion.button
                  onClick={() => submitFeedback('neutral')}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-black/5"
                >
                  <div className="bg-blue-100 p-3 rounded-full">
                    <span className="text-blue-600 text-2xl font-bold">•</span>
                  </div>
                  <span className="font-medium">Neutral</span>
                </motion.button>
                
                <motion.button
                  onClick={() => submitFeedback('dislike')}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-black/5"
                >
                  <div className="bg-red-100 p-3 rounded-full">
                    <ThumbsDown className="text-red-600" size={24} />
                  </div>
                  <span className="font-medium">I don't like it</span>
                </motion.button>
              </div>
              
              <div className="mb-4">
                <label htmlFor="feedbackComment" className="block text-sm font-medium text-black/70 mb-2">
                  Any additional comments? (optional)
                </label>
                <textarea
                  id="feedbackComment"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Tell us what you think..."
                  className="w-full p-3 rounded-lg border border-black/20 focus:ring-2 focus:ring-black focus:border-transparent"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <motion.button
                  onClick={() => setShowFeedbackPopup(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 border border-black/30 text-black rounded-lg hover:bg-black/5"
                >
                  Skip
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;