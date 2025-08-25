const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Parse the webhook payload
        const payload = JSON.parse(event.body);
        
        // Check if this is a form submission
        if (payload.event_type !== 'form_submission') {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Not a form submission' })
            };
        }

        const formData = payload.data;
        
        // Check if this is our contact form
        if (formData.name !== 'contact') {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Not a contact form submission' })
            };
        }

        // Process form data
        const timestamp = new Date().toISOString();
        const messageId = Date.now();
        
        const contactData = {
            id: messageId,
            name: formData.name || 'Brak nazwy',
            email: formData.email || 'brak@email.com',
            phone: formData.phone || 'Brak telefonu',
            subject: formData.subject || 'Kontakt z formularza',
            message: formData.message || 'Brak wiadomości',
            consent: formData.consent === 'on' || formData.consent === true,
            marketing: formData.marketing === 'on' || formData.marketing === true,
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
            
            fs.writeFileSync(filepath, JSON.stringify(contactData, null, 2));
            console.log('Message saved to CMS file via webhook:', filepath);
        } catch (fileError) {
            console.error('Error saving message to CMS file via webhook:', fileError);
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Webhook processed successfully',
                data: contactData
            })
        };

    } catch (error) {
        console.error('Webhook error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
