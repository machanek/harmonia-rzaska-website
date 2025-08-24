const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
            }
        };
    }

    // Only allow GET
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const messagesDir = path.join(process.cwd(), 'data', 'contact_messages');
        
        if (!fs.existsSync(messagesDir)) {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                body: JSON.stringify({
                    messages: [],
                    total: 0
                })
            };
        }

        const files = fs.readdirSync(messagesDir);
        const messages = [];

        for (const file of files) {
            if (file.endsWith('.json')) {
                try {
                    const filepath = path.join(messagesDir, file);
                    const messageData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
                    messages.push(messageData);
                } catch (fileError) {
                    console.error(`Error reading file ${file}:`, fileError);
                }
            }
        }

        // Sort by timestamp (newest first)
        messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({
                messages: messages,
                total: messages.length
            })
        };

    } catch (error) {
        console.error('Error fetching contact messages:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
