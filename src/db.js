import sqlite3 from "sqlite3";
import { open } from "sqlite";

/**
 * Initialize SQLite database for Video Cubes project
 */
export async function initDB() {
    const db = await open({
        filename: './video-cubes.db', // database file in project root
        driver: sqlite3.Database
    });

    // Create table for saved blocks (cube/TV)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS blocks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            x REAL,
            y REAL,
            z REAL,
            width REAL,
            height REAL
        )
    `);

    return db;
}

/**
 * Save a block into the database
 * @param {sqlite3.Database} db 
 * @param {string} type 'cube' | 'tv' | 'large tv'
 * @param {THREE.Vector3} position 
 * @param {number} width 
 * @param {number} height 
 */
export async function saveBlock(db, type, position, width, height) {
    await db.run(
        'INSERT INTO blocks (type,x,y,z,width,height) VALUES (?,?,?,?,?,?)',
        type, position.x, position.y, position.z, width, height
    );
}

/**
 * Get all blocks from the database
 * @param {sqlite3.Database} db 
 * @returns {Array}
 */
export async function getAllBlocks(db) {
    return await db.all('SELECT * FROM blocks');
}
