import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Zap, Settings, User, Bell } from 'lucide-react'

const Header = () => {
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-cyan-500/30 neon-glow"
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo and Brand */}
        <motion.div 
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.05 }}
        >
          <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl neon-glow">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient neon-text">AI Model Trainer</h1>
            <p className="text-sm text-gray-300">Low-Code Platform</p>
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <motion.button 
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-cyan-500/20 transition-colors text-cyan-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium">Quick Start</span>
          </motion.button>
          
          <motion.button 
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-cyan-500/20 transition-colors text-gray-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium">Settings</span>
          </motion.button>
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          <motion.button 
            className="p-2 rounded-lg hover:bg-cyan-500/20 transition-colors relative text-gray-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full neon-glow"></span>
          </motion.button>
          
          <motion.button 
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-cyan-500/50 transition-shadow neon-glow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">Profile</span>
          </motion.button>
        </div>
      </div>
    </motion.header>
  )
}

export default Header 