import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const DropdownWithUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const dropdownRef = useRef(null);

  const fetchUsers = async () => {
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

      setUsers(response.data);
      setFilteredUsers(response.data.slice(0, 10));
    } catch (error) {
      console.error('Error fetching users:', error.response || error.message);
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
    if (!dropdownOpen && users.length === 0) {
      fetchUsers();
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = users.filter(
      (user) =>
        user.displayName.toLowerCase().includes(term) ||
        user.emailAddress.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered.slice(0, 10));
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setDropdownOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ width: '300px' }}>
      <button
        onClick={handleDropdownClick}
        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
      >
        {selectedUser ? selectedUser.displayName : 'Select User'}
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
            placeholder="Search users..."
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
              {filteredUsers.map((user) => (
                <li
                  key={user.accountId}
                  onClick={() => handleUserSelect(user)}
                  style={{
                    padding: '5px',
                    cursor: 'pointer',
                    hover: { backgroundColor: '#f0f0f0' },
                  }}
                >
                  {user.displayName} ({user.emailAddress})
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {selectedUser && (
        <div style={{ marginTop: '10px' }}>
          User selected: {selectedUser.displayName}
        </div>
      )}
    </div>
  );
};

export default DropdownWithUsers;
