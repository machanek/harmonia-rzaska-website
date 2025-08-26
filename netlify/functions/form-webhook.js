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

        // Sprawdź czy wszystkie wymagane pola są wypełnione
        if (!contactData.name || !contactData.email || !contactData.phone || !contactData.message) {
            console.error('Missing required fields:', contactData);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        console.log('Contact form submission:', contactData);

        // Spróbuj użyć Git API do dodania pliku do repo
        try {
            const githubToken = process.env.GITHUB_TOKEN;
            if (githubToken) {
                console.log('Attempting to add file via Git API...');
                
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
                
                // Pobierz aktualny commit SHA
                const repoResponse = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPO}/git/refs/heads/main`, {
                    headers: {
                        'Authorization': `token ${githubToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (repoResponse.ok) {
                    const repoData = await repoResponse.json();
                    const baseSha = repoData.object.sha;
                    
                    // Utwórz blob z zawartością pliku
                    const blobResponse = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPO}/git/blobs`, {
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
                    
                    if (blobResponse.ok) {
                        const blobData = await blobResponse.json();
                        
                        // Pobierz aktualne drzewo
                        const treeResponse = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPO}/git/trees/${baseSha}`, {
                            headers: {
                                'Authorization': `token ${githubToken}`,
                                'Accept': 'application/vnd.github.v3+json'
                            }
                        });
                        
                        if (treeResponse.ok) {
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
                            const newTreeResponse = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPO}/git/trees`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `token ${githubToken}`,
                                    'Accept': 'application/vnd.github.v3+json',
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(newTree)
                            });
                            
                            if (newTreeResponse.ok) {
                                const newTreeData = await newTreeResponse.json();
                                
                                // Utwórz commit
                                const commitResponse = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPO}/git/commits`, {
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
                                
                                if (commitResponse.ok) {
                                    const commitData = await commitResponse.json();
                                    
                                    // Zaktualizuj branch
                                    const updateResponse = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPO}/git/refs/heads/main`, {
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
                                    
                                    if (updateResponse.ok) {
                                        console.log('Contact message added to repo via Git API:', filename);
                                    } else {
                                        console.log('Could not update branch:', updateResponse.status);
                                    }
                                } else {
                                    console.log('Could not create commit:', commitResponse.status);
                                }
                            } else {
                                console.log('Could not create tree:', newTreeResponse.status);
                            }
                        } else {
                            console.log('Could not get tree:', treeResponse.status);
                        }
                    } else {
                        console.log('Could not create blob:', blobResponse.status);
                    }
                } else {
                    console.log('Could not get repo ref:', repoResponse.status);
                }
            } else {
                console.log('No GitHub token available');
            }
        } catch (apiError) {
            console.log('Could not use Git API:', apiError.message);
        }

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

