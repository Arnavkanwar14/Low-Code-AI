import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

// Import components one by one to identify issues
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import DatasetPanel from './components/DatasetPanel'
import DataCleaningPanel from './components/DataCleaningPanel'
import Workspace from './components/Workspace'
import FeaturesPanel from './components/FeaturesPanel'
import ResultsPanel from './components/ResultsPanel'

function App() {
  const [datasets, setDatasets] = useState([])
  const [features, setFeatures] = useState([])
  const [workspaceItems, setWorkspaceItems] = useState([])
  const [isTraining, setIsTraining] = useState(false)
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('linear_regression')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [modelResults, setModelResults] = useState(null)
  const [projects, setProjects] = useState([
    { id: 'proj-default', name: 'Default Project', createdAt: new Date().toISOString() },
    { id: 'proj-marketing', name: 'Marketing Churn', createdAt: new Date().toISOString() }
  ])
  const [selectedProjectId, setSelectedProjectId] = useState('proj-default')
  const [modelFeatureValues, setModelFeatureValues] = useState({})

  const modelFeatureConfig = {
    linear_regression: {
      label: 'Linear Regression',
      description: 'Good baseline for numeric targets',
      required: [
        { key: 'target', label: 'Target Column', type: 'text', placeholder: 'e.g. price' },
        { key: 'features', label: 'Feature Columns', type: 'text', placeholder: 'comma separated' }
      ]
    },
    random_forest: {
      label: 'Random Forest',
      description: 'Handles non-linearities and mixed data',
      required: [
        { key: 'target', label: 'Target Column', type: 'text', placeholder: 'e.g. churn_flag' },
        { key: 'max_depth', label: 'Max Depth', type: 'number', min: 2, max: 50, step: 1 },
        { key: 'n_estimators', label: 'Trees', type: 'number', min: 10, max: 500, step: 10 }
      ]
    },
    svm: {
      label: 'Support Vector Machine',
      description: 'Effective for high dimensional data',
      required: [
        { key: 'target', label: 'Target Column', type: 'text', placeholder: 'e.g. class' },
        { key: 'kernel', label: 'Kernel', type: 'select', options: ['linear', 'rbf', 'poly'] },
        { key: 'c', label: 'C (Regularization)', type: 'number', min: 0.01, max: 100, step: 0.01 }
      ]
    },
    knn: {
      label: 'KNN',
      description: 'Instance-based learner',
      required: [
        { key: 'target', label: 'Target Column', type: 'text', placeholder: 'e.g. label' },
        { key: 'neighbors', label: 'Neighbors (k)', type: 'number', min: 1, max: 50, step: 1 },
        { key: 'distance', label: 'Distance Metric', type: 'select', options: ['euclidean', 'manhattan', 'minkowski'] }
      ]
    },
    decision_tree: {
      label: 'Decision Tree',
      description: 'Interpretable splits',
      required: [
        { key: 'target', label: 'Target Column', type: 'text' },
        { key: 'max_depth', label: 'Max Depth', type: 'number', min: 2, max: 50, step: 1 },
        { key: 'min_samples_split', label: 'Min Samples Split', type: 'number', min: 2, max: 50, step: 1 }
      ]
    }
  }

  const handleProjectCreate = (name) => {
    if (!name?.trim()) return
    const newProject = { id: `proj-${Date.now()}`, name: name.trim(), createdAt: new Date().toISOString() }
    setProjects(prev => [...prev, newProject])
    setSelectedProjectId(newProject.id)
  }

  const handleProjectSelect = (projectId) => {
    setSelectedProjectId(projectId)
    // Placeholder for future backend sync per project
  }

  const handleProjectDelete = (projectId) => {
    setProjects(prev => {
      const next = prev.filter(p => p.id !== projectId)
      if (selectedProjectId === projectId) {
        setSelectedProjectId(next[0]?.id || '')
      }
      return next
    })
  }

  const handleFeatureValueChange = (modelKey, fieldKey, value) => {
    setModelFeatureValues(prev => ({
      ...prev,
      [modelKey]: {
        ...(prev[modelKey] || {}),
        [fieldKey]: value
      }
    }))
  }

  // Sample datasets for demonstration


  // Function to add imported files to datasets
  const addImportedDatasets = (importedFiles) => {
    const newDatasets = importedFiles.map(file => ({
      id: `dataset-${Date.now()}-${Math.random()}`,
      name: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
      type: file.type,
      size: file.size,
      samples: 'Unknown', // Will be calculated during processing
      file: file.file,
      uploadedAt: new Date().toISOString(),
      isImported: true
    }))
    
    setDatasets(prev => [...prev, ...newDatasets])
  }

  // Function to handle data cleaning completion
  const handleDataCleaned = (cleanedDataset) => {
    // Add the cleaned dataset to workspace automatically
    setWorkspaceItems(prev => [...prev, { ...cleanedDataset, id: `workspace-${Date.now()}` }])
  }

  // Handle drag and drop between panels
  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result

    // If dropped outside a droppable area
    if (!destination) return

    // If dropped in workspace
    if (destination.droppableId === 'workspace') {
      const dataset = datasets.find(d => d.id === draggableId)

      if (dataset) {
        setWorkspaceItems(prev => [...prev, { ...dataset, id: `workspace-${Date.now()}` }])
      }
    }

    // If dropped back to datasets
    if (destination.droppableId === 'datasets') {
      // Remove from workspace if it was there
      setWorkspaceItems(prev => prev.filter(item => item.id !== draggableId))
    }
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black relative overflow-auto">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
        
        <Header />
        
        <div className="flex h-screen pt-16 relative z-10">
          <Sidebar 
            onImportData={addImportedDatasets} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            projects={projects}
            selectedProjectId={selectedProjectId}
            onProjectCreate={handleProjectCreate}
            onProjectSelect={handleProjectSelect}
            onProjectDelete={handleProjectDelete}
          />
          <main className="flex-1 flex flex-col p-6 space-y-6">
            {activeTab === 'results' ? (
              <div className="h-full">
                <ResultsPanel 
                  modelResults={modelResults} 
                  isTraining={isTraining}
                  selectedProjectId={selectedProjectId}
                  projects={projects}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                {/* Left Panel - Datasets */}
                <div className="lg:col-span-1 space-y-6">
                  <DatasetPanel datasets={datasets} setDatasets={setDatasets} />
                  <DataCleaningPanel 
                    datasets={datasets} 
                    setDatasets={setDatasets} 
                    onDataCleaned={handleDataCleaned}
                  />
                </div>
                
                {/* Center Left - Features */}
                <div className="lg:col-span-1">
                  <FeaturesPanel 
                    features={features} 
                    selectedAlgorithm={selectedAlgorithm} 
                    setSelectedAlgorithm={setSelectedAlgorithm}
                    modelFeatureConfig={modelFeatureConfig}
                    featureValues={modelFeatureValues}
                    onFeatureChange={handleFeatureValueChange}
                  />
                </div>
                
                {/* Center Right - Workspace */}
                <div className="lg:col-span-1">
                  <Workspace workspaceItems={workspaceItems} setWorkspaceItems={setWorkspaceItems} />
                </div>
                
                {/* Right Panel - Configuration & Progress */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="kinesthetic-card neon-glow">
                    <h3 className="text-xl font-semibold text-cyan-300 neon-text mb-4">Model Config</h3>
                    <p className="text-gray-300">Model configuration will be loaded here</p>
                  </div>
                  <div className="kinesthetic-card neon-glow">
                    <h3 className="text-xl font-semibold text-cyan-300 neon-text mb-4">Training Progress</h3>
                    <p className="text-gray-300">Training progress will be loaded here</p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </DragDropContext>
  )
}

export default App