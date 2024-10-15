import axios from 'axios';

const AUTH = {
    username: process.env.REACT_APP_USERNAME,
    password: process.env.REACT_APP_PASSWORD
};

export const fetchLabels = async () => {
    try {
        const response = await axios.get('/rest/api/3/label', {
            headers: {
                Authorization: `Basic ${btoa(`${AUTH.username}:${AUTH.password}`)}`,
                Accept: 'application/json',
            },
        });
        return response.data.values;
    } catch (error) {
        console.error('Error fetching labels:', error.response || error.message);
        throw error;
    }
};

export const fetchIssues = async (label) => {
    let allIssues = [];
    let startAt = 0;
    const maxResults = 100;
    let total = 0;

    do {
        try {
            const response = await axios.get('/rest/api/3/search', {
                params: {
                    jql: `labels="${label}"`,
                    fields: 'issuetype,project,parent,timespent,aggregatetimespent,resolution,timeestimate,aggregatetimeoriginalestimate,status,timeoriginalestimate,aggregatetimeestimate,summary,aggregateprogress,progress',
                    startAt: startAt,
                    maxResults: maxResults
                },
                headers: {
                    'Authorization': `Basic ${btoa(`${AUTH.username}:${AUTH.password}`)}`,
                    'Accept': 'application/json'
                }
            });

            const { issues, total: totalIssues } = response.data;
            allIssues = [...allIssues, ...issues];
            total = totalIssues;
            startAt += issues.length;

            console.log(`Fetched ${allIssues.length} of ${total} issues`);

        } catch (error) {
            console.error('Error fetching issues:', error.response || error.message);
            throw error;
        }
    } while (allIssues.length < total);

    return { issues: allIssues, total };
};