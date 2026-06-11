# Audio System Technical Guide

The project utilizes a global audio architecture based on **Howler.js** to handle sound effects (SFX) and background music (BGM) across the game hub and individual Phaser minigames.

## Core Concepts

The system uses an **Event-Driven Broker Pattern**. Individual Phaser games do not handle audio contexts, HTML5 Audio elements, or global volume control themselves. Instead, they emit events over a shared `EventBus`, which the `AudioManager` listens to. 

This provides several key advantages:
1. **Persistent State**: The Hub BGM can play seamlessly across page changes, and the master volume/mute preferences persist between minigames.
2. **Memory Management**: The audio context is kept alive rather than created and destroyed as users transition between Phaser scenes.
3. **Voice Ducking**: Text-to-Speech instructions can smoothly lower the master BGM while speaking, and raise it back up seamlessly.
4. **Mobile Autoplay Compliance**: The `AudioManager` attaches a global listener to the DOM to unlock the Web Audio context upon the user's first click or touch, avoiding strict browser autoplay policies.

---

## 1. The Global Audio Manager

Located at `src/core/audio-manager.js`, the `AudioManager` is the central brain for sound. It handles parsing the `Howler` configurations and managing playback.

It is initialized exactly once inside `src/main.js` when the app loads:
```javascript
import AudioManager from "./core/audio-manager.js";

document.addEventListener("DOMContentLoaded", () => {
    AudioManager.init(); // Hooks into EventBus and DOM listeners
});
```

---

## 2. Using the EventBus

For minigames, you should exclusively interact with the Audio System through the `EventBus`. Do not import `AudioManager` directly into a game scene to avoid tight coupling.

### Playing a Global SFX
To play a sound that is pre-registered in the `AudioManager` (like the UI click sound):
```javascript
import { EventBus } from '../../../../core/EventBus.js';

// Play the universal UI click sound
EventBus.emit('audio:play', 'ui:click');
```

### Playing BGM
To play a global background track (like the Hub BGM):
```javascript
// Starts playing, crossfading automatically if another track was active
EventBus.emit('audio:bgm', 'hub'); 

// To stop the BGM
EventBus.emit('audio:bgm-stop');
```

---

## 3. Registering Game-Specific Audio

Since we don't want to load every minigame's sound effects upfront, games can register and unregister their specific audio dynamically using namespaces.

### Registering Sounds (on Game Start)
Inside your Phaser `Scene`'s `create()` or `init()` method:
```javascript
import { EventBus } from '../../core/EventBus.js';

// Define the sounds you want to load
const myGameSounds = {
    'jump': { src: ['assets/my-game/jump.mp3'] },
    'win': { src: ['assets/my-game/win.wav'], volume: 0.8 },
};

// Register them under a specific namespace (e.g., your game's slug)
EventBus.emit('audio:register', 'my-game-namespace', myGameSounds);
```

### Playing Game-Specific Sounds
Once registered, prefix the namespace when playing the sound:
```javascript
EventBus.emit('audio:play', 'my-game-namespace:jump');
```

### Unregistering Sounds (on Game Exit)
To ensure the game doesn't leak memory, the sounds must be unregistered when the player leaves the game. **Note:** `src/main.js` automatically attempts to emit `audio:unregister` with the `currentGameSlug` when destroying the active game, so this is generally handled for you!

---

## 4. Voice Ducking (Text-To-Speech)

When instructions are read aloud, we want the background music to lower so the player can hear the text clearly. This is handled automatically through `VoiceService` (`src/core/voice-service.js`).

1. `VoiceService` emits `audio:duck` just before `window.speechSynthesis.speak()` is called.
2. `AudioManager` listens for `audio:duck` and smoothly fades the master volume to 20%.
3. When the TTS finishes or encounters an error, `VoiceService` emits `audio:unduck`, and `AudioManager` restores the volume to the user's preferred level.

---

## 5. UI Controls (Mute & Volume)

The `AudioManager` handles saving and loading the user's audio preferences via `StorageManager`. To modify these from the DOM (e.g., the Game Hub):

```javascript
import AudioManager from "../core/audio-manager.js";

// Toggle Mute
AudioManager.toggleMute();

// Check if currently muted
const isMuted = AudioManager.isMuted(); // Returns boolean

// Set Master Volume (0.0 to 1.0)
AudioManager.setVolume(0.5);

// Get Master Volume
const currentVol = AudioManager.getVolume();
```
