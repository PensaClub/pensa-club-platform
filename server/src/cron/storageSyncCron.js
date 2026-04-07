const cron = require('node-cron');

const startStorageSyncCron = () => {
    // Run every hour at minute 0
    cron.schedule('0 * * * *', async () => {
        // Lazy-require to avoid circular dependency issues at startup
        const storageController = require('../controllers/storageController');
        const { syncLock } = storageController.getSyncState();

        if (syncLock) {
            console.log('[StorageSync] Skipping — sync already in progress');
            return;
        }

        storageController.setSyncState({ syncLock: true });

        try {
            console.log('[StorageSync] Hourly sync started');
            const result = await storageController.runStorageSync();
            storageController.setSyncState({
                syncLock: false,
                lastSyncResult: result,
                lastSyncTime: new Date().toISOString(),
            });
            console.log(`[StorageSync] Completed — synced: ${result.synced}, orphans: ${result.orphans.length}, errors: ${result.errors.length}`);
        } catch (err) {
            storageController.setSyncState({ syncLock: false });
            console.error('[StorageSync] Cron error:', err);
        }
    }, {
        timezone: 'Europe/Sofia',
    });

    console.log('[StorageSync] Hourly storage sync cron started');
};

module.exports = { startStorageSyncCron };
