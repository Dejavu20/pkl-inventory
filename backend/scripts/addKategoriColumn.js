import db from '../config/Database.js';
import { Sequelize } from 'sequelize';

const addKategoriColumn = async () => {
    try {
        console.log('Checking if kategori column exists...');
        
        // Check if column exists
        const [results] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'product' 
            AND COLUMN_NAME = 'kategori'
        `);

        if (results.length > 0) {
            console.log('✓ Column kategori already exists. Skipping migration.');
            return;
        }

        console.log('Adding kategori column to product table...');
        
        // Add kategori column
        await db.query(`
            ALTER TABLE product 
            ADD COLUMN kategori VARCHAR(255) NULL 
            AFTER serialNumber
        `);

        console.log('✓ Successfully added kategori column to product table.');
    } catch (error) {
        console.error('Error adding kategori column:', error.message);
        throw error;
    }
};

// Run migration
(async () => {
    try {
        await db.authenticate();
        console.log('Database connection established.');
        
        await addKategoriColumn();
        
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
})();








