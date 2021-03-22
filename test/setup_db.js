const spawn = require('child-process-promise').spawn;
const path = require('path');


const spawnOptions = { stdio: 'inherit' };

before(async() => {
    console.log('setting up db');

    (async () => {
        // Our database URL
        const url = 'mysql://root@localhost:3306/my_database'

        try {
            // Migrate the DB
            await spawn('npx sequelize', ['db:migrate'], spawnOptions);
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
});