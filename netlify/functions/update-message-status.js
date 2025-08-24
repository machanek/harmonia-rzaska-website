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
        const { messageId, status, notes } = JSON.parse(event.body);
        
        if (!messageId || !status) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        const messagesDir = path.join(process.cwd(), 'data', 'contact_messages');
        const files = fs.readdirSync(messagesDir);
        
        let messageFile = null;
        for (const file of files) {
            if (file.startsWith(messageId.toString())) {
                messageFile = file;
                break;
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

        const filepath = path.join(messagesDir, messageFile);
        const messageData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        
        // Update status and notes
        messageData.status = status;
        if (notes !== undefined) {
            messageData.notes = notes;
        }
        
        // Save updated message
        fs.writeFileSync(filepath, JSON.stringify(messageData, null, 2));

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({
                message: 'Message status updated successfully',
                data: messageData
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
