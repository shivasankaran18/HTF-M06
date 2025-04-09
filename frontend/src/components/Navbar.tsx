import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MessageSquare,
  FolderOpen,
  User,
  FileText,
  LogOut,
} from "lucide-react";
import { useAuth } from "../utils/AuthContext";

interface NavbarProps {
  userName?: string;
  userAvatar?: string;
  uploadedFilesCount: number;
  isUploadComplete: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  userName = "User",
  userAvatar,
  uploadedFilesCount,
  isUploadComplete,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentView = location.pathname === "/upload" ? "upload" : "chat";
  const { logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleViewChange = (view: "upload" | "chat") => {
    if (view === "upload") {
      navigate("/upload");
    } else if (view === "chat") {
      navigate("/chat");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
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
              onClick={() => handleViewChange("upload")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                currentView === "upload"
                  ? "bg-black text-[#FFFDF2] font-medium"
                  : "text-black hover:bg-black/10"
              }`}
            >
              <FolderOpen size={18} />
              <span className="hidden md:inline">Upload Directory</span>
            </motion.button>

            <motion.button
              onClick={() => handleViewChange("chat")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                currentView === "chat"
                  ? "bg-black text-[#FFFDF2] font-medium"
                  : "text-black hover:bg-black/10"
              } ${uploadedFilesCount === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
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
          <div className="relative">
            <motion.div
              className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg hover:bg-black/10 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="h-8 w-8 rounded-full ring-2 ring-black group-hover:ring-black transition-all"
                />
              ) : (
                <div className="h-8 w-8 bg-black rounded-full flex items-center justify-center ring-2 ring-black group-hover:ring-black transition-all">
                  <User size={16} className="text-[#FFFDF2]" />
                </div>
              )}
              <div className="hidden md:flex flex-col">
                <span className="text-black font-medium leading-tight">
                  {userName}
                </span>
                <span className="text-black/60 text-xs leading-tight">
                  Account
                </span>
              </div>
            </motion.div>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
                >
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-black hover:bg-black/5 rounded-lg"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
