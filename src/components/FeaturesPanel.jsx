import React from 'react'
import { motion } from 'framer-motion'
import { Cpu, SlidersHorizontal } from 'lucide-react'

const FeaturesPanel = ({ features = [], selectedAlgorithm, setSelectedAlgorithm, modelFeatureConfig = {}, featureValues = {}, onFeatureChange }) => {
  const models = Object.entries(modelFeatureConfig)

  const currentConfig = modelFeatureConfig[selectedAlgorithm] || models[0]?.[1] || { required: [] }
  const currentModelKey = selectedAlgorithm || models[0]?.[0]
  const values = featureValues[currentModelKey] || {}

  const renderInput = (field) => {
    const commonProps = {
      className: 'w-full px-3 py-2 text-sm bg-gray-800 text-gray-200 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent',
      value: values[field.key] ?? '',
      onChange: (e) => onFeatureChange && onFeatureChange(currentModelKey, field.key, e.target.value),
      placeholder: field.placeholder || ''
    }

    if (field.type === 'select') {
      return (
        <select {...commonProps}>
          <option value="" disabled>Select an option</option>
          {field.options?.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )
    }

    return (
      <input
        {...commonProps}
        type={field.type === 'number' ? 'number' : 'text'}
        min={field.min}
        max={field.max}
        step={field.step || (field.type === 'number' ? 1 : undefined)}
      />
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="kinesthetic-card neon-glow"
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
          <Cpu className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-cyan-300 neon-text">Model & Features</h3>
          <p className="text-xs text-gray-400">Choose a model to see its required inputs</p>
        </div>
      </div>

      {/* Model selector */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-300 mb-2 block">Select Model</label>
        <div className="relative">
          <select
            value={currentModelKey}
            onChange={(e) => setSelectedAlgorithm && setSelectedAlgorithm(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800/70 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {models.map(([key, data]) => (
              <option key={key} value={key}>{data.label}</option>
            ))}
          </select>
          <SlidersHorizontal className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
        </div>
        {currentConfig?.description && (
          <p className="text-xs text-gray-400 mt-2">{currentConfig.description}</p>
        )}
      </div>

      {/* Required fields for selected model */}
      <div className="space-y-3">
        {currentConfig.required?.map((field) => (
          <div key={field.key} className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-200">{field.label}</label>
              <span className="text-xs text-gray-400">Required</span>
            </div>
            {renderInput(field)}
          </div>
        ))}
        {currentConfig.required?.length === 0 && (
          <p className="text-sm text-gray-400">No required fields for this model.</p>
        )}
      </div>

      {/* Optional: user provided feature names list */}
      {features?.length > 0 && (
        <div className="mt-4 p-3 rounded-lg border border-gray-700/50 bg-gray-900/30">
          <p className="text-xs text-gray-400 mb-2">Workspace features</p>
          <div className="flex flex-wrap gap-2">
            {features.map((f) => (
              <span key={f} className="px-2 py-1 text-xs rounded bg-cyan-500/10 text-cyan-200 border border-cyan-500/30">
                {f}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default FeaturesPanel
