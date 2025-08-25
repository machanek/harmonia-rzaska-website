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
        // Parse form data
        const formData = new URLSearchParams(event.body);
        const formDataObj = {};
        for (let [key, value] of formData) {
            formDataObj[key] = value;
        }
        
        // Check for honeypot field
        if (formDataObj['bot-field']) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Form submitted successfully' })
            };
        }

        // Process form data
        const timestamp = new Date().toISOString();
        const messageId = Date.now();
        
        const contactData = {
            id: messageId,
            name: formDataObj.name,
            email: formDataObj.email,
            phone: formDataObj.phone,
            subject: formDataObj.subject || 'Kontakt z formularza',
            message: formDataObj.message,
            consent: formDataObj.consent === 'on',
            marketing: formDataObj.marketing === 'on',
            timestamp: timestamp,
            status: 'new',
            notes: ''
        };

        // Save message to file for CMS
        try {
            const messagesDir = path.join(process.cwd(), 'data', 'contact_messages');
            
            // Create directory if it doesn't exist
            if (!fs.existsSync(messagesDir)) {
                fs.mkdirSync(messagesDir, { recursive: true });
            }
            
            // Format filename for CMS compatibility
            const safeName = contactData.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
            const filename = `${timestamp.split('T')[0]}-${safeName}-${messageId}.json`;
            const filepath = path.join(messagesDir, filename);
            
            // Format data for CMS
            const cmsData = {
                ...contactData,
                // Ensure all required fields are present
                id: messageId,
                name: contactData.name || 'Brak nazwy',
                email: contactData.email || 'brak@email.com',
                phone: contactData.phone || 'Brak telefonu',
                subject: contactData.subject || 'Kontakt z formularza',
                message: contactData.message || 'Brak wiadomości',
                consent: contactData.consent,
                marketing: contactData.marketing,
                timestamp: timestamp,
                status: 'new',
                notes: ''
            };
            
            fs.writeFileSync(filepath, JSON.stringify(cmsData, null, 2));
            console.log('Message saved to CMS file:', filepath);
        } catch (fileError) {
            console.error('Error saving message to CMS file:', fileError);
            // Continue even if file save fails
        }

        // Log the submission
        console.log('Contact form submission:', contactData);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({
                message: 'Form submitted successfully',
                data: contactData
            })
        };

    } catch (error) {
        console.error('Contact form error:', error);
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
