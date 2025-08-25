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

    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Parse request body
        const { messageId, status, notes } = JSON.parse(event.body);

        if (!messageId || !status) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Missing required fields: messageId and status' })
            };
        }

        const messagesDir = path.join(process.cwd(), 'data', 'contact_messages');
        
        // Check if directory exists
        if (!fs.existsSync(messagesDir)) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Messages directory not found' })
            };
        }

        // Find the message file
        const files = fs.readdirSync(messagesDir).filter(file => file.endsWith('.json'));
        let messageFile = null;

        for (const file of files) {
            try {
                const filepath = path.join(messagesDir, file);
                const content = fs.readFileSync(filepath, 'utf8');
                const message = JSON.parse(content);
                
                if (message.id == messageId) {
                    messageFile = file;
                    break;
                }
            } catch (fileError) {
                console.error(`Error reading file ${file}:`, fileError);
            }
        }

        if (!messageFile) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Message not found' })
            };
        }

        // Update the message
        const filepath = path.join(messagesDir, messageFile);
        const content = fs.readFileSync(filepath, 'utf8');
        const message = JSON.parse(content);

        message.status = status;
        if (notes !== undefined) {
            message.notes = notes;
        }

        // Save updated message
        fs.writeFileSync(filepath, JSON.stringify(message, null, 2));

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                message: 'Status updated successfully',
                data: message
            })
        };

    } catch (error) {
        console.error('Error updating message status:', error);
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
