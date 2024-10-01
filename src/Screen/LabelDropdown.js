import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const DropdownWithLabels = () => {
  const [labels, setLabels] = useState([]);
  const [filteredLabels, setFilteredLabels] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingIssues, setIsFetchingIssues] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [issueDetails, setIssueDetails] = useState(null);
  const [issueHierarchy, setIssueHierarchy] = useState([]);
  const dropdownRef = useRef(null);

  const username = 'pm@growexx.com';
  const apiToken = 'sTLrjnoEsOTH87mHOlJX7FF9';
  const authString = btoa(`${username}:${apiToken}`);

  const removeBaseUrl = (url) => {
    return url.replace('https://growexx.atlassian.net', '');
  };

  const fetchLabels = async () => {
    setIsLoading(true);
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
    setIsFetchingIssues(true);
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
        issues: response.data.issues,
      });
      if (response.data.issues.length > 0) {
        await traverseIssueHierarchy(
          removeBaseUrl(response.data.issues[0].self)
        );
      }
    } catch (error) {
      console.error(
        'Error fetching issue details:',
        error.response || error.message
      );
    } finally {
      setIsFetchingIssues(false);
    }
  };

  const fetchIssueData = async (url) => {
    try {
      const response = await axios.get(removeBaseUrl(url), {
        headers: {
          Authorization: `Basic ${authString}`,
          Accept: 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        'Error fetching issue data:',
        error.response || error.message
      );
      return null;
    }
  };

  const traverseIssueHierarchy = async (startIssueUrl) => {
    const hierarchy = [];
    let currentUrl = startIssueUrl;

    for (let i = 0; i < 5; i++) {
      const issueData = await fetchIssueData(currentUrl);
      console.log(
        'Traverse ' + i + ' issues Data: ' + JSON.stringify(issueData)
      );
      if (!issueData) break;

      const issueType = issueData.fields.issuetype.name;
      const issueKey = issueData.key;
      hierarchy.push({ key: issueKey, type: issueType });

      // Check for parent issue and traverse upwards
      if (issueData.fields.parent) {
        currentUrl = removeBaseUrl(issueData.fields.parent.self);
      } else if (issueData.fields.project) {
        // Handle case when we reach the project level
        currentUrl = removeBaseUrl(issueData.fields.project.self);

        // Fetch project data
        const projectData = await fetchIssueData(currentUrl);
        if (projectData && projectData.name && projectData.id) {
          hierarchy.push({
            key: `Project Level: ${projectData.name}`,
            type: `ID: ${projectData.id}`,
          });
        }
        break;
      } else {
        break;
      }
    }

    setIssueHierarchy(hierarchy);
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
                    backgroundColor: 'white',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = '#f0f0f0')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = 'white')
                  }
                >
                  {label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {selectedLabel && isFetchingIssues && <div>Loading issue details...</div>}
      {selectedLabel && issueDetails && (
        <div style={{ marginTop: '10px' }}>
          <p>Label selected: {selectedLabel}</p>
          <p>Total issues: {issueDetails.total}</p>
          <p>Issue Hierarchy:</p>
          <ul>
            {issueHierarchy.map((issue, index) => (
              <li key={index}>
                Level {index + 1}: {issue.key} - {issue.type}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropdownWithLabels;
