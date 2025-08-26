const fs = require('fs');
const path = require('path');
const {RecaptchaEnterpriseServiceClient} = require('@google-cloud/recaptcha-enterprise');

// Ustaw credentials z zmiennej środowiskowej
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentials;
}

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

        // Weryfikuj reCAPTCHA v3
        const recaptchaToken = formData.data['g-recaptcha-response'];
        if (!recaptchaToken) {
            console.error('Missing reCAPTCHA token');
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'reCAPTCHA verification required' })
            };
        }

        try {
            // Konfiguracja reCAPTCHA Enterprise
            const projectID = "dubaicars";
            const recaptchaKey = "6Lc1sK8rAAAAAFvcqHK72bEpkcT7xUtbowTMD4f7";
            
            // Utwórz klienta reCAPTCHA Enterprise
            const client = new RecaptchaEnterpriseServiceClient();
            const projectPath = client.projectPath(projectID);

            // Utwórz żądanie oceny
            const request = {
                assessment: {
                    event: {
                        token: recaptchaToken,
                        siteKey: recaptchaKey,
                    },
                },
                parent: projectPath,
            };

            const [response] = await client.createAssessment(request);

            // Sprawdź czy token jest prawidłowy
            if (!response.tokenProperties.valid) {
                console.error(`Invalid reCAPTCHA token: ${response.tokenProperties.invalidReason}`);
                return {
                    statusCode: 400,
                    body: JSON.stringify({ 
                        error: 'Invalid reCAPTCHA token',
                        reason: response.tokenProperties.invalidReason 
                    })
                };
            }

            // Sprawdź wynik reCAPTCHA (0.0 = bot, 1.0 = człowiek)
            const score = response.riskAnalysis.score;
            console.log(`reCAPTCHA score: ${score}`);
            
            if (score < 0.5) {
                console.error(`reCAPTCHA score too low: ${score}`);
                return {
                    statusCode: 400,
                    body: JSON.stringify({ 
                        error: 'reCAPTCHA verification failed - score too low',
                        score: score 
                    })
                };
            }

            console.log('reCAPTCHA verification successful');
            
        } catch (recaptchaError) {
            console.error('reCAPTCHA verification error:', recaptchaError);
            return {
                statusCode: 500,
                body: JSON.stringify({ 
                    error: 'reCAPTCHA verification failed',
                    details: recaptchaError.message 
                })
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
