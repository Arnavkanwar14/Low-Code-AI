import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Home, 
  FolderOpen, 
  BarChart3, 
  Play, 
  Save, 
  Download, 
  Share2,
  Plus,
  Clock,
  Star,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Image,
  BarChart3 as BarChart,
  Database
} from 'lucide-react'

const Sidebar = ({ onImportData }) => {
  const [showImportModal, setShowImportModal] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [uploadMessage, setUploadMessage] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const fileInputRef = useRef(null)

  const menuItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: FolderOpen, label: 'Projects' },
    { icon: BarChart3, label: 'Analytics' },
    { icon: Play, label: 'Training' },
    { icon: Save, label: 'Models' },
  ]

  const validateFile = (file) => {
    const allowedTypes = [
      'text/csv',
      'application/json',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    
    const maxSize = 100 * 1024 * 1024 // 100MB
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, message: 'File type not supported. Please upload CSV, JSON, Excel, or image files.' }
    }
    
    if (file.size > maxSize) {
      return { valid: false, message: 'File size too large. Maximum size is 100MB.' }
    }
    
    return { valid: true, message: 'File is valid' }
  }

  const getFileType = (file) => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type === 'text/csv' || file.type.includes('excel')) return 'tabular'
    if (file.type === 'application/json') return 'text'
    return 'custom'
  }

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return Image
      case 'text': return FileText
      case 'tabular': return BarChart
      default: return Database
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    const validFiles = []
    
    files.forEach(file => {
      const validation = validateFile(file)
      if (validation.valid) {
        validFiles.push({
          file,
          name: file.name,
          size: formatFileSize(file.size),
          type: getFileType(file),
          id: Date.now() + Math.random()
        })
      } else {
        setUploadStatus('error')
        setUploadMessage(validation.message)
        setTimeout(() => {
          setUploadStatus(null)
          setUploadMessage('')
        }, 3000)
      }
    })
    
    setSelectedFiles(prev => [...prev, ...validFiles])
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const validFiles = []
    
    files.forEach(file => {
      const validation = validateFile(file)
      if (validation.valid) {
        validFiles.push({
          file,
          name: file.name,
          size: formatFileSize(file.size),
          type: getFileType(file),
          id: Date.now() + Math.random()
        })
      }
    })
    
    setSelectedFiles(prev => [...prev, ...validFiles])
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const processFiles = async () => {
    if (selectedFiles.length === 0) return
    
    setUploadStatus('uploading')
    setUploadMessage('Processing files...')
    
    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Call the parent function to add datasets
      if (onImportData) {
        onImportData(selectedFiles)
      }
      
      setUploadStatus('success')
      setUploadMessage(`${selectedFiles.length} files imported successfully!`)
      
      setTimeout(() => {
        setShowImportModal(false)
        setSelectedFiles([])
        setUploadStatus(null)
        setUploadMessage('')
      }, 2000)
      
    } catch (error) {
      setUploadStatus('error')
      setUploadMessage('Error processing files. Please try again.')
      setTimeout(() => {
        setUploadStatus(null)
        setUploadMessage('')
      }, 3000)
    }
  }

  return (
    <motion.aside 
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 glass-effect border-r border-cyan-500/30 p-6 space-y-8 neon-glow"
    >
      {/* Menu Items */}
      <nav className="space-y-2">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.label}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              item.active 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg neon-glow' 
                : 'hover:bg-cyan-500/20 text-gray-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </motion.button>
        ))}
      </nav>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-cyan-300 uppercase tracking-wider neon-text">
          Quick Actions
        </h3>
        <div className="space-y-2">
          <motion.button
            className="w-full flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl hover:shadow-cyan-500/50 transition-shadow neon-glow"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">New Project</span>
          </motion.button>
          
          <motion.button
            onClick={() => setShowImportModal(true)}
            className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-800/50 rounded-xl hover:bg-cyan-500/20 transition-colors text-gray-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-5 h-5 text-cyan-400" />
            <span className="font-medium">Import Data</span>
          </motion.button>
          
          <motion.button
            className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-800/50 rounded-xl hover:bg-cyan-500/20 transition-colors text-gray-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Share2 className="w-5 h-5 text-cyan-400" />
            <span className="font-medium">Share Model</span>
          </motion.button>
        </div>
      </div>

      {/* Import Data Modal */}
      {showImportModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowImportModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800/90 backdrop-blur-md rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-cyan-500/30 neon-glow"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-cyan-300 neon-text">Import Data Files</h2>
                  <p className="text-sm text-gray-400">Upload your datasets for AI training</p>
                </div>
              </div>
              <motion.button
                onClick={() => setShowImportModal(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".csv,.json,.xlsx,.xls,.jpg,.jpeg,.png,.gif,.webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Upload Status */}
            {uploadStatus && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
                  uploadStatus === 'success' 
                    ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                    : uploadStatus === 'error'
                    ? 'bg-red-500/20 border border-red-500/30 text-red-300'
                    : 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
                }`}
              >
                {uploadStatus === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : uploadStatus === 'error' ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <Download className="w-4 h-4 animate-pulse" />
                )}
                <span className="text-sm font-medium">{uploadMessage}</span>
              </motion.div>
            )}

            {/* Upload Area */}
            <motion.div 
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragOver 
                  ? 'border-cyan-400 bg-cyan-500/10' 
                  : 'border-cyan-500/50 bg-gray-800/20'
              }`}
              whileHover={{ scale: 1.02 }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleUploadClick}
            >
              <Download className={`w-12 h-12 mx-auto mb-4 ${
                isDragOver ? 'text-cyan-400' : 'text-cyan-500'
              }`} />
              <p className={`text-lg font-medium mb-2 ${
                isDragOver ? 'text-cyan-400' : 'text-gray-300'
              }`}>
                {isDragOver ? 'Drop your files here!' : 'Drop files here or click to browse'}
              </p>
              <p className="text-sm text-gray-400 mb-2">
                Supported formats: CSV, JSON, Excel, Images
              </p>
              <p className="text-xs text-gray-500">Maximum file size: 100MB per file</p>
            </motion.div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-cyan-300 mb-4">Selected Files ({selectedFiles.length})</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedFiles.map((file) => {
                    const IconComponent = getFileIcon(file.type)
                    return (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600/30"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg">
                            <IconComponent className="w-4 h-4 text-cyan-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-200">{file.name}</p>
                            <p className="text-xs text-gray-400">{file.size} • {file.type}</p>
                          </div>
                        </div>
                        <motion.button
                          onClick={() => removeFile(file.id)}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-700/50">
              <motion.button
                onClick={() => {
                  setShowImportModal(false)
                  setSelectedFiles([])
                  setUploadStatus(null)
                  setUploadMessage('')
                }}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={processFiles}
                disabled={selectedFiles.length === 0 || uploadStatus === 'uploading'}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  selectedFiles.length === 0 || uploadStatus === 'uploading'
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25'
                }`}
                whileHover={selectedFiles.length > 0 && uploadStatus !== 'uploading' ? { scale: 1.05 } : {}}
                whileTap={selectedFiles.length > 0 && uploadStatus !== 'uploading' ? { scale: 0.95 } : {}}
              >
                {uploadStatus === 'uploading' ? 'Processing...' : `Import ${selectedFiles.length} Files`}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.aside>
  )
}

export default Sidebar 