import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Database, 
  Upload, 
  FileText, 
  BarChart3, 
  Plus,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Filter,
  Scissors,
  Zap,
  Download,
  Info
} from 'lucide-react'

const DataCleaningPanel = ({ datasets, setDatasets, onDataCleaned }) => {
  const [selectedDataset, setSelectedDataset] = useState(null)
  const [cleanedData, setCleanedData] = useState(null)
  const [cleaningSteps, setCleaningSteps] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [cleaningProgress, setCleaningProgress] = useState(0)
  const [dataStats, setDataStats] = useState(null)
  const [cleaningOptions, setCleaningOptions] = useState({
    removeMissingValues: true,
    removeDuplicates: true,
    handleOutliers: false,
    normalizeData: false
  })

  const getDatasetIcon = (type) => {
    switch (type) {
      case 'image': return Eye
      case 'text': return FileText
      case 'tabular': return BarChart3
      default: return Database
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'image': return 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
      case 'text': return 'bg-green-500/20 text-green-300 border border-green-500/30'
      case 'tabular': return 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
    }
  }

  const analyzeData = async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('http://localhost:5000/api/analyze-data', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Failed to analyze data')
      }
      
      const result = await response.json()
      
      if (result.success) {
        return {
          data: result.preview,
          stats: {
            rows: result.stats.rows,
            columns: result.stats.columns,
            missingValues: result.stats.missing_values,
            duplicates: result.stats.duplicates,
            dataTypes: result.stats.data_types
          }
        }
      } else {
        throw new Error(result.error || 'Analysis failed')
      }
    } catch (error) {
      console.error('Error analyzing data:', error)
      return { data: null, stats: null, error: error.message }
    }
  }

  const cleanData = async (file, options) => {
    setIsProcessing(true)
    setCleaningProgress(0)
    setCleaningSteps([])

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('options', JSON.stringify(options))
      
      setCleaningProgress(10)
      setCleaningSteps([{ step: 'Uploading file to server...', status: 'processing' }])
      
      const response = await fetch('http://localhost:5000/api/clean-data', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Failed to clean data')
      }
      
      const result = await response.json()
      
      if (result.success) {
        setCleaningProgress(100)
        
        // Convert backend steps to frontend format
        const steps = result.cleaning_steps.map(step => ({
          step: step.step,
          description: step.description,
          status: 'completed'
        }))
        
        steps.push({ step: 'Data cleaning completed!', status: 'completed' })
        setCleaningSteps(steps)
        
        setIsProcessing(false)
        
        return {
          cleanedData: result.preview,
          finalStats: {
            rows: result.final_stats.final_rows,
            columns: result.final_stats.final_columns,
            missingValues: result.final_stats.missing_values,
            duplicates: result.final_stats.duplicates
          },
          cleanedFile: result.cleaned_file
        }
      } else {
        throw new Error(result.error || 'Cleaning failed')
      }
    } catch (error) {
      console.error('Error cleaning data:', error)
      setCleaningSteps([{ step: `Error: ${error.message}`, status: 'error' }])
      setIsProcessing(false)
      throw error
    }
  }

  const handleDatasetSelect = async (dataset) => {
    setSelectedDataset(dataset)
    setCleanedData(null)
    setCleaningSteps([])
    setDataStats(null)
    
    if (dataset.file) {
      const { data, stats } = await analyzeData(dataset.file)
      if (data && stats) {
        setDataStats(stats)
      }
    }
  }

  const handleCleanData = async () => {
    if (!selectedDataset || !selectedDataset.file) return
    
    try {
      const { cleanedData: cleaned, finalStats, cleanedFile } = await cleanData(selectedDataset.file, cleaningOptions)
      setCleanedData(cleaned)
      setDataStats(finalStats)
      
      // Create new cleaned dataset
      const cleanedDataset = {
        id: `cleaned-${Date.now()}`,
        name: `${selectedDataset.name} (Cleaned)`,
        type: 'tabular',
        size: selectedDataset.size,
        samples: finalStats.rows.toString(),
        file: selectedDataset.file,
        uploadedAt: new Date().toISOString(),
        isCleaned: true,
        originalDataset: selectedDataset.id,
        cleaningSteps: cleaningSteps,
        cleanedFile: cleanedFile
      }
      
      setDatasets(prev => [...prev, cleanedDataset])
      if (onDataCleaned) {
        onDataCleaned(cleanedDataset)
      }
    } catch (error) {
      console.error('Error in handleCleanData:', error)
      // Error is already handled in cleanData function
    }
  }

  const exportCleanedData = async () => {
    if (!cleanedData || !selectedDataset.cleanedFile) return
    
    try {
      // Download the cleaned file from the backend
      const response = await fetch(`http://localhost:5000/api/download/${selectedDataset.cleanedFile}`)
      
      if (!response.ok) {
        throw new Error('Failed to download cleaned file')
      }
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = selectedDataset.cleanedFile
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting cleaned data:', error)
      // Fallback to client-side export
      const content = JSON.stringify(cleanedData, null, 2)
      const blob = new Blob([content], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedDataset.name}_cleaned.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="kinesthetic-card neon-glow"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-purple-300 neon-text">Data Cleaning</h2>
            <p className="text-sm text-gray-300">Clean and preprocess your datasets</p>
          </div>
        </div>
      </div>

      {/* Dataset Selection */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-200 mb-3">Select Dataset to Clean</h3>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {datasets.filter(d => d.type === 'tabular').map((dataset) => (
            <motion.div
              key={dataset.id}
              onClick={() => handleDatasetSelect(dataset)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                selectedDataset?.id === dataset.id
                  ? 'bg-purple-500/20 border border-purple-500/50'
                  : 'bg-gray-700/50 border border-gray-600/50 hover:bg-gray-600/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <div>
                  <h4 className="text-sm font-medium text-gray-200">{dataset.name}</h4>
                  <p className="text-xs text-gray-400">{dataset.samples} samples • {dataset.size}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Data Statistics */}
      {dataStats && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-600/50"
        >
          <h3 className="text-md font-medium text-gray-200 mb-3 flex items-center">
            <Info className="w-4 h-4 mr-2 text-blue-400" />
            Data Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Rows: <span className="text-blue-300">{dataStats.rows}</span></p>
              <p className="text-gray-400">Columns: <span className="text-blue-300">{dataStats.columns}</span></p>
            </div>
            <div>
              <p className="text-gray-400">Missing Values: <span className="text-orange-300">{dataStats.missingValues}</span></p>
              <p className="text-gray-400">Duplicates: <span className="text-red-300">{dataStats.duplicates}</span></p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Cleaning Options */}
      {selectedDataset && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6"
        >
          <h3 className="text-md font-medium text-gray-200 mb-3">Cleaning Options</h3>
          <div className="space-y-3">
            {Object.entries(cleaningOptions).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setCleaningOptions(prev => ({
                    ...prev,
                    [key]: e.target.checked
                  }))}
                  className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span className="text-sm text-gray-300 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </span>
              </label>
            ))}
          </div>
        </motion.div>
      )}

      {/* Clean Data Button */}
      {selectedDataset && (
        <motion.button
          onClick={handleCleanData}
          disabled={isProcessing}
          className="w-full mb-6 p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: isProcessing ? 1 : 1.02 }}
          whileTap={{ scale: isProcessing ? 1 : 0.98 }}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Cleaning Data...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Clean Data</span>
            </div>
          )}
        </motion.button>
      )}

      {/* Progress Bar */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${cleaningProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1 text-center">{cleaningProgress}% Complete</p>
        </motion.div>
      )}

      {/* Cleaning Steps */}
      {cleaningSteps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6"
        >
          <h3 className="text-md font-medium text-gray-200 mb-3">Cleaning Steps</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {cleaningSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center space-x-2 p-2 rounded ${
                  step.status === 'completed' 
                    ? 'bg-green-500/10 border border-green-500/30' 
                    : 'bg-blue-500/10 border border-blue-500/30'
                }`}
              >
                {step.status === 'completed' ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                )}
                <span className="text-sm text-gray-300">{step.step}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Export Button */}
      {cleanedData && (
        <motion.button
          onClick={exportCleanedData}
          className="w-full p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Cleaned Data</span>
          </div>
        </motion.button>
      )}
    </motion.div>
  )
}

export default DataCleaningPanel
