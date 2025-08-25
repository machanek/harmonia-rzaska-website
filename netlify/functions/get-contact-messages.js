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
        
        // Check if directory exists
        if (!fs.existsSync(messagesDir)) {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ messages: [] })
            };
        }

        // Read all JSON files in the directory
        const files = fs.readdirSync(messagesDir).filter(file => file.endsWith('.json'));
        const messages = [];

        for (const file of files) {
            try {
                const filepath = path.join(messagesDir, file);
                const content = fs.readFileSync(filepath, 'utf8');
                const message = JSON.parse(content);
                messages.push(message);
            } catch (fileError) {
                console.error(`Error reading file ${file}:`, fileError);
            }
        }

        // Sort messages by timestamp (newest first)
        messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                messages: messages,
                count: messages.length
            })
        };

    } catch (error) {
        console.error('Error reading contact messages:', error);
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
