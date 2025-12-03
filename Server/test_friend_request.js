const API_URL = 'http://localhost:3000/api';

async function main() {
    const targetEmail = process.argv[2];
    if (!targetEmail) {
        console.error('Please provide a target email address');
        console.log('Usage: node test_friend_request.js <target_email>');
        process.exit(1);
    }

    console.log(`Targeting user: ${targetEmail}`);

    // 1. Login/Register Bot User
    let token;
    const botUser = {
        email: 'friend_bot@test.com',
        password: 'password123',
        displayName: 'Friend Bot'
    };

    try {
        console.log('Logging in as Friend Bot...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: botUser.email, password: botUser.password })
        });

        if (loginRes.ok) {
            const data = await loginRes.json();
            token = data.tokens.accessToken;
            console.log('Logged in successfully.');
        } else {
            console.log('Login failed, trying to register...');
            const registerRes = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(botUser)
            });

            if (!registerRes.ok) {
                const error = await registerRes.text();
                throw new Error(`Registration failed: ${error}`);
            }

            const data = await registerRes.json();
            token = data.tokens.accessToken;
            console.log('Registered successfully. Token:', token ? 'Present' : 'Missing');
            if (!token) console.log('Full response:', JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error('Auth error:', e);
        process.exit(1);
    }

    // 2. Find Target User
    let targetUserId;
    try {
        console.log(`Searching for user ${targetEmail}...`);
        const searchRes = await fetch(`${API_URL}/users/search?query=${targetEmail}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!searchRes.ok) {
            throw new Error(`Search failed: ${searchRes.statusText}`);
        }

        const data = await searchRes.json();
        const user = data.users.find(u => u.email.toLowerCase() === targetEmail.toLowerCase());

        if (!user) {
            console.error('User not found!');
            console.log('Found users:', data.users.map(u => u.email));
            process.exit(1);
        }

        targetUserId = user.id;
        console.log(`Found user: ${user.displayName} (${targetUserId})`);
    } catch (e) {
        console.error('Search error:', e);
        process.exit(1);
    }

    // 3. Send Friend Request
    try {
        console.log('Sending friend request...');
        const requestRes = await fetch(`${API_URL}/friends/request`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ targetUserId })
        });

        const result = await requestRes.json();
        if (requestRes.ok) {
            console.log('✅ Success:', result.message);
        } else {
            console.error('❌ Failed:', result.message);
        }
    } catch (e) {
        console.error('Request error:', e);
    }
}

main();
