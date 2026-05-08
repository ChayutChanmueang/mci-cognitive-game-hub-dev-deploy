import Phaser from 'phaser';

/**
 * EventBus is a shared event emitter for communication between
 * the Phaser game engine and the DOM UI (MUI/Vanilla JS).
 */
export const EventBus = new Phaser.Events.EventEmitter();

export default EventBus;
