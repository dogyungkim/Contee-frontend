// This is a temporary test script.
// Run with: NEXT_PUBLIC_USE_MOCK=true npx tsx src/lib/test-api.ts

async function test() {
    // Set mock env var manually for this script context if needed,
    // but better to pass it when running command.
    process.env.NEXT_PUBLIC_USE_MOCK = 'true';

    try {
        const { getMyTeams, createTeam, getTeam } = await import('./api/team');

        console.log('--- Testing getMyTeams ---');
        const teams = await getMyTeams();
        console.log('Teams:', teams);

        console.log('\n--- Testing createTeam ---');
        const newTeam = await createTeam({ name: 'New Test Team', description: 'Testing creation' });
        console.log('Created Team:', newTeam);

        console.log('\n--- Testing getTeam ---');
        const team = await getTeam(newTeam.id);
        console.log('Fetched Team:', team);

    } catch (error) {
        console.error('Test Failed:', error);
    }
}

test();
