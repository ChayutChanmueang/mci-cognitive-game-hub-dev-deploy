import { EventBus } from './EventBus.js';
import { Howl } from 'howler';

/**
 * VoiceService - Handles Text-to-Speech (TTS) for game instructions.
 * Uses the native Web Speech API (SpeechSynthesis).
 */
class VoiceService {
    constructor() {
        this.synth = window.speechSynthesis;
        this.defaultVoice = null;
        this.enabled = true;
        /** @type {Howl|null} Currently playing pre-recorded clip */
        this._currentHowl = null;
        
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
        const thaiVoices = voices.filter(v => v.lang.includes('th'));
        
        // Log available Thai voices so you can see their names in the console
        if (thaiVoices.length > 0) {
            console.log("Available Thai Voices:", thaiVoices.map(v => v.name));
        }

        // Change this string to the exact name of the voice you want from the console (e.g., "Microsoft Pattara - Thai (Thailand)")
        const preferredVoiceName = ""; 

        if (preferredVoiceName) {
            this.defaultVoice = thaiVoices.find(v => v.name === preferredVoiceName) || thaiVoices[0] || voices[0];
        } else {
            this.defaultVoice = thaiVoices[0] || voices[0];
        }
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
        // Stop pre-recorded Howl clip (if any)
        if (this._currentHowl) {
            this._currentHowl.stop();
            this._currentHowl = null;
        }
        // Stop Web Speech API (if any)
        if (this.synth) {
            this.synth.cancel();
        }
    }

    /**
     * Play a pre-recorded TTS MP3 from a URL via Howler.
     * Falls back to Web Speech API if the file fails to load (e.g. offline or missing).
     *
     * @param {string} url          - Relative or absolute URL to the MP3 file.
     * @param {string} fallbackText - Text to speak via Web Speech API on load failure.
     */
    speakFromUrl(url, fallbackText) {
        if (!this.enabled) return;

        // Cancel anything currently playing
        this.stop();

        // Duck BGM while narration plays
        EventBus.emit('audio:duck');

        const howl = new Howl({
            src:    [url],
            format: ['mp3'],
            html5:  true,  // stream instead of decode-all — better for mobile
        });

        this._currentHowl = howl;

        howl.once('end', () => {
            EventBus.emit('audio:unduck');
            this._currentHowl = null;
        });

        howl.once('loaderror', (_id, err) => {
            console.warn(
                `[VoiceService] Failed to load MP3 at "${url}" (${err}).`,
                'Falling back to Web Speech API.'
            );
            EventBus.emit('audio:unduck');
            this._currentHowl = null;
            // Graceful fallback — player still hears the text
            this.speak(fallbackText);
        });

        howl.play();
    }

    setEnabled(value) {
        this.enabled = !!value;
        if (!this.enabled) this.stop();
    }
}

export default new VoiceService();
