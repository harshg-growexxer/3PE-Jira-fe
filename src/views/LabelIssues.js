import React, { useState, useEffect } from 'react';
import { fetchIssues } from '../services/labelService';

const LabelIssues = ({ selectedLabel }) => {
    const [issues, setIssues] = useState({ epics: [], bugs: [], stories: [], tasks: [], subtasks: [] });
    const [totalIssues, setTotalIssues] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getIssues = async () => {
            if (!selectedLabel) return;
            setLoading(true);
            setError(null);
            try {
                const data = await fetchIssues(selectedLabel);
                const categorizedIssues = categorizeIssues(data.issues);
                setIssues(categorizedIssues);
                setTotalIssues(data.total);
            } catch (err) {
                setError('Failed to fetch issues. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        getIssues();
    }, [selectedLabel]);

    const categorizeIssues = (fetchedIssues) => {
        const categorized = { epics: [], bugs: {}, stories: [], tasks: [], subtasks: [] };
        fetchedIssues.forEach(issue => {
            const issueType = issue.fields.issuetype.name.toLowerCase();
            const status = issue.fields.status.name;
            switch (issueType) {
                case 'epic':
                    categorized.epics.push(issue);
                    break;
                case 'bug':
                    if (!categorized.bugs[status]) {
                        categorized.bugs[status] = [];
                    }
                    categorized.bugs[status].push(issue);
                    break;
                case 'story':
                    categorized.stories.push(issue);
                    break;
                case 'task':
                    categorized.tasks.push(issue);
                    break;
                case 'sub-task':
                    categorized.subtasks.push(issue);
                    break;
                default:
                    break;
            }
        });
        return categorized;
    };

    const computeCompletionRatio = (bugs) => {
        const totalBugs = Object.keys(bugs).reduce((total, status) => total + bugs[status].length, 0);
        const doneBugs = bugs['Done'] ? bugs['Done'].length : 0; // Assuming 'Done' is the status for completed bugs
        return totalBugs > 0 ? (100 * doneBugs) / totalBugs : 0;
    };

    const getCompletionRatioColor = (totalBugs) => {
        if (totalBugs <= 5) {
            return 'green';
        } else if (totalBugs > 5 && totalBugs <= 10) {
            return 'orange';
        } else {
            return 'red';
        }
    };

    if (loading) return <p>Loading issues...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="label-issues">
            <h3>Issues for label: {selectedLabel}</h3>
            {loading && <p>Loading issues...</p>}
            {error && <p className="error">{error}</p>}
            {!loading && !error && (
                <>
                    <h3>Total Issues: {totalIssues}</h3>
                    <div className="issue-counts">
                        <p>Epics: {issues.epics.length}</p>
                        <p>Bugs: {Object.keys(issues.bugs).reduce((total, status) => total + issues.bugs[status].length, 0)}</p>
                        <p>Stories: {issues.stories.length}</p>
                        <p>Tasks: {issues.tasks.length}</p>
                        <p>Subtasks: {issues.subtasks.length}</p>
                    </div>
                    <div className="bug-details">
                        <h4>Bug Details by Status:</h4>
                        {Object.entries(issues.bugs).map(([status, bugs]) => (
                            <div key={status}>
                                <h5>Status: {status}</h5>
                                {bugs.map((bug, index) => (
                                    <div key={index}>
                                        <p>ID: {bug.id}</p>
                                        <p>Summary: {bug.fields.summary}</p>
                                    </div>
                                ))}
                            </div>
                        ))}
                        <p style={{ color: getCompletionRatioColor(Object.keys(issues.bugs).reduce((total, status) => total + issues.bugs[status].length, 0)) }}>
                            Bug Completion Ratio: {computeCompletionRatio(issues.bugs).toFixed(2)}%
                        </p>
                    </div>
                </>
            )}
            <style jsx="true">{`
                .label-issues {
                    margin-top: 20px;
                    text-align: left;
                }
                .issue-counts {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 20px;
                }
                .issue-counts p {
                    margin: 0;
                }
                .error {
                    color: red;
                }
            `}</style>
        </div>
    );
};

export default LabelIssues;