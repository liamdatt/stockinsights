// Native fetch is used

async function verifyReset() {
    const baseUrl = 'http://localhost:3000';

    console.log('--- Verifying Data Deletion ---');

    try {
        // 1. Check if server is reachable
        const healthCheck = await fetch(baseUrl);
        if (!healthCheck.ok) {
            console.error('SERVER NOT REACHABLE. Please ensure "npm run dev" is running.');
            process.exit(1);
        }

        console.log('Server is running.');

        // 2. Call the reset API
        console.log('Calling DELETE /api/admin/reset ...');
        const response = await fetch(`${baseUrl}/api/admin/reset`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API returned ${response.status}: ${errText}`);
        }

        const data = await response.json();
        console.log('Reset Response:', data);

        if (data.deletedStocks !== undefined && data.deletedFiles !== undefined) {
            console.log('✅ Verification SUCCESS: API returned success structure.');
        } else {
            console.error('❌ Verification FAILED: Unexpected response structure.');
        }

    } catch (error) {
        console.error('❌ Verification FAILED:', error.message);
    }
}

verifyReset();
