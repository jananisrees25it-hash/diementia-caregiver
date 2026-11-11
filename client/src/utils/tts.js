// Web Speech API Text-to-Speech Helper

export const isTTSSupported = () => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

export const stopSpeech = () => {
  if (isTTSSupported()) {
    window.speechSynthesis.cancel();
  }
};

export const speakText = (text, onEnd) => {
  if (!isTTSSupported() || !text) return;

  try {
    stopSpeech();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower, very clear for elderly listeners
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    // Try finding a natural English voice
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Jenny'))
    ) || voices.find(v => v.lang.startsWith('en'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('TTS playback issue:', e);
    if (onEnd) onEnd();
  }
};
