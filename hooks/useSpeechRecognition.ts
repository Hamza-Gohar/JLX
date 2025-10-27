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
    const [error, setError] = useState<string | null>(null);
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


    const startListening = useCallback(() => {
        if (isListening || !hasRecognitionSupport) return;
        
        setError(null); // Clear previous errors

        const recognition = new SpeechRecognitionAPI();
        recognitionRef.current = recognition;

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = lang;

        recognition.onstart = () => {
            setIsListening(true);
            setTranscript('');
        };

        recognition.onend = () => {
            setIsListening(false);
            // Don't clear transcript, let the component decide
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            let errorMessage = "An unknown error occurred during speech recognition.";
            if (event.error === 'not-allowed') {
                 errorMessage = "Microphone access was denied. Please allow it in your browser settings.";
            } else if (event.error === 'network') {
                errorMessage = "Network error. Please check your internet connection and try again.";
            } else if (event.error === 'no-speech') {
                errorMessage = "No speech was detected. Please try again.";
            }
            setError(errorMessage);
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            const transcriptResult = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
            
            setTranscript(transcriptResult);
        };
        
        recognition.start();

    }, [isListening, hasRecognitionSupport, lang]);

    return {
        isListening,
        transcript,
        error,
        startListening,
        stopListening,
        hasRecognitionSupport,
    };
};