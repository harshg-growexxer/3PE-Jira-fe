import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const DropdownWithLabels = () => {
  const [labels, setLabels] = useState([]);
  const [filteredLabels, setFilteredLabels] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [issueDetails, setIssueDetails] = useState(null);
  const dropdownRef = useRef(null);

  const fetchLabels = async () => {
    setIsLoading(true);
    const username = 'pm@growexx.com';
    const apiToken = 'sTLrjnoEsOTH87mHOlJX7FF9';
    const authString = btoa(`${username}:${apiToken}`);

    try {
      const response = await axios.get('/rest/api/3/label', {
        headers: {
          Authorization: `Basic ${authString}`,
          Accept: 'application/json',
        },
      });

      setLabels(response.data.values);
      setFilteredLabels(response.data.values.slice(0, 10));
    } catch (error) {
      console.error('Error fetching labels:', error.response || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchIssueDetails = async (label) => {
    setIsLoading(true);
    const username = 'pm@growexx.com';
    const apiToken = 'sTLrjnoEsOTH87mHOlJX7FF9';
    const authString = btoa(`${username}:${apiToken}`);

    try {
      const response = await axios.get(
        `/rest/api/3/search?jql=labels=${label}`,
        {
          headers: {
            Authorization: `Basic ${authString}`,
            Accept: 'application/json',
          },
        }
      );

      setIssueDetails({
        total: response.data.total,
        issues: response.data.issues.map((issue) => issue.expand),
      });
    } catch (error) {
      console.error(
        'Error fetching issue details:',
        error.response || error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDropdownClick = () => {
    setDropdownOpen(!dropdownOpen);
    if (!dropdownOpen && labels.length === 0) {
      fetchLabels();
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = labels.filter((label) =>
      label.toLowerCase().includes(term)
    );
    setFilteredLabels(filtered.slice(0, 10));
  };

  const handleLabelSelect = (label) => {
    setSelectedLabel(label);
    setDropdownOpen(false);
    fetchIssueDetails(label);
  };

  return (
    <div ref={dropdownRef} style={{ width: '300px' }}>
      <button
        onClick={handleDropdownClick}
        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
      >
        {selectedLabel ? selectedLabel : 'Select Label'}
      </button>

      {dropdownOpen && (
        <div
          style={{
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '10px',
          }}
        >
          <input
            type="text"
            placeholder="Search labels..."
            value={searchTerm}
            onChange={handleSearch}
            style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
          />

          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <ul
              style={{
                maxHeight: '200px',
                overflowY: 'auto',
                padding: 0,
                margin: 0,
                listStyle: 'none',
              }}
            >
              {filteredLabels.map((label, index) => (
                <li
                  key={index}
                  onClick={() => handleLabelSelect(label)}
                  style={{
                    padding: '5px',
                    cursor: 'pointer',
                    hover: { backgroundColor: '#f0f0f0' },
                  }}
                >
                  {label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {selectedLabel && issueDetails && (
        <div style={{ marginTop: '10px' }}>
          <p>Label selected: {selectedLabel}</p>
          <p>Total issues: {issueDetails.total}</p>
          <p>Issue expands:</p>
          <ul>
            {issueDetails.issues.map((expand, id, index) => (
              <li key={index}>
                {expand} : {id}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropdownWithLabels;
