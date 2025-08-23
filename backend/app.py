from  flask import Flask,request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import numpy as np
import io
import json
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'data-cleaning-api'
    })

@app.route('/api/analyze-data', methods=['POST'])
def analyze_data():
    """Analyze uploaded data file and return statistics"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Read file based on type
        filename = file.filename.lower()
        if filename.endswith('.csv'):
            df = pd.read_csv(file)
        elif filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(file)
        elif filename.endswith('.json'):
            df = pd.read_json(file)
        else:
            return jsonify({'error': 'Unsupported file format'}), 400
        
        # Calculate statistics
        stats = {
            'rows': len(df),
            'columns': len(df.columns),
            'missing_values': df.isnull().sum().sum(),
            'duplicates': df.duplicated().sum(),
            'column_info': {},
            'data_types': df.dtypes.astype(str).to_dict(),
            'memory_usage': df.memory_usage(deep=True).sum(),
            'file_size': len(file.read()) if hasattr(file, 'read') else 0
        }
        
        # Analyze each column
        for column in df.columns:
            col_stats = {
                'type': str(df[column].dtype),
                'missing_count': df[column].isnull().sum(),
                'unique_count': df[column].nunique(),
                'sample_values': df[column].dropna().head(5).tolist()
            }
            
            # Add numeric statistics if applicable
            if pd.api.types.is_numeric_dtype(df[column]):
                col_stats.update({
                    'min': float(df[column].min()) if not df[column].isnull().all() else None,
                    'max': float(df[column].max()) if not df[column].isnull().all() else None,
                    'mean': float(df[column].mean()) if not df[column].isnull().all() else None,
                    'std': float(df[column].std()) if not df[column].isnull().all() else None
                })
            
            stats['column_info'][column] = col_stats
        
        return jsonify({
            'success': True,
            'stats': stats,
            'preview': df.head(10).to_dict('records')
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/clean-data', methods=['POST'])
def clean_data():
    """Clean data based on provided options"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        options = request.form.get('options', '{}')
        options = json.loads(options)
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Read file
        filename = file.filename.lower()
        if filename.endswith('.csv'):
            df = pd.read_csv(file)
        elif filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(file)
        elif filename.endswith('.json'):
            df = pd.read_json(file)
        else:
            return jsonify({'error': 'Unsupported file format'}), 400
        
        original_shape = df.shape
        cleaning_steps = []
        
        # Step 1: Remove missing values
        if options.get('removeMissingValues', False):
            initial_missing = df.isnull().sum().sum()
            df = df.dropna()
            final_missing = df.isnull().sum().sum()
            removed_missing = initial_missing - final_missing
            cleaning_steps.append({
                'step': 'Remove Missing Values',
                'description': f'Removed {removed_missing} missing values',
                'rows_removed': original_shape[0] - len(df)
            })
        
        # Step 2: Remove duplicates
        if options.get('removeDuplicates', False):
            initial_duplicates = df.duplicated().sum()
            df = df.drop_duplicates()
            final_duplicates = df.duplicated().sum()
            removed_duplicates = initial_duplicates - final_duplicates
            cleaning_steps.append({
                'step': 'Remove Duplicates',
                'description': f'Removed {removed_duplicates} duplicate rows',
                'rows_removed': original_shape[0] - len(df)
            })
        
        # Step 3: Handle outliers (IQR method for numeric columns)
        if options.get('handleOutliers', False):
            outlier_removed = 0
            for column in df.select_dtypes(include=[np.number]).columns:
                Q1 = df[column].quantile(0.25)
                Q3 = df[column].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                
                outliers = df[(df[column] < lower_bound) | (df[column] > upper_bound)]
                outlier_removed += len(outliers)
                df = df[(df[column] >= lower_bound) & (df[column] <= upper_bound)]
            
            if outlier_removed > 0:
                cleaning_steps.append({
                    'step': 'Handle Outliers',
                    'description': f'Removed {outlier_removed} outliers using IQR method',
                    'rows_removed': outlier_removed
                })
        
        # Step 4: Normalize data (Z-score normalization for numeric columns)
        if options.get('normalizeData', False):
            numeric_columns = df.select_dtypes(include=[np.number]).columns
            for column in numeric_columns:
                if df[column].std() != 0:  # Avoid division by zero
                    df[column] = (df[column] - df[column].mean()) / df[column].std()
            
            cleaning_steps.append({
                'step': 'Normalize Data',
                'description': f'Normalized {len(numeric_columns)} numeric columns using Z-score',
                'columns_normalized': len(numeric_columns)
            })
        
        # Calculate final statistics
        final_stats = {
            'original_rows': original_shape[0],
            'original_columns': original_shape[1],
            'final_rows': len(df),
            'final_columns': len(df.columns),
            'rows_removed': original_shape[0] - len(df),
            'missing_values': df.isnull().sum().sum(),
            'duplicates': df.duplicated().sum()
        }
        
        # Save cleaned data
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        cleaned_filename = f"cleaned_data_{timestamp}.csv"
        cleaned_filepath = os.path.join(app.config['UPLOAD_FOLDER'], cleaned_filename)
        df.to_csv(cleaned_filepath, index=False)
        
        return jsonify({
            'success': True,
            'cleaning_steps': cleaning_steps,
            'final_stats': final_stats,
            'preview': df.head(10).to_dict('records'),
            'cleaned_file': cleaned_filename
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download/<filename>', methods=['GET'])
def download_file(filename):
    """Download cleaned data file"""
    try:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if not os.path.exists(filepath):
            return jsonify({'error': 'File not found'}), 404
        
        return send_file(filepath, as_attachment=True)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/export-data', methods=['POST'])
def export_data():
    """Export data in specified format"""
    try:
        data = request.json.get('data')
        format_type = request.json.get('format', 'csv')
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        df = pd.DataFrame(data)
        
        # Create output buffer
        output = io.StringIO()
        
        if format_type == 'csv':
            df.to_csv(output, index=False)
            content = output.getvalue()
            mimetype = 'text/csv'
        elif format_type == 'json':
            content = df.to_json(orient='records', indent=2)
            mimetype = 'application/json'
        else:
            return jsonify({'error': 'Unsupported format'}), 400
        
        return jsonify({
            'success': True,
            'content': content,
            'format': format_type,
            'mimetype': mimetype
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
