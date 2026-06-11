import { EventBus } from './EventBus.js';

/**
 * VoiceService - Handles Text-to-Speech (TTS) for game instructions.
 * Uses the native Web Speech API (SpeechSynthesis).
 */
class VoiceService {
    constructor() {
        this.synth = window.speechSynthesis;
        this.defaultVoice = null;
        this.enabled = true;
        
        // Try to find a suitable Thai voice on initialization
        if (this.synth) {
            this._loadVoices();
            if (this.synth.onvoiceschanged !== undefined) {
                this.synth.onvoiceschanged = () => this._loadVoices();
            }
        }
    }

    _loadVoices() {
        const voices = this.synth.getVoices();
        // Prefer Thai voices for this project
        this.defaultVoice = voices.find(v => v.lang.includes('th')) || voices[0];
    }

    /**
     * Speak a given text.
     * @param {string} text - The text to speak.
     * @param {Object} options - Speech options (rate, pitch, volume).
     */
    speak(text, options = {}) {
        if (!this.synth || !this.enabled || !text) return;

        // Cancel any ongoing speech
        this.synth.cancel();

        // Tell AudioManager to lower BGM while we speak
        EventBus.emit('audio:duck');

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = options.voice || this.defaultVoice;
        utterance.rate = options.rate || 0.9; // Slightly slower for elderly
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;

        utterance.onend = () => {
            EventBus.emit('audio:unduck');
        };

        utterance.onerror = () => {
            EventBus.emit('audio:unduck');
        };

        this.synth.speak(utterance);
    }

    stop() {
        if (this.synth) {
            this.synth.cancel();
        }
    }

    setEnabled(value) {
        this.enabled = !!value;
        if (!this.enabled) this.stop();
    }
}

export default new VoiceService();
