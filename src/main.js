import StartGame from './game/main';
import db from "./core/database.js";

document.addEventListener('DOMContentLoaded', () => {
    db.initAuth().catch((error) => {
        console.error("Failed to initialize Supabase auth:", error);
    });

    StartGame('game-container');

});
