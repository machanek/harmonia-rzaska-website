const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
    console.log('=== WEBHOOK STARTED ===');
    console.log('Event method:', event.httpMethod);
    console.log('Event body:', event.body);
    
    // Sprawdź czy to jest webhook z Netlify Forms
    if (event.httpMethod !== 'POST') {
        console.log('Wrong method, returning 405');
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Parsuj dane z webhooka Netlify Forms
        const formData = JSON.parse(event.body);
        console.log('Parsed form data:', formData);
        
        // Sprawdź czy to jest formularz kontaktowy
        if (formData.form_name !== 'contact') {
            console.log('Wrong form name:', formData.form_name);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid form name' })
            };
        }

        // Przygotuj dane kontaktowe
        const contactData = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            name: formData.data.name || '',
            email: formData.data.email || '',
            phone: formData.data.phone || '',
            subject: formData.data.subject || '',
            message: formData.data.message || '',
            consent: formData.data.consent === 'on' ? true : false,
            marketing: formData.data.marketing === 'on' ? true : false,
            status: 'new',
            notes: '',
            source: 'form-webhook',
            ip: event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'Nieznany',
            userAgent: event.headers['user-agent'] || 'Nieznany'
        };

        console.log('Prepared contact data:', contactData);

        // Sprawdź czy wszystkie wymagane pola są wypełnione
        if (!contactData.name || !contactData.email || !contactData.phone || !contactData.message) {
            console.error('Missing required fields:', contactData);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        console.log('Contact form submission validated successfully');

        // Sprawdź zmienne środowiskowe
        console.log('Environment variables check:');
        console.log('GITHUB_TOKEN exists:', !!process.env.GITHUB_TOKEN);
        console.log('GITHUB_REPO exists:', !!process.env.GITHUB_REPO);
        console.log('GITHUB_REPO value:', process.env.GITHUB_REPO);

        // Na razie tylko logujemy - Git API dodamy później
        console.log('Webhook processed successfully - Git API integration coming soon');

        console.log('=== WEBHOOK COMPLETED ===');

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
        console.error('=== WEBHOOK ERROR ===');
        console.error('Webhook error:', error);
        console.error('Error stack:', error.stack);
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

