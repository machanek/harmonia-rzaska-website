const fetch = require('node-fetch');

exports.handler = async function(event, context) {
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
        
        // Verify reCAPTCHA
        const recaptchaToken = formDataObj['g-recaptcha-response'];
        if (!recaptchaToken) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'reCAPTCHA verification required' })
            };
        }

        // Verify with Google reCAPTCHA API
        const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
        const recaptchaVerification = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `secret=${recaptchaSecret}&response=${recaptchaToken}`
        });

        const recaptchaResult = await recaptchaVerification.json();
        
        if (!recaptchaResult.success) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'reCAPTCHA verification failed' })
            };
        }

        // Check for honeypot field
        if (formDataObj['bot-field']) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Form submitted successfully' })
            };
        }

        // Process form data
        const contactData = {
            name: formDataObj.name,
            email: formDataObj.email,
            phone: formDataObj.phone,
            subject: formDataObj.subject,
            message: formDataObj.message,
            consent: formDataObj.consent,
            marketing: formDataObj.marketing,
            timestamp: new Date().toISOString()
        };

        // Here you would typically send the data to your email service
        // For now, we'll just log it and return success
        console.log('Contact form submission:', contactData);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
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
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
