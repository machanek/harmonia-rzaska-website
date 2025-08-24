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

        // Log the submission
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
