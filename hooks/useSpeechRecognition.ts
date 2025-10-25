import { useState, useEffect, useRef, useCallback } from 'react';

// Define the interface for the SpeechRecognition API for cross-browser compatibility
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onerror: ((event: any) => void) | null;
    onresult: ((event: any) => void) | null;
}

// Extend the Window interface to include possible SpeechRecognition constructors
declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

export const useSpeechRecognition = ({ lang }: { lang: string }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const hasRecognitionSupport = !!SpeechRecognitionAPI;

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopListening();
        };
    }, [stopListening]);


    const startListening = useCallback((currentText = '') => {
        if (isListening || !hasRecognitionSupport) return;

        const recognition = new SpeechRecognitionAPI();
        recognitionRef.current = recognition;

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = lang;

        recognition.onstart = () => {
            setIsListening(true);
            setTranscript(currentText);
        };

        recognition.onend = () => {
            setIsListening(false);
            // Don't clear transcript, let the component decide
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'not-allowed') {
                 alert("Microphone access was denied. Please allow microphone access in your browser settings to use this feature.");
            }
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            const transcriptResult = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
            
            const prefix = currentText ? currentText.trim() + ' ' : '';
            setTranscript(prefix + transcriptResult);
        };
        
        recognition.start();

    }, [isListening, hasRecognitionSupport, lang]);

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        hasRecognitionSupport,
    };
};
