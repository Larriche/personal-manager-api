const spawn = require('child-process-promise').spawn;

const spawnOptions = { stdio: 'inherit' };

(async () => {
    // Our database URL
    const url = 'mysql://root@localhost:3306/my_database'

    try {
        // Migrate the DB
        await spawn('./node_modules/.bin/sequelize', ['db:migrate'], spawnOptions);
        console.log('*************************');
        console.log('Migration successful');
    } catch (err) {
        // Oh no!
        console.log('*************************');
        console.log('Migration failed. Error:', err.message);
        process.exit(1);
    }
    process.exit(0);
})();

