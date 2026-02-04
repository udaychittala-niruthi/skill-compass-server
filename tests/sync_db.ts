import sequelize from '../src/config/db';
import '../src/models'; // Ensure models are loaded

async function sync() {
    try {
        console.log('Connecting to DB...');
        await sequelize.authenticate();
        console.log('DB Connected. Syncing...');
        await sequelize.sync({ alter: true });
        console.log('✅ DB Synced successfully (alter: true).');
    } catch (e) {
        console.error('❌ Sync failed:', e);
    } finally {
        await sequelize.close();
        process.exit();
    }
}

sync();
