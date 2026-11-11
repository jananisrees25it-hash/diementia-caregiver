import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Sparkles, HelpCircle } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export const VoiceAssistant = ({ onCommand }) => {
  const { speak, isTTSSupported } = useAccessibility();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [hasSpeechRecog, setHasSpeechRecog] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setHasSpeechRecog(true);
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'en-US';

      recog.onresult = (event) => {
        const spoken = event.results[0][0].transcript.toLowerCase();
        setTranscript(spoken);
        handleVoiceCommand(spoken);
      };

      recog.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    }
  }, []);

  const handleVoiceCommand = (cmd) => {
    if (cmd.includes('reminder') || cmd.includes('routine') || cmd.includes('tasks')) {
      speak('Checking your daily routine and medication reminders.');
      if (onCommand) onCommand('read-reminders');
    } else if (cmd.includes('water') || cmd.includes('drink') || cmd.includes('hydrat')) {
      speak('Recording a glass of water. Good job staying hydrated!');
      if (onCommand) onCommand('drink-water');
    } else if (cmd.includes('game') || cmd.includes('memory') || cmd.includes('play')) {
      speak('Opening your cognitive memory games.');
      if (onCommand) onCommand('open-games');
    } else if (cmd.includes('help') || cmd.includes('emergency') || cmd.includes('call')) {
      speak('Opening emergency assistance for you right away.');
      if (onCommand) onCommand('open-emergency');
    } else if (cmd.includes('time')) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      speak(`The current time is ${timeStr}.`);
    } else {
      speak(`You said: ${cmd}. You can say: Read reminders, Drink water, Play games, or Emergency.`);
    }
  };

  const toggleListening = () => {
    if (!hasSpeechRecog) {
      speak("Voice microphone recognition is supported in Chrome, Edge, and Safari. You can tap any of the quick voice buttons below.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      try {
        recognition.start();
        setIsListening(true);
        speak("Listening. How can I help you?");
      } catch (e) {
        console.warn('Error starting recognition:', e);
      }
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--blue-50)',
      border: '1.5px solid var(--blue-200)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem',
      marginBottom: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            backgroundColor: 'var(--blue-500)',
            color: '#fff',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--blue-900)' }}>
              Voice & Audio Assistant
            </h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Speak aloud or tap quick actions below
            </div>
          </div>
        </div>

        {/* Mic Activation Button */}
        <button
          id="btn-voice-mic"
          onClick={toggleListening}
          className={`btn ${isListening ? 'btn-danger' : 'btn-primary'}`}
          style={{ minHeight: '2.6rem', padding: '0.5rem 1.25rem' }}
          title={isListening ? 'Tap to stop listening' : 'Tap and speak command'}
        >
          {isListening ? (
            <>
              <MicOff size={18} className="animate-pulse" /> Listening...
            </>
          ) : (
            <>
              <Mic size={18} /> Speak a Command
            </>
          )}
        </button>
      </div>

      {transcript && (
        <div style={{
          backgroundColor: '#fff',
          padding: '0.65rem 1rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.95rem',
          color: 'var(--blue-800)',
          border: '1px solid var(--blue-200)'
        }}>
          <strong>Recognized:</strong> "{transcript}"
        </div>
      )}

      {/* Quick Voice One-Tap Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button 
          id="btn-voice-read-reminders"
          className="btn btn-outline btn-sm"
          onClick={() => handleVoiceCommand('read reminders')}
          style={{ backgroundColor: '#fff' }}
        >
          <Volume2 size={16} /> "Read Reminders"
        </button>

        <button 
          id="btn-voice-drink-water"
          className="btn btn-outline btn-sm"
          onClick={() => handleVoiceCommand('drink water')}
          style={{ backgroundColor: '#fff' }}
        >
          💧 "Drink Water"
        </button>

        <button 
          id="btn-voice-play-games"
          className="btn btn-outline btn-sm"
          onClick={() => handleVoiceCommand('play game')}
          style={{ backgroundColor: '#fff' }}
        >
          🧩 "Play Games"
        </button>

        <button 
          id="btn-voice-emergency"
          className="btn btn-outline btn-sm"
          onClick={() => handleVoiceCommand('emergency')}
          style={{ backgroundColor: '#fff', color: 'var(--coral-700)', borderColor: 'var(--coral-200)' }}
        >
          🚨 "Emergency Help"
        </button>
      </div>
    </div>
  );
};
