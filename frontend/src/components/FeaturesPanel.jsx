import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';

// Model Architecture settings (sync with ModelConfig)
const modelSettings = [
  { name: 'Hidden Layers', type: 'number', value: 3, min: 1, max: 10 },
  { name: 'Neurons per Layer', type: 'number', value: 128, min: 16, max: 1024 },
  { name: 'Dropout Rate', type: 'number', value: 0.2, min: 0, max: 0.9, step: 0.1 },
  { name: 'Activation Function', type: 'select', value: 'relu', options: ['relu', 'tanh', 'sigmoid', 'leaky_relu'] },
  { name: 'Algorithm', type: 'select', value: 'linear_regression', options: ['linear_regression', 'knn', 'random_forest', 'svm', 'decision_tree'] },
];

const FeaturesPanel = ({ features = [], selectedAlgorithm, setSelectedAlgorithm }) => {
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
        <h3 className="text-xl font-semibold text-cyan-300 neon-text">Features</h3>
      </div>
      <div className="space-y-4">
        {modelSettings.map((setting, idx) => (
          <div key={setting.name} className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">{setting.name}</label>
            <div className="flex items-center space-x-2">
              {setting.type === 'number' && (
                <input
                  type="number"
                  min={setting.min}
                  max={setting.max}
                  step={setting.step || 1}
                  defaultValue={setting.value}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-800 text-gray-200"
                />
              )}
              {setting.type === 'select' && (
                <select
                  value={setting.name === 'Algorithm' ? selectedAlgorithm : setting.value}
                  onChange={setting.name === 'Algorithm' ? e => setSelectedAlgorithm(e.target.value) : undefined}
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-800 text-gray-200"
                >
                  {setting.options.map(option => (
                    <option key={option} value={option}>
                      {(() => {
                        switch(option) {
                          case 'linear_regression': return 'Linear Regression';
                          case 'knn': return 'KNN';
                          case 'random_forest': return 'Random Forest';
                          case 'svm': return 'SVM';
                          case 'decision_tree': return 'Decision Tree';
                          default: return option.charAt(0).toUpperCase() + option.slice(1);
                        }
                      })()}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default FeaturesPanel;
