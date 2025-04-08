import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';

interface AuthFormProps {
  isSignUp: boolean;
  onAuth: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ isSignUp, onAuth }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      setLoading(false);
      onAuth();
    }, 1500);
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-gray-200">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        {isSignUp ? 'Create Account' : 'Welcome Back'}
      </h2>
      
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none transition-all"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none transition-all"
            placeholder="Enter your password"
          />
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white py-2 px-4 rounded-xl hover:from-teal-700 hover:to-blue-700 transition-all disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader className="animate-spin" size={20} />
              Processing...
            </span>
          ) : (
            isSignUp ? 'Create Account' : 'Sign In'
          )}
        </motion.button>
      </motion.form>
    </div>
  );
};

export default AuthForm;