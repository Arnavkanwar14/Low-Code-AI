import React from 'react'
import { motion } from 'framer-motion'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import { 
  Play, 
  Square, 
  RotateCcw, 
  Save, 
  Download, 
  Trash2,
  Database,
  Cpu,
  Link,
  Zap
} from 'lucide-react'

const Workspace = ({ workspaceItems, setWorkspaceItems }) => {
  const getItemIcon = (type) => {
    switch (type) {
      case 'dataset': return Database
      case 'feature': return Cpu
      default: return Database
    }
  }

  const getItemColor = (type) => {
    switch (type) {
      case 'dataset': return 'from-blue-500 to-blue-600'
      case 'feature': return 'from-purple-500 to-purple-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getItemBgColor = (type) => {
    switch (type) {
      case 'dataset': return 'from-blue-50 to-blue-100'
      case 'feature': return 'from-purple-50 to-purple-100'
      default: return 'from-gray-50 to-gray-100'
    }
  }

  const removeItem = (itemId) => {
    setWorkspaceItems(prev => prev.filter(item => item.id !== itemId))
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="kinesthetic-card h-full flex flex-col neon-glow"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-cyan-300 neon-text">Training Workspace</h2>
            <p className="text-sm text-gray-300">Build your AI model pipeline</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            disabled={workspaceItems.length === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              workspaceItems.length === 0
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg'
            }`}
            whileHover={workspaceItems.length > 0 ? { scale: 1.05 } : {}}
            whileTap={workspaceItems.length > 0 ? { scale: 0.95 } : {}}
          >
            <Play className="w-4 h-4" />
            <span className="text-sm font-medium">Train</span>
          </motion.button>
          
          <motion.button
            className="p-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-4 h-4 text-gray-300" />
          </motion.button>
        </div>
      </div>

      {/* Workspace Area */}
      <Droppable droppableId="workspace">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 drop-zone ${
              snapshot.isDraggingOver 
                ? 'drag-over bg-gradient-to-r from-cyan-500/10 to-blue-500/10' 
                : 'bg-gradient-to-br from-gray-800/20 to-blue-900/20'
            }`}
          >
            {workspaceItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mb-4"
                >
                  <div className="p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full">
                    <Zap className="w-8 h-8 text-cyan-400" />
                  </div>
                </motion.div>
                <h3 className="text-lg font-semibold text-cyan-200 mb-2">
                  Start Building Your Model
                </h3>
                <p className="text-gray-300 max-w-sm">
                  Drag datasets and features from the left panels to create your AI training pipeline
                </p>
                <div className="mt-6 flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4" />
                    <span>Datasets</span>
                  </div>
                  <Link className="w-4 h-4" />
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4" />
                    <span>Features</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {workspaceItems.map((item, index) => {
                  const IconComponent = getItemIcon(item.type)
                  return (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-4 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-xl border border-cyan-500/30 shadow-lg ${
                            snapshot.isDragging ? 'rotate-2 shadow-2xl' : ''
                          }`}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg">
                                <IconComponent className="w-4 h-4 text-cyan-400" />
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-200">{item.name}</h3>
                                <p className="text-sm text-gray-400 capitalize">{item.type}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-400">
                                #{index + 1}
                              </span>
                              <motion.button
                                onClick={() => removeItem(item.id)}
                                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </div>
                          
                          {/* Connection Line */}
                          {index < workspaceItems.length - 1 && (
                            <div className="flex justify-center mt-4">
                              <div className="w-0.5 h-6 bg-gradient-to-b from-cyan-400 to-blue-400"></div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </div>
            )}
          </div>
        )}
      </Droppable>

      {/* Action Buttons */}
      {workspaceItems.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700/50"
        >
                      <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-300">
                {workspaceItems.length} item{workspaceItems.length !== 1 ? 's' : ''} in pipeline
              </span>
            </div>
          
                      <div className="flex items-center space-x-2">
              <motion.button
                className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Save className="w-4 h-4 text-gray-300" />
                <span className="text-sm font-medium text-gray-200">Save</span>
              </motion.button>
              
              <motion.button
                className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-4 h-4 text-gray-300" />
                <span className="text-sm font-medium text-gray-200">Export</span>
              </motion.button>
            </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default Workspace 