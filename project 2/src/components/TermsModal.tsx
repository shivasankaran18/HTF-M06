import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface TermsModalProps {
  onAccept: () => void;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ onAccept, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-teal-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-teal-200"
      >
        <motion.div 
          className="p-6 border-b border-teal-200 flex justify-between items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold text-teal-800">Terms and Conditions</h2>
          <motion.button
            onClick={onClose}
            className="p-2 hover:bg-teal-100 rounded-full transition-colors"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={20} className="text-teal-600" />
          </motion.button>
        </motion.div>

        <motion.div 
          className="p-6 overflow-y-auto max-h-[50vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="prose prose-teal">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-teal-700">1. Acceptance of Terms</h3>
              <p className="text-gray-700">By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-teal-700">2. Use License</h3>
              <p className="text-gray-700">Permission is granted to temporarily download one copy of the materials (information or software) on this website for personal, non-commercial transitory viewing only.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-teal-700">3. Privacy Policy</h3>
              <p className="text-gray-700">Your use of this website is also governed by our Privacy Policy, which is incorporated into these terms and conditions by reference.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="text-teal-700">4. File Upload Guidelines</h3>
              <p className="text-gray-700">Users are responsible for the content they upload. Prohibited content includes but is not limited to malicious software, copyrighted material without permission, and illegal content.</p>
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          className="p-6 border-t border-teal-200 flex justify-end gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-teal-300 hover:bg-teal-50 transition-colors text-teal-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Decline
          </motion.button>
          <motion.button
            onClick={onAccept}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Accept
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default TermsModal;