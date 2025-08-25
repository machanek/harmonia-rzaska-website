const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
    // Sprawdź czy to jest webhook z Netlify Forms
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Parsuj dane z webhooka Netlify Forms
        const formData = JSON.parse(event.body);
        
        // Sprawdź czy to jest formularz kontaktowy
        if (formData.form_name !== 'contact') {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid form name' })
            };
        }

        // Przygotuj dane kontaktowe
        const contactData = {
            id: generateMessageId(),
            timestamp: new Date().toISOString(),
            name: formData.data.name || '',
            email: formData.data.email || '',
            phone: formData.data.phone || '',
            message: formData.data.message || '',
            consent: formData.data.consent || false,
            status: 'nowa',
            notes: '',
            source: 'form-webhook'
        };

        // Sprawdź czy wszystkie wymagane pola są wypełnione
        if (!contactData.name || !contactData.email || !contactData.phone || !contactData.message) {
            console.error('Missing required fields:', contactData);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        // Utwórz bezpieczną nazwę pliku
        const safeName = contactData.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        
        const timestamp = contactData.timestamp.split('T')[0];
        const filename = `${timestamp}-${safeName}-${contactData.id}.json`;
        const filepath = path.join(process.cwd(), 'data', 'contact_messages', filename);

        // Upewnij się, że katalog istnieje
        const dir = path.dirname(filepath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Zapisz wiadomość do pliku JSON
        fs.writeFileSync(filepath, JSON.stringify(contactData, null, 2), 'utf8');
        
        console.log('Contact message saved via webhook:', filename);
        console.log('Contact form submission:', contactData);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({
                message: 'Form submitted successfully via webhook',
                data: contactData
            })
        };

    } catch (error) {
        console.error('Webhook error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({
                error: 'Internal server error',
                details: error.message
            })
        };
    }
};

function generateMessageId() {
    return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
