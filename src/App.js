import React, { useState, useEffect } from 'react';
import './App.css';

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  const displayPageNumbers = pageNumbers.slice(currentPage - 1, currentPage + 3);

  return (
    <div className="pagination">
      {currentPage > 1 && (
        <React.Fragment>
          <button onClick={() => onPageChange(1)}>First</button>
          <button onClick={() => onPageChange(currentPage - 1)}>Previous</button>
        </React.Fragment>
      )}
      {displayPageNumbers.map((pageNumber) => (
        <button
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
          className={currentPage === pageNumber ? 'active' : ''}
        >
          {pageNumber}
        </button>
      ))}
      {currentPage < totalPages && (
        <React.Fragment>
          <button onClick={() => onPageChange(currentPage + 1)}>Next</button>
          <button onClick={() => onPageChange(totalPages)}>Last</button>
        </React.Fragment>
      )}
    </div>
  );
}

function App() {
  const [file, setFile] = useState(null);
  const [labels, setLabels] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [viewingPage, setViewingPage] = useState(1);
  const predictionsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
    setViewingPage(1);
  }, [labels]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleUpload = () => {
    if (file) {
      setLoading(true);
      setStatus('Loading');

      const formData = new FormData();
      formData.append('file', file);

      fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          // Add serial numbers to predictions
          const labeledPredictions = data.labels.map((label, index) => `${index + 1}. ${label}`);
          setLabels(labeledPredictions);
          setLoading(false);
          setStatus('Success');
        })
        .catch((error) => {
          console.error('Error uploading file:', error);
          setLoading(false);
          setStatus('');
        });
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setViewingPage(pageNumber); // Update the page being viewed when currentPage changes
  };

  const currentPredictions = labels.slice(
    (viewingPage - 1) * predictionsPerPage,
    viewingPage * predictionsPerPage
  );

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to KeyDet AI</h1>
        <p>Rapid evolution of technology has led to widespread use of keyloggers, 
          posing a significant cybersecurity threat. This Project aims to develop 
          and deploy robust, adaptable solutions for keylogger detection using 
          Bi-LSTM-based models, enhancing digital security and identifying keyloggers.</p>

        <p>Upload a CSV file to detect keyloggers.</p>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <button onClick={handleUpload}>Predict</button>

        {loading && <div>Loading...</div>}
        {status === 'Success' && (
          <div className="success-message">
            File uploaded and processed successfully. Click below to view predictions.
            <button onClick={() => setStatus('Viewing')}>View Predictions</button>
          </div>
        )}

        {status === 'Viewing' && (
          <div className="predictions-popup">
            <h2>Predictions For Page {viewingPage}</h2>
            <ul className="predictions-list">
              {currentPredictions.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
            <Pagination
              currentPage={viewingPage}
              totalPages={Math.ceil(labels.length / predictionsPerPage)}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </header>
    </div>
  );
}

export default App;



