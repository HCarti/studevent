import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './Liquidation.css';

const Liquidation = () => {
  // State for file handling
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State for liquidation data
  const [uploadedData, setUploadedData] = useState(null);
  const [processedData, setProcessedData] = useState(null);

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
    setError('');
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
    // Add your liquidation-specific processing here
    // This is just an example - modify according to your needs
    const processed = data.map(item => ({
      ...item,
      // Example transformation: calculate net amount if gross and tax exist
      netAmount: item.grossAmount && item.tax 
        ? item.grossAmount - item.tax 
        : item.grossAmount,
      // Add other liquidation-specific calculations
      status: 'Pending' // Default status
    }));
    
    setProcessedData(processed);
  };

  const handleLiquidationSubmit = () => {
    // Add your submission logic here
    console.log('Submitting liquidation data:', processedData);
    alert('Liquidation data submitted successfully!');
  };

  return (
    <div className="liquidation-container">
      <h2>Liquidation</h2>
      
      {/* File Upload Section */}
      <div className="upload-section">
        <h3>Upload Excel File</h3>
        <div className="file-input-container">
          <label htmlFor="excel-upload" className="upload-label">
            {isLoading ? 'Processing...' : 'Select Excel File'}
            <input
              id="excel-upload"
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              disabled={isLoading}
              style={{ display: 'none' }}
            />
          </label>
          {fileName && !isLoading && (
            <div className="file-name">{fileName}</div>
          )}
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>

      {/* Data Preview Section */}
      {uploadedData && (
        <div className="data-section">
          <h3>Uploaded Data Preview</h3>
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
                      <td key={i}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Processed Liquidation Data Section */}
      {processedData && (
        <div className="liquidation-results">
          <h3>Liquidation Results</h3>
          <div className="results-table">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Gross Amount</th>
                  <th>Tax</th>
                  <th>Net Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {processedData.slice(0, 10).map((item, index) => (
                  <tr key={index}>
                    <td>{item.item || `Item ${index + 1}`}</td>
                    <td>{item.grossAmount?.toFixed(2) || 'N/A'}</td>
                    <td>{item.tax?.toFixed(2) || '0.00'}</td>
                    <td>{item.netAmount?.toFixed(2) || 'N/A'}</td>
                    <td>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button 
            onClick={handleLiquidationSubmit}
            className="submit-btn"
          >
            Submit Liquidation
          </button>
        </div>
      )}
    </div>
  );
};

export default Liquidation;