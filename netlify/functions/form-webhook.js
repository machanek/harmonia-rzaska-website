const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
    console.log('=== WEBHOOK STARTED ===');
    console.log('Event method:', event.httpMethod);
    console.log('Event body length:', event.body ? event.body.length : 'no body');
    console.log('Event headers:', JSON.stringify(event.headers, null, 2));
    
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
        console.log('Attempting to parse body:', event.body);
        const formData = JSON.parse(event.body);
        console.log('Parsed form data:', JSON.stringify(formData, null, 2));
        
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

        console.log('Prepared contact data:', JSON.stringify(contactData, null, 2));

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

        // Dodaj wiadomość do repo przez Git API
        try {
            const githubToken = process.env.GITHUB_TOKEN;
            const githubRepo = process.env.GITHUB_REPO;
            
            if (!githubToken || !githubRepo) {
                console.log('Missing GitHub credentials, skipping Git API');
            } else {
                console.log('Adding message to repo via Git API...');
                
                // Przygotuj dane do commit
                const safeName = contactData.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');
                
                const timestamp = contactData.timestamp.split('T')[0];
                const filename = `${timestamp}-${safeName}-${contactData.id}.json`;
                const filePath = `data/contact_messages/${filename}`;
                const fileContent = JSON.stringify(contactData, null, 2);
                
                console.log('File path:', filePath);
                
                // Pobierz aktualny commit SHA
                const repoResponse = await fetch(`https://api.github.com/repos/${githubRepo}/git/refs/heads/main`, {
                    headers: {
                        'Authorization': `token ${githubToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (!repoResponse.ok) {
                    throw new Error(`Failed to get repo ref: ${repoResponse.status}`);
                }
                
                const repoData = await repoResponse.json();
                const baseSha = repoData.object.sha;
                
                // Utwórz blob z zawartością pliku
                const blobResponse = await fetch(`https://api.github.com/repos/${githubRepo}/git/blobs`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `token ${githubToken}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        content: Buffer.from(fileContent).toString('base64'),
                        encoding: 'base64'
                    })
                });
                
                if (!blobResponse.ok) {
                    throw new Error(`Failed to create blob: ${blobResponse.status}`);
                }
                
                const blobData = await blobResponse.json();
                
                // Pobierz aktualne drzewo
                const treeResponse = await fetch(`https://api.github.com/repos/${githubRepo}/git/trees/${baseSha}`, {
                    headers: {
                        'Authorization': `token ${githubToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (!treeResponse.ok) {
                    throw new Error(`Failed to get tree: ${treeResponse.status}`);
                }
                
                const treeData = await treeResponse.json();
                
                // Dodaj nowy plik do drzewa
                const newTree = {
                    base_tree: baseSha,
                    tree: [
                        ...treeData.tree,
                        {
                            path: filePath,
                            mode: '100644',
                            type: 'blob',
                            sha: blobData.sha
                        }
                    ]
                };
                
                // Utwórz nowe drzewo
                const newTreeResponse = await fetch(`https://api.github.com/repos/${githubRepo}/git/trees`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `token ${githubToken}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newTree)
                });
                
                if (!newTreeResponse.ok) {
                    throw new Error(`Failed to create tree: ${newTreeResponse.status}`);
                }
                
                const newTreeData = await newTreeResponse.json();
                
                // Utwórz commit
                const commitResponse = await fetch(`https://api.github.com/repos/${githubRepo}/git/commits`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `token ${githubToken}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `Add contact message: ${contactData.name}`,
                        tree: newTreeData.sha,
                        parents: [baseSha]
                    })
                });
                
                if (!commitResponse.ok) {
                    throw new Error(`Failed to create commit: ${commitResponse.status}`);
                }
                
                const commitData = await commitResponse.json();
                
                // Zaktualizuj branch
                const updateResponse = await fetch(`https://api.github.com/repos/${githubRepo}/git/refs/heads/main`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `token ${githubToken}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        sha: commitData.sha
                    })
                });
                
                if (!updateResponse.ok) {
                    throw new Error(`Failed to update branch: ${updateResponse.status}`);
                }
                
                console.log('Contact message added to repo successfully:', filename);
            }
            
        } catch (apiError) {
            console.error('Git API error:', apiError.message);
            // Nie zwracamy błędu - webhook nadal działa
        }

        console.log('=== WEBHOOK COMPLETED ===');

        return {
            statusCode: 303,
            headers: {
                'Location': '/success.html',
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

