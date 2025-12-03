-- Migration script to add kategori column to product table
-- Run this script manually if auto-migration doesn't work

-- Check if column exists before adding
SET @db_name = DATABASE();
SET @table_name = 'product';
SET @column_name = 'kategori';

SELECT COUNT(*) INTO @column_exists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = @db_name
  AND TABLE_NAME = @table_name
  AND COLUMN_NAME = @column_name;

-- Add column if it doesn't exist
SET @sql = IF(@column_exists = 0,
    'ALTER TABLE product ADD COLUMN kategori VARCHAR(255) NULL AFTER serialNumber',
    'SELECT "Column kategori already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify the column was added
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = @db_name
  AND TABLE_NAME = @table_name
  AND COLUMN_NAME = @column_name;











