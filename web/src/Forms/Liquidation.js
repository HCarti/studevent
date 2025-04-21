import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import './Liquidation.css';

const Liquidation = () => {
  // State for file handling
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fileBlob, setFileBlob] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // State for liquidation data
  const [uploadedData, setUploadedData] = useState(null);
  const [processedData, setProcessedData] = useState(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid Excel file (xls, xlsx, csv)');
      return;
    }

    setFileName(file.name);
    setFileBlob(file);
    setError('');
    setSuccess('');
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Process the first sheet by default
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        setUploadedData(jsonData);
        processLiquidationData(jsonData);
      } catch (err) {
        setError('Error processing file. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  const processLiquidationData = (data) => {
    const processed = data.map(item => ({
      ...item,
      netAmount: item.grossAmount && item.tax 
        ? item.grossAmount - item.tax 
        : item.grossAmount,
      status: 'Pending'
    }));
    setProcessedData(processed);
  };

  const handleLiquidationSubmit = async () => {
    if (!fileBlob) {
      setError('No file selected');
      return;
    }
  
    setIsLoading(true);
    setError('');
    setSuccess('');
  
    try {
      const formData = new FormData();
      formData.append('file', fileBlob);
      formData.append('organization', 'Your Organization Name'); // Add organization
      
      // If you have processed data to send:
      if (processedData) {
        formData.append('processedData', JSON.stringify(processedData));
      }
  
      const response = await fetch('https://studevent-server.vercel.app/api/liquidation/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
  
      const data = await response.json();
  
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Submission failed');
      }
  
      setSuccess('Liquidation submitted successfully!');
      // Reset form
      setFileName('');
      setUploadedData(null);
      setProcessedData(null);
      setFileBlob(null);
      document.getElementById('excel-upload').value = '';
    } catch (error) {
      setError(error.message || 'Submission failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="liquidation-container">
      {/* File Upload Section */}
      <div className="upload-section">
        <h2 className="section-title">Liquidation</h2>
        <h3 className="section-subtitle">Upload Excel File</h3>
        
        <div 
          className={`dropzone ${isDragging ? 'dragging' : ''} ${fileName ? 'has-file' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="dropzone-content">
            {isLoading ? (
              <div className="file-loader">
                <div className="loader"></div>
                <p>Processing your file...</p>
              </div>
            ) : fileName ? (
              <div className="file-preview">
                <div className="file-icon">
                  <svg viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                    <path fill="#34A853" d="M14 2v6h6"/>
                    <path fill="#FBBC05" d="M14 8h6l-6-6v6z"/>
                  </svg>
                </div>
                <div className="file-info">
                  <p className="file-name">{fileName}</p>
                  <p className="file-size">{fileBlob && (fileBlob.size / 1024).toFixed(2)} KB</p>
                </div>
                <button 
                  className="change-file-btn"
                  onClick={() => {
                    setFileName('');
                    setFileBlob(null);
                    document.getElementById('excel-upload').value = '';
                  }}
                >
                  Change File
                </button>
              </div>
            ) : (
              <>
                <div className="upload-icon">
                  <svg viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                </div>
                <p className="dropzone-text">Drag & drop your Excel file here or</p>
                <label htmlFor="excel-upload" className="browse-btn">
                  Browse Files
                  <input
                    id="excel-upload"
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileChange}
                    disabled={isLoading}
                    style={{ display: 'none' }}
                  />
                </label>
                <p className="file-requirements">Supports: .xlsx, .xls, .csv</p>
              </>
            )}
          </div>
        </div>

        {processedData && (
       
       <button 
         onClick={handleLiquidationSubmit}
         className="submit-btn"
         disabled={isLoading || !fileBlob}
       >
         {isLoading ? (
           <>
             <span className="spinner"></span>
             Submitting...
           </>
         ) : (
           'Submit Liquidation'
         )}
       </button>
   )}
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </div>

      {/* Data Preview Section */}
      {uploadedData && (
        <div className="data-section">
          <h3 className="section-subtitle">Uploaded Data Preview</h3>
          <div className="data-preview">
            <table>
              <thead>
                <tr>
                  {Object.keys(uploadedData[0]).map(key => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {uploadedData.slice(0, 5).map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, i) => (
                      <td key={i}>{typeof value === 'number' ? value.toFixed(2) : value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Processed Liquidation Data Section */}
    </div>
  );
};

export default Liquidation;