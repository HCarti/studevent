import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
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
  const [submittedLiquidations, setSubmittedLiquidations] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [modalFile, setModalFile] = useState(null);
  const [modalRemarks, setModalRemarks] = useState('');

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

  useEffect(() => {
    const fetchSubmittedLiquidations = async () => {
      try {
        setLoadingSubmissions(true);
        const response = await fetch('https://studevent-server.vercel.app/api/liquidation/my-submissions', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const data = await response.json();
        if (response.ok) {
          setSubmittedLiquidations(data.data || []);
        } else {
          throw new Error(data.message || 'Failed to fetch submissions');
        }
      } catch (error) {
        console.error('Error fetching liquidations:', error);
        setError('Could not load your submissions');
      } finally {
        setLoadingSubmissions(false);
      }
    };

    fetchSubmittedLiquidations();
  }, [success]); // Refetch when new submission succeeds

  const openSubmissionModal = (submission) => {
    setSelectedSubmission(submission);
    setModalRemarks(submission.remarks || '');
  };


    // Handle file change for modal
    const handleModalFileChange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
  
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid Excel file (xls, xlsx, csv)');
        return;
      }
  
      setModalFile(file);
    };
  
    // Handle resubmission
    const handleResubmit = async () => {
      if (!modalFile && !modalRemarks) {
        setError('Please make changes to resubmit');
        return;
      }
  
      setIsLoading(true);
      try {
        const formData = new FormData();
        if (modalFile) {
          formData.append('file', modalFile);
        }
        formData.append('remarks', modalRemarks);
        formData.append('liquidationId', selectedSubmission._id);
  
        const response = await fetch('https://studevent-server.vercel.app/api/liquidation/resubmit', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
  
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Resubmission failed');
        }
  
        setSuccess('Liquidation resubmitted successfully!');
        setSelectedSubmission(null);
        setModalFile(null);
        setModalRemarks('');
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
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
      // Get organization name from localStorage
      const userData = JSON.parse(localStorage.getItem('user'));
      const organizationName = userData?.organizationName || 'Unknown Organization';
  
      const formData = new FormData();
      formData.append('file', fileBlob);
      formData.append('organization', organizationName); // Use the organizationName from localStorage
      formData.append('organizationName', organizationName); // Also send as organizationName for the notification
      
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
      {/* Top Section - Submission and Preview */}
      <div className="top-section">
        {/* Left Column - File Upload */}
        <div className="upload-section">
          <h2 className="section-title">Submit Liquidation</h2>
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

        {/* Right Column - Data Preview */}
        {uploadedData && (
          <div className="preview-section">
            <h2 className="section-title">File Preview</h2>
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
      </div>

      {/* Bottom Section - Submitted Liquidations */}
      <div className="submissions-section">
        <h2 className="section-title">Your Submissions</h2>
        
        {loadingSubmissions ? (
          <div className="loading-submissions">
            <div className="loader"></div>
            <p>Loading your submissions...</p>
          </div>
        ) : submittedLiquidations.length > 0 ? (
          <div className="submissions-list">
            <table>
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
        {submittedLiquidations.map((submission) => (
          <tr 
            key={submission._id}
            onClick={() => openSubmissionModal(submission)}
            className="submission-row"
          >
            <td>
              <a 
                href={submission.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                {submission.fileName}
              </a>
            </td>
            <td>{new Date(submission.createdAt).toLocaleDateString()}</td>
            <td>
              <span className={`status-badge ${submission.status.toLowerCase()}`}>
                {submission.status}
              </span>
            </td>
            <td>{submission.remarks || '-'}</td>
            {/* Removed the actions column */}
          </tr>
        ))}
      </tbody>
            </table>
          </div>
        ) : (
          <div className="no-submissions">
            <p>You haven't submitted any liquidations yet</p>
          </div>
        )}
      </div>

      {/* Submission Modal */}
      {selectedSubmission && (
        <div className="modal-overlay">
          <div className="submission-modal">
            <div className="modal-header">
              <h3>Liquidation Details</h3>
              <button 
                className="close-modal"
                onClick={() => {
                  setSelectedSubmission(null);
                  setModalFile(null);
                  setModalRemarks('');
                }}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-content">
              <div className="modal-section">
                <h4>Current File:</h4>
                <a 
                  href={selectedSubmission.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="file-link"
                >
                  {selectedSubmission.fileName}
                </a>
              </div>

              <div className="modal-section">
                <h4>Status:</h4>
                <span className={`status-badge ${selectedSubmission.status.toLowerCase()}`}>
                  {selectedSubmission.status}
                </span>
              </div>

              <div className="modal-section">
                <h4>Admin Remarks:</h4>
                <textarea
                  className="remarks-input"
                  value={modalRemarks}
                  onChange={(e) => setModalRemarks(e.target.value)}
                  placeholder="No remarks yet"
                  readOnly
                />
              </div>

              {selectedSubmission.status !== 'Approved' && (
                <>
                  <div className="modal-section">
                    <h4>Change File:</h4>
                    <label className="file-upload-label">
                      Select New File
                      <input
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        onChange={handleModalFileChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                    {modalFile && (
                      <div className="new-file-preview">
                        <span>{modalFile.name}</span>
                        <span>{(modalFile.size / 1024).toFixed(2)} KB</span>
                      </div>
                    )}
                  </div>

                  <div className="modal-actions">
                    <button
                      className="cancel-btn"
                      onClick={() => {
                        setSelectedSubmission(null);
                        setModalFile(null);
                        setModalRemarks('');
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="resubmit-btn"
                      onClick={handleResubmit}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Submitting...' : 'Resubmit'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Liquidation;