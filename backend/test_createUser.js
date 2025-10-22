import { createUser } from './data/users.js';

async function expectThrow(testName, fn) {
    try {
        await fn();
        console.error(`[FAIL] ${testName} - expected function to throw but it did not`);
    } catch (err) {
        console.log(`[PASS] ${testName} - threw: ${err.message}`);
    }
}

async function runTests() {
    console.log('Running createUser validation tests (no DB required)...');

    await expectThrow('missing username', () => createUser(undefined, 'ValidPass1!'));
    await expectThrow('missing password', () => createUser('validuser', undefined));
    await expectThrow('short username', () => createUser('ab', 'ValidPass1!'));
    await expectThrow('weak password (too short)', () => createUser('validuser2', 'abc'));
    await expectThrow('weak password (no uppercase)', () => createUser('validuser3', 'lowercase1!'));

    console.log('All tests completed.');
}

runTests().catch((err) => {
    console.error('Test runner error:', err);
});
