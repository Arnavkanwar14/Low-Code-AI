import React from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  Download,
  Share2
} from 'lucide-react'

const TrainingProgress = ({ progress, isTraining }) => {
  const metrics = [
    { label: 'Accuracy', value: '94.2%', trend: 'up', color: 'text-green-600' },
    { label: 'Loss', value: '0.023', trend: 'down', color: 'text-red-600' },
    { label: 'Epoch', value: '67/100', trend: 'neutral', color: 'text-blue-600' },
    { label: 'Time Left', value: '8m 32s', trend: 'neutral', color: 'text-gray-600' },
  ]

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down': return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
      default: return <BarChart3 className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="kinesthetic-card"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Training Progress</h2>
            <p className="text-sm text-gray-600">
              {isTraining ? 'Model is training...' : 'Training completed'}
            </p>
          </div>
        </div>
        
        {isTraining && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full"
          />
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-bold text-primary-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 bg-white/50 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">{metric.label}</span>
              {getTrendIcon(metric.trend)}
            </div>
            <div className={`text-lg font-bold ${metric.color}`}>
              {metric.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Training Status */}
      {isTraining ? (
        <motion.div 
          className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200"
          animate={{ 
            boxShadow: [
              "0 0 0 0 rgba(59, 130, 246, 0.4)",
              "0 0 0 10px rgba(59, 130, 246, 0)",
              "0 0 0 0 rgba(59, 130, 246, 0)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <div>
              <h4 className="text-sm font-medium text-gray-800">Training in Progress</h4>
              <p className="text-xs text-gray-600">Processing epoch 67 of 100</p>
            </div>
          </div>
        </motion.div>
      ) : progress >= 100 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200"
        >
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <h4 className="text-sm font-medium text-gray-800">Training Completed!</h4>
              <p className="text-xs text-gray-600">Model ready for deployment</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200"
        >
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-600" />
            <div>
              <h4 className="text-sm font-medium text-gray-800">Ready to Train</h4>
              <p className="text-xs text-gray-600">Add datasets and features to start</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      {progress >= 100 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex space-x-2 mt-6"
        >
          <motion.button
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-shadow"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Download Model</span>
          </motion.button>
          
          <motion.button
            className="flex items-center justify-center px-4 py-2 bg-white/50 rounded-lg hover:bg-white/70 transition-colors border border-gray-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share2 className="w-4 h-4 text-gray-600" />
          </motion.button>
        </motion.div>
      )}

      {/* Performance Chart Placeholder */}
      <div className="mt-6 p-4 bg-white/30 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-800">Performance Metrics</h4>
          <BarChart3 className="w-4 h-4 text-gray-600" />
        </div>
        <div className="h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded flex items-center justify-center">
          <span className="text-xs text-gray-500">Chart visualization would go here</span>
        </div>
      </div>
    </motion.div>
  )
}

export default TrainingProgress 