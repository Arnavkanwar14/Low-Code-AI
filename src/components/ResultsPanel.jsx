import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Target,
  Activity,
  Download,
  RefreshCw,
  Eye,
  Info,
  ChevronDown,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
)

const ResultsPanel = ({ modelResults, isTraining, selectedProjectId, projects = [] }) => {
  const [selectedModel, setSelectedModel] = useState('model_1')
  const [selectedMetric, setSelectedMetric] = useState('accuracy')
  const [chartType, setChartType] = useState('performance')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mock data - will be replaced with actual API data later
  const mockResults = {
    model_1: {
      name: 'Random Forest Classifier',
      status: 'completed',
      accuracy: 0.94,
      precision: 0.92,
      recall: 0.89,
      f1Score: 0.90,
      trainingTime: '2m 15s',
      createdAt: '2024-01-15T10:30:00Z',
      confusionMatrix: {
        truePositive: 85,
        trueNegative: 78,
        falsePositive: 12,
        falseNegative: 8
      },
      featureImportance: [
        { feature: 'Age', importance: 0.23 },
        { feature: 'Income', importance: 0.19 },
        { feature: 'Credit Score', importance: 0.18 },
        { feature: 'Employment', importance: 0.15 },
        { feature: 'Education', importance: 0.12 },
        { feature: 'Location', importance: 0.08 },
        { feature: 'Experience', importance: 0.05 }
      ],
      trainingProgress: [
        { epoch: 1, loss: 0.8, accuracy: 0.65 },
        { epoch: 2, loss: 0.6, accuracy: 0.72 },
        { epoch: 3, loss: 0.45, accuracy: 0.81 },
        { epoch: 4, loss: 0.35, accuracy: 0.87 },
        { epoch: 5, loss: 0.28, accuracy: 0.91 },
        { epoch: 6, loss: 0.22, accuracy: 0.94 }
      ]
    },
    model_2: {
      name: 'Neural Network',
      status: 'training',
      accuracy: 0.87,
      precision: 0.85,
      recall: 0.83,
      f1Score: 0.84,
      trainingTime: '5m 42s',
      createdAt: '2024-01-15T11:00:00Z'
    }
  }

  const hasRemoteModels = modelResults && Object.keys(modelResults || {}).length > 0
  const models = hasRemoteModels ? modelResults : mockResults
  const modelKeys = Object.keys(models)
  const safeSelectedModel = modelKeys.includes(selectedModel) ? selectedModel : modelKeys[0]
  const currentModel = models[safeSelectedModel] || mockResults.model_1
  const projectName = projects.find(p => p.id === selectedProjectId)?.name || 'Unassigned'

  // keep selection in sync when model set changes
  useEffect(() => {
    if (!modelKeys.includes(selectedModel) && modelKeys.length > 0) {
      setSelectedModel(modelKeys[0])
    }
  }, [modelKeys.join(','), selectedModel])

  // Chart configurations
  const performanceChartData = {
    labels: currentModel.trainingProgress?.map(p => `Epoch ${p.epoch}`) || [],
    datasets: [
      {
        label: 'Accuracy',
        data: currentModel.trainingProgress?.map(p => p.accuracy) || [],
        borderColor: 'rgb(34, 211, 238)',
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Loss',
        data: currentModel.trainingProgress?.map(p => p.loss) || [],
        borderColor: 'rgb(251, 146, 60)',
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  }

  const performanceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#e5e7eb' }
      },
      title: {
        display: true,
        text: 'Training Progress',
        color: '#22d3ee'
      }
    },
    scales: {
      x: { 
        grid: { color: 'rgba(229, 231, 235, 0.1)' },
        ticks: { color: '#9ca3af' }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: { color: 'rgba(229, 231, 235, 0.1)' },
        ticks: { color: '#9ca3af' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { color: '#9ca3af' }
      }
    }
  }

  const featureImportanceData = {
    labels: currentModel.featureImportance?.map(f => f.feature) || [],
    datasets: [
      {
        label: 'Feature Importance',
        data: currentModel.featureImportance?.map(f => f.importance) || [],
        backgroundColor: [
          'rgba(34, 211, 238, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgb(34, 211, 238)',
          'rgb(139, 92, 246)',
          'rgb(251, 146, 60)',
          'rgb(34, 197, 94)',
          'rgb(236, 72, 153)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2
      }
    ]
  }

  const featureImportanceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Feature Importance',
        color: '#22d3ee'
      }
    },
    scales: {
      x: { 
        grid: { color: 'rgba(229, 231, 235, 0.1)' },
        ticks: { color: '#9ca3af' }
      },
      y: {
        grid: { color: 'rgba(229, 231, 235, 0.1)' },
        ticks: { color: '#9ca3af' }
      }
    }
  }

  const confusionMatrixData = {
    labels: ['Predicted Negative', 'Predicted Positive'],
    datasets: [
      {
        label: 'Confusion Matrix',
        data: [
          currentModel.confusionMatrix?.trueNegative || 0,
          currentModel.confusionMatrix?.falsePositive || 0,
          currentModel.confusionMatrix?.falseNegative || 0,
          currentModel.confusionMatrix?.truePositive || 0
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(34, 211, 238, 0.8)'
        ]
      }
    ]
  }

  const metricsRadarData = {
    labels: ['Accuracy', 'Precision', 'Recall', 'F1-Score'],
    datasets: [
      {
        label: currentModel.name,
        data: [
          currentModel.accuracy || 0,
          currentModel.precision || 0,
          currentModel.recall || 0,
          currentModel.f1Score || 0
        ],
        backgroundColor: 'rgba(34, 211, 238, 0.2)',
        borderColor: 'rgb(34, 211, 238)',
        pointBackgroundColor: 'rgb(34, 211, 238)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(34, 211, 238)'
      }
    ]
  }

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#e5e7eb' }
      }
    },
    scales: {
      r: {
        angleLines: { color: 'rgba(229, 231, 235, 0.2)' },
        grid: { color: 'rgba(229, 231, 235, 0.2)' },
        pointLabels: { color: '#9ca3af' },
        ticks: { 
          color: '#9ca3af',
          backdropColor: 'transparent'
        },
        min: 0,
        max: 1
      }
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call - replace with actual API call later
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const handleExport = () => {
    const payload = {
      project: projectName,
      modelKey: safeSelectedModel,
      model: currentModel,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${projectName.replace(/\s+/g, '_') || 'model'}_${selectedModel}_results.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const chartTypes = [
    { value: 'performance', label: 'Training Performance', icon: TrendingUp },
    { value: 'features', label: 'Feature Importance', icon: BarChart3 },
    { value: 'confusion', label: 'Confusion Matrix', icon: Target },
    { value: 'metrics', label: 'Metrics Radar', icon: Activity }
  ]

  const renderChart = () => {
    const chartProps = { style: { height: '300px' } }
    
    switch (chartType) {
      case 'performance':
        return <Line data={performanceChartData} options={performanceChartOptions} {...chartProps} />
      case 'features':
        return <Bar data={featureImportanceData} options={featureImportanceOptions} {...chartProps} />
      case 'confusion':
        return <Doughnut data={confusionMatrixData} options={{ maintainAspectRatio: false }} {...chartProps} />
      case 'metrics':
        return <Radar data={metricsRadarData} options={radarOptions} {...chartProps} />
      default:
        return <Line data={performanceChartData} options={performanceChartOptions} {...chartProps} />
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="kinesthetic-card neon-glow h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-green-300 neon-text">Model Results</h2>
            <p className="text-sm text-gray-300">AI Model Performance Analytics</p>
            <p className="text-xs text-gray-400">Project: {projectName}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className={`w-4 h-4 text-gray-300 ${isRefreshing ? 'animate-spin' : ''}`} />
          </motion.button>
          
          <motion.button
            onClick={handleExport}
            className="p-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-4 h-4 text-gray-300" />
          </motion.button>
        </div>
      </div>

      {/* Model Selector */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-300 mb-2 block">Select Model</label>
        <div className="relative">
          <select
            value={safeSelectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none"
          >
            {Object.entries(models).map(([key, model]) => (
              <option key={key} value={key}>
                {model.name || key} {model.status === 'training' ? '(Training...)' : ''}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
        </div>
      </div>

      {/* Model Status */}
      <div className="mb-6 p-3 bg-gray-800/30 rounded-lg border border-gray-600/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">Status</span>
          <div className="flex items-center space-x-2">
            {currentModel.status === 'completed' ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
            )}
            <span className={`text-xs px-2 py-1 rounded-full ${
              currentModel.status === 'completed' 
                ? 'bg-green-500/20 text-green-300' 
                : 'bg-yellow-500/20 text-yellow-300'
            }`}>
              {currentModel.status === 'completed' ? 'Completed' : 'Training'}
            </span>
          </div>
        </div>
        
        {currentModel.status === 'completed' && (
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <p className="text-xs text-gray-400">Accuracy</p>
              <p className="text-lg font-semibold text-cyan-300">{(currentModel.accuracy * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Training Time</p>
              <p className="text-lg font-semibold text-green-300">{currentModel.trainingTime}</p>
            </div>
          </div>
        )}
      </div>

      {/* Chart Type Selector */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {chartTypes.map((type) => (
            <motion.button
              key={type.value}
              onClick={() => setChartType(type.value)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                chartType === type.value
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <type.icon className="w-3 h-3" />
              <span>{type.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 bg-gray-900/50 rounded-lg p-4 border border-gray-600/30">
        {isTraining && selectedModel === 'current' ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
              <p className="text-gray-300">Training in progress...</p>
              <p className="text-sm text-gray-400">Results will update automatically</p>
            </div>
          </div>
        ) : (
          renderChart()
        )}
      </div>


      {/* Quick Stats */}
      {currentModel.status === 'completed' && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            { label: 'Accuracy', value: currentModel.accuracy, color: 'text-cyan-300' },
            { label: 'Precision', value: currentModel.precision, color: 'text-green-300' },
            { label: 'Recall', value: currentModel.recall, color: 'text-yellow-300' },
            { label: 'F1-Score', value: currentModel.f1Score, color: 'text-purple-300' }
          ].map((stat) => (
            <div key={stat.label} className="text-center p-2 bg-gray-800/30 rounded-lg">
              <p className="text-xs text-gray-400">{stat.label}</p>
              <p className={`text-sm font-semibold ${stat.color}`}>
                {(stat.value * 100).toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default ResultsPanel