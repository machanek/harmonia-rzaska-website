const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
    console.log('=== WEBHOOK STARTED ===');
    console.log('Event method:', event.httpMethod);
    console.log('Event body:', event.body);
    console.log('Event headers:', event.headers);
    
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

        // Spróbuj użyć Git API do dodania pliku do repo
        try {
            const githubToken = process.env.GITHUB_TOKEN;
            const githubRepo = process.env.GITHUB_REPO;
            
            if (!githubToken) {
                console.log('No GitHub token available');
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    },
                    body: JSON.stringify({
                        message: 'Form submitted successfully, but no GitHub token configured',
                        data: contactData
                    })
                };
            }

            if (!githubRepo) {
                console.log('No GitHub repo configured');
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    },
                    body: JSON.stringify({
                        message: 'Form submitted successfully, but no GitHub repo configured',
                        data: contactData
                    })
                };
            }

            console.log('Attempting to add file via Git API...');
            console.log('Repo:', githubRepo);
            
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
            console.log('File content length:', fileContent.length);
            
            // Pobierz aktualny commit SHA
            const repoUrl = `https://api.github.com/repos/${githubRepo}/git/refs/heads/main`;
            console.log('Fetching repo ref from:', repoUrl);
            
            const repoResponse = await fetch(repoUrl, {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            console.log('Repo response status:', repoResponse.status);
            
            if (!repoResponse.ok) {
                const errorText = await repoResponse.text();
                console.log('Repo response error:', errorText);
                throw new Error(`Failed to get repo ref: ${repoResponse.status} ${errorText}`);
            }
            
            const repoData = await repoResponse.json();
            const baseSha = repoData.object.sha;
            console.log('Base SHA:', baseSha);
            
            // Utwórz blob z zawartością pliku
            const blobUrl = `https://api.github.com/repos/${githubRepo}/git/blobs`;
            console.log('Creating blob at:', blobUrl);
            
            const blobResponse = await fetch(blobUrl, {
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
            
            console.log('Blob response status:', blobResponse.status);
            
            if (!blobResponse.ok) {
                const errorText = await blobResponse.text();
                console.log('Blob response error:', errorText);
                throw new Error(`Failed to create blob: ${blobResponse.status} ${errorText}`);
            }
            
            const blobData = await blobResponse.json();
            console.log('Blob SHA:', blobData.sha);
            
            // Pobierz aktualne drzewo
            const treeUrl = `https://api.github.com/repos/${githubRepo}/git/trees/${baseSha}`;
            console.log('Fetching tree from:', treeUrl);
            
            const treeResponse = await fetch(treeUrl, {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            console.log('Tree response status:', treeResponse.status);
            
            if (!treeResponse.ok) {
                const errorText = await treeResponse.text();
                console.log('Tree response error:', errorText);
                throw new Error(`Failed to get tree: ${treeResponse.status} ${errorText}`);
            }
            
            const treeData = await treeResponse.json();
            console.log('Tree items count:', treeData.tree.length);
            
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
            const newTreeUrl = `https://api.github.com/repos/${githubRepo}/git/trees`;
            console.log('Creating new tree at:', newTreeUrl);
            
            const newTreeResponse = await fetch(newTreeUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTree)
            });
            
            console.log('New tree response status:', newTreeResponse.status);
            
            if (!newTreeResponse.ok) {
                const errorText = await newTreeResponse.text();
                console.log('New tree response error:', errorText);
                throw new Error(`Failed to create tree: ${newTreeResponse.status} ${errorText}`);
            }
            
            const newTreeData = await newTreeResponse.json();
            console.log('New tree SHA:', newTreeData.sha);
            
            // Utwórz commit
            const commitUrl = `https://api.github.com/repos/${githubRepo}/git/commits`;
            console.log('Creating commit at:', commitUrl);
            
            const commitResponse = await fetch(commitUrl, {
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
            
            console.log('Commit response status:', commitResponse.status);
            
            if (!commitResponse.ok) {
                const errorText = await commitResponse.text();
                console.log('Commit response error:', errorText);
                throw new Error(`Failed to create commit: ${commitResponse.status} ${errorText}`);
            }
            
            const commitData = await commitResponse.json();
            console.log('Commit SHA:', commitData.sha);
            
            // Zaktualizuj branch
            const updateUrl = `https://api.github.com/repos/${githubRepo}/git/refs/heads/main`;
            console.log('Updating branch at:', updateUrl);
            
            const updateResponse = await fetch(updateUrl, {
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
            
            console.log('Update response status:', updateResponse.status);
            
            if (!updateResponse.ok) {
                const errorText = await updateResponse.text();
                console.log('Update response error:', errorText);
                throw new Error(`Failed to update branch: ${updateResponse.status} ${errorText}`);
            }
            
            console.log('Contact message added to repo via Git API:', filename);
            
        } catch (apiError) {
            console.error('Git API error:', apiError.message);
            console.error('Error stack:', apiError.stack);
        }

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

