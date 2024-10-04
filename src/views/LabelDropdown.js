import React, { useState, useEffect } from 'react';
import { fetchLabels } from '../services/labelService';
import LabelIssues from './LabelIssues';

const LabelDropdown = () => {
    const [labels, setLabels] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState('');

    useEffect(() => {
        const getLabels = async () => {
            try {
                const dataLabels = await fetchLabels();
                if (Array.isArray(dataLabels)) {
                    setLabels(dataLabels);
                } else {
                    console.error('Expected an array of labels, but got:', dataLabels);
                }
            } catch (error) {
                console.error('Error fetching labels:', error);
            }
        };

        getLabels();
    }, []);

    const filteredLabels = labels.filter(label =>
        label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
        <div className="dropdown-container">
            <div className="dropdown-header" onClick={() => setIsOpen(!isOpen)}>
                <input
                    type="text"
                    placeholder="Search labels..."
                    value={searchTerm}
                    onChange={e => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                    }}
                    onClick={e => {
                        e.stopPropagation();
                        setIsOpen(true);
                    }}
                    className="dropdown-input"
                />
                <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
            </div>
            {isOpen && (
                <ul className="dropdown-list">
                    {filteredLabels.length > 0 ? (
                        filteredLabels.map(label => (
                            <li 
                                key={label}
                                className={`dropdown-item ${selectedLabel === label ? 'selected' : ''}`}
                                onClick={() => {
                                    setSearchTerm(label);
                                    setSelectedLabel(label);
                                    setIsOpen(false);
                                }}
                            >
                                {label}
                            </li>
                        ))
                    ) : (
                        <li className="dropdown-item no-results">No matches found</li>
                    )}
                </ul>
            )}
            </div>
            <div>
            {selectedLabel && <LabelIssues selectedLabel={selectedLabel} />}
            </div>
            <style jsx>{`
                .dropdown-container {
                    position: relative;
                    width: 600px;
                    font-family: Arial, sans-serif;
                    align-items: center;
                }

                .dropdown-header {
                    display: flex;
                    align-items: center;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    background-color: white;
                    cursor: pointer;
                    transition: border-color 0.2s;
                }

                .dropdown-header:hover {
                    border-color: #888;
                }

                .dropdown-input {
                    flex-grow: 1;
                    padding: 10px;
                    border: none;
                    outline: none;
                    background: transparent;
                    font-size: 14px;
                }

                .dropdown-arrow {
                    padding: 10px;
                    color: #666;
                    transition: transform 0.2s;
                }

                .dropdown-arrow.open {
                    transform: rotate(180deg);
                }

                .dropdown-list {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    margin-top: 4px;
                    padding: 0;
                    list-style: none;
                    background-color: white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    max-height: 200px;
                    overflow-y: auto;
                    z-index: 1000;
                }

                .dropdown-item {
                    padding: 5px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    text-align: left;
                }

                .dropdown-item:hover {
                    background-color: #f5f5f5;
                }

                .dropdown-item.selected {
                    background-color: #e6e6e6;
                }

                .no-results {
                    color: #666;
                    font-style: italic;
                }

                /* Scrollbar styling */
                .dropdown-list::-webkit-scrollbar {
                    width: 8px;
                }

                .dropdown-list::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }

                .dropdown-list::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 4px;
                }

                .dropdown-list::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
            `}</style>
        </div>
    );
};

export default LabelDropdown;