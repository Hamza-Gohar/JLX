
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SUBJECTS } from '../constants';
import type { Message, Subject, Quiz, Part, TextPart } from '../types';
import { generateResponseStream, generateQuiz } from '../services/geminiService';
import { ArrowLeftIcon, QuizIcon, PaperclipIcon, XIcon as CloseIcon } from '../components/icons';
import QuizModal from '../components/QuizModal';

declare const MathJax: any;

const MAX_FILE_SIZE_MB = 10;
const MAX_FILES = 4;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];


// Utility to convert file to base64
const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: {
            data: await base64EncodedDataPromise,
            mimeType: file.type,
        },
    };
};

const PaperPlaneIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
);

const simpleMarkdownToHtml = (text: string): string => {
  if (!text) return '';

  const mathBlocks: string[] = [];
  // 1. Protect MathJax content by replacing it with a placeholder
  let processedText = text.replace(/(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^\$\n]+?\$|\\\(.+?\\\))/g, (match) => {
    mathBlocks.push(match);
    return `__MATHJAX_PLACEHOLDER_${mathBlocks.length - 1}__`;
  });

  const escapeHtml = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // 2. Process block-level elements like code blocks, lists, and headers
  const blocks = processedText.split(/(\n\n+)/);
  let html = '';

  for (const block of blocks) {
    if (block.match(/^\n\n+$/)) {
      continue; // It's just a separator
    }

    let processedBlock = block;
    // Code blocks
    if (processedBlock.startsWith('```')) {
      processedBlock = processedBlock.replace(/```(\w*)\n([\s\S]+?)```/, (_match, lang, code) => 
        `<pre><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`
      );
    }
    // Unordered lists
    else if (processedBlock.match(/^\s*[*+-] /m)) {
      const items = processedBlock.trim().split('\n').map(item => 
        `<li>${item.replace(/^\s*[*+-]\s*/, '')}</li>`
      ).join('');
      processedBlock = `<ul>${items}</ul>`;
    }
    // Ordered lists
    else if (processedBlock.match(/^\s*\d+\. /m)) {
      const items = processedBlock.trim().split('\n').map(item => 
        `<li>${item.replace(/^\s*\d+\.\s*/, '')}</li>`
      ).join('');
      processedBlock = `<ol>${items}</ol>`;
    }
    // Headers
    else if (processedBlock.startsWith('#')) {
      processedBlock = processedBlock.replace(/^### (.*$)/gm, '<h3>$1</h3>')
                                     .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                                     .replace(/^# (.*$)/gm, '<h1>$1</h1>');
    }
    // Paragraphs
    else if (processedBlock.trim()) {
      processedBlock = `<p>${processedBlock.trim().replace(/\n/g, '<br />')}</p>`;
    }

    html += processedBlock;
  }
  processedText = html;
  
  // 3. Process inline elements
  processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  processedText = processedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
  processedText = processedText.replace(/`([^`]+?)`/g, (_match, code) => `<code>${escapeHtml(code)}</code>`);

  // 4. Restore MathJax content
  processedText = processedText.replace(/__MATHJAX_PLACEHOLDER_(\d+)__/g, (_match, index) => {
    return mathBlocks[parseInt(index, 10)];
  });

  return processedText;
};


const MessageText: React.FC<{ text: string; isStreaming: boolean }> = ({ text, isStreaming }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const mathjaxTimeoutRef = useRef<number | null>(null);

    const htmlContent = useMemo(() => {
        // Always process with markdown parser to show live formatting.
        return simpleMarkdownToHtml(text);
    }, [text]);

    useEffect(() => {
        if (contentRef.current && typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
            const typeset = () => {
                MathJax.typesetPromise([contentRef.current]).catch((err: any) => {
                    // It's expected that MathJax might fail on incomplete formulas during streaming.
                    // We can ignore these errors to avoid console spam.
                    if (!isStreaming) {
                        console.error('MathJax typesetting error:', err);
                    }
                });
            };
            
            // Throttle MathJax rendering during streaming for performance.
            if (isStreaming) {
                if (mathjaxTimeoutRef.current) {
                    clearTimeout(mathjaxTimeoutRef.current);
                }
                mathjaxTimeoutRef.current = window.setTimeout(typeset, 200); // 200ms delay
            } else {
                // When streaming is complete, ensure the final typesetting is done.
                if (mathjaxTimeoutRef.current) {
                    clearTimeout(mathjaxTimeoutRef.current);
                }
                typeset();
            }
        }
        
        return () => {
            // Cleanup timeout on unmount
            if (mathjaxTimeoutRef.current) {
                clearTimeout(mathjaxTimeoutRef.current);
            }
        };
    }, [isStreaming, htmlContent]);

    return (
        <div
            ref={contentRef}
            className="prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
    );
};

const MessagePartRenderer: React.FC<{ parts: Part[]; isStreaming: boolean }> = ({ parts, isStreaming }) => {
    return (
        <div className="space-y-3">
            {parts.map((part, index) => {
                if ('text' in part) {
                    return <MessageText key={index} text={part.text} isStreaming={isStreaming} />;
                }
                if ('inlineData' in part && part.inlineData.mimeType.startsWith('image/')) {
                    return (
                        <img
                            key={index}
                            src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`}
                            alt="User upload"
                            className="max-w-xs rounded-lg border border-slate-600"
                        />
                    );
                }
                return null;
            })}
        </div>
    );
};


// Custom hook for chat logic
const useChat = (subject: Subject | undefined) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const storageKey = `chat_history_${subject?.id}`;

    // Refs to hold current values for use in cleanup effect
    const isLoadingRef = useRef(isLoading);
    useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);

    const messagesRef = useRef(messages);
    useEffect(() => { messagesRef.current = messages; }, [messages]);

    useEffect(() => {
        if (!subject) return;
        try {
            const savedMessages = localStorage.getItem(storageKey);
            if (savedMessages) {
                setMessages(JSON.parse(savedMessages));
            }
        } catch (error) {
            console.error("Failed to parse messages from localStorage", error);
            setMessages([]);
        }
    }, [subject, storageKey]);

    useEffect(() => {
        if (!subject || messages.length === 0) return;
        localStorage.setItem(storageKey, JSON.stringify(messages));
    }, [messages, subject, storageKey]);
    
    // Effect to handle saving interrupted state on unmount
    useEffect(() => {
        return () => { // This cleanup runs when the component/hook unmounts
            if (isLoadingRef.current) {
                const finalMessages = [...messagesRef.current];
                const lastMessage = finalMessages[finalMessages.length - 1];
                if (lastMessage && lastMessage.role === 'model') {
                    if (lastMessage.parts.length === 1 && 'text' in lastMessage.parts[0] && lastMessage.parts[0].text.length === 0) {
                        lastMessage.parts = [{ text: 'User Stopped The Response' }];
                    }
                    lastMessage.isInterrupted = true;
                    localStorage.setItem(storageKey, JSON.stringify(finalMessages));
                }
            }
        };
    }, [storageKey]);

    const sendMessage = useCallback(async (parts: Part[]) => {
        if (!subject || parts.length === 0) return;

        const userMessage: Message = { role: 'user', parts };
        const assistantMessagePlaceholder: Message = { role: 'model', parts: [{ text: '' }] };
        
        setMessages(prev => [...prev, userMessage, assistantMessagePlaceholder]);
        setIsLoading(true);

        const onStream = (textChunk: string) => {
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.role === 'model' && lastMessage.parts.length > 0 && 'text' in lastMessage.parts[0]) {
                    lastMessage.parts[0].text += textChunk;
                }
                return newMessages;
            });
        };

        const onError = (errorText: string) => {
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.role === 'model') {
                    lastMessage.parts = [{ text: errorText }];
                    lastMessage.isInterrupted = true;
                }
                return newMessages;
            });
        };
        
        await generateResponseStream(subject, messages, parts, onStream, onError);
        setIsLoading(false);

    }, [subject, messages]);

    const handleTryAgain = useCallback(async (userParts: Part[], placeholderIndex: number) => {
        if (!subject) return;

        const historyForRetry = messages.slice(0, placeholderIndex - 1);
        const userMessage: Message = { role: 'user', parts: userParts };
        const assistantMessagePlaceholder: Message = { role: 'model', parts: [{ text: '' }] };
        
        setMessages([...historyForRetry, userMessage, assistantMessagePlaceholder]);
        setIsLoading(true);

        const onStream = (textChunk: string) => {
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.role === 'model' && lastMessage.parts.length > 0 && 'text' in lastMessage.parts[0]) {
                    lastMessage.parts[0].text += textChunk;
                }
                return newMessages;
            });
        };

        const onError = (errorText: string) => {
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.role === 'model') {
                    lastMessage.parts = [{ text: errorText }];
                    lastMessage.isInterrupted = true;
                }
                return newMessages;
            });
        };

        await generateResponseStream(subject, historyForRetry, userParts, onStream, onError);
        setIsLoading(false);

    }, [subject, messages]);

    return { messages, isLoading, sendMessage, handleTryAgain };
};

const FilePreview: React.FC<{ file: File; onRemove: () => void }> = ({ file, onRemove }) => {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, [file]);

    return (
        <div className="relative group bg-slate-800 p-2 rounded-lg flex items-center gap-3">
            {preview ? (
                <img src={preview} alt={file.name} className="w-12 h-12 rounded-md object-cover" />
            ) : (
                <div className="w-12 h-12 rounded-md bg-slate-700 flex items-center justify-center">
                    <PaperclipIcon className="w-6 h-6 text-slate-400" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
                onClick={onRemove}
                className="absolute -top-2 -right-2 bg-rose-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove file"
            >
                <CloseIcon className="w-4 h-4 text-white" />
            </button>
        </div>
    );
};


const SubjectPage: React.FC = () => {
    const { subjectId } = useParams<{ subjectId: string }>();
    const subject = SUBJECTS.find(s => s.id === subjectId);
    const { messages, isLoading, sendMessage, handleTryAgain } = useChat(subject);
    const [inputValue, setInputValue] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
    const [quizData, setQuizData] = useState<Quiz | null>(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizLength, setQuizLength] = useState<number>(5);
    
    const hasChatStarted = messages.length > 0;
    const isUrdu = subject?.id === 'urdu';

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    if (!subject) {
        return <div className="p-8 text-center text-red-500">Subject not found.</div>;
    }

    const { name, description, Icon, quickQuestions } = subject;

    const handleSend = async () => {
        if ((!inputValue.trim() && files.length === 0) || isLoading) return;

        const textPart: Part[] = inputValue.trim() ? [{ text: inputValue }] : [];
        const fileParts: Part[] = await Promise.all(
            files.map(file => fileToGenerativePart(file))
        );
        
        sendMessage([...textPart, ...fileParts]);
        setInputValue('');
        setFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const handleQuickQuestion = (question: string) => {
        sendMessage([{ text: question }]);
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // Fix: Explicitly type selectedFiles as File[] to ensure correct type inference for 'file' in the loop.
        const selectedFiles: File[] = Array.from(event.target.files || []);
        if (selectedFiles.length === 0) return;
        
        const newFiles = [...files];
        for (const file of selectedFiles) {
            if (newFiles.length >= MAX_FILES) {
                alert(`You can only upload a maximum of ${MAX_FILES} files.`);
                break;
            }
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                 alert(`File type not supported: ${file.name}. Please upload one of: ${ALLOWED_FILE_TYPES.join(', ')}`);
                continue;
            }
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                alert(`File is too large: ${file.name}. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
                continue;
            }
            newFiles.push(file);
        }
        setFiles(newFiles);
    };

    const removeFile = (indexToRemove: number) => {
        setFiles(files.filter((_, index) => index !== indexToRemove));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };


    const exportChat = () => {
        const chatText = messages.map(m => {
            const textContent = m.parts
                .map(p => ('text' in p ? p.text : `[Image: ${p.inlineData.mimeType}]`))
                .join('\n');
            return `${m.role === 'user' ? 'You' : name}: ${textContent}`;
        }).join('\n\n');

        const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${subject.id}_chat_export.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    const handleGenerateQuiz = useCallback(async () => {
        if (!subject) return;

        setIsGeneratingQuiz(true);
        const quiz = await generateQuiz(subject, messages, quizLength);
        if (quiz && quiz.length > 0) {
            setQuizData(quiz);
            setShowQuiz(true);
        } else {
            alert("Sorry, I couldn't generate a quiz for this conversation. Please chat a bit more about the topic and try again!");
        }
        setIsGeneratingQuiz(false);
    }, [subject, messages, quizLength]);

    return (
        <div 
            className={`flex flex-col h-full transition-all duration-500 ease-in-out ${hasChatStarted ? 'justify-between' : 'justify-center items-center'} ${isUrdu ? 'font-urdu' : ''}`}
            dir={isUrdu ? 'rtl' : 'ltr'}
        >
            {showQuiz && quizData && (
                <QuizModal 
                    quiz={quizData} 
                    subjectName={name} 
                    onClose={() => setShowQuiz(false)} 
                />
            )}
            
            {/* Animated Header */}
            <div className={`w-full p-6 transition-all duration-500 ease-in-out ${hasChatStarted ? 'border-b border-white/10' : ''}`}>
                 <div className="flex items-center justify-between w-full" dir="ltr">
                    {/* Left: Back Button */}
                    <Link to="/" className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Back to Home">
                        <ArrowLeftIcon className="w-6 h-6 text-slate-300" />
                    </Link>

                    {/* Center: Icon and Title */}
                    <div className={`flex items-center gap-4 transition-all duration-500 ease-in-out ${hasChatStarted ? 'flex-row' : 'flex-col'}`}>
                        <Icon className={`text-white transition-all duration-500 ease-in-out ${hasChatStarted ? 'w-10 h-10' : 'w-24 h-24'}`} />
                        <div>
                            <h2 className={`font-bold text-white transition-all duration-500 ease-in-out ${hasChatStarted ? 'text-2xl' : 'text-5xl text-center'}`}>{name}</h2>
                            {!hasChatStarted && 
                                <p className="text-slate-400 transition-all duration-500 ease-in-out text-center text-lg mt-2">
                                    {description}
                                </p>
                            }
                        </div>
                    </div>

                    {/* Right: Placeholder for balance */}
                    <div className="w-10 h-10" aria-hidden="true"></div>
                </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 overflow-y-auto p-6 w-full max-w-4xl mx-auto space-y-6">
                {messages.map((message, index) => {
                    const prevMessage = messages[index - 1];
                    const isLastMessage = index === messages.length - 1;
                    const textContent = (message.parts.find((p): p is TextPart => 'text' in p)?.text || '').trim();
                    const isThinking = isLastMessage && message.role === 'model' && isLoading && textContent.length === 0;
                    const isStreaming = isLastMessage && isLoading;

                    return (
                        <div key={index} className={`flex items-end gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {message.role === 'model' && <Icon className="w-8 h-8 text-white p-1.5 bg-blue-500 rounded-full flex-shrink-0" />}
                            <div className={`max-w-xl rounded-2xl px-5 py-3 ${
                                message.role === 'user' 
                                    ? `bg-blue-600 text-white ${isUrdu ? 'rounded-bl-none' : 'rounded-br-none'}` 
                                    : `bg-[#172033] text-slate-200 ${isUrdu ? 'rounded-br-none' : 'rounded-bl-none'}`
                            } break-words ${isUrdu ? 'leading-relaxed' : ''}`}>
                               {
                                isThinking ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-400 italic">AI is Thinking</span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></span>
                                    </div>
                                ) : message.isInterrupted && prevMessage?.role === 'user' ? (
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <MessagePartRenderer parts={message.parts} isStreaming={false} />
                                        </div>
                                        <button 
                                            onClick={() => handleTryAgain(prevMessage.parts, index)}
                                            className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-500 transition-colors flex-shrink-0"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                ) : (
                                    <MessagePartRenderer parts={message.parts} isStreaming={isStreaming} />
                                )}
                            </div>
                        </div>
                    );
                })}
                 <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 w-full max-w-4xl mx-auto">
                 {hasChatStarted &&
                    <div className="flex flex-wrap justify-end items-center gap-x-6 gap-y-3 mb-4">
                        <button onClick={exportChat} className="text-sm text-slate-400 hover:text-white transition-colors">Export Chat</button>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <span>Questions:</span>
                            {[3, 5, 10].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setQuizLength(num)}
                                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${quizLength === num ? 'bg-blue-600 text-white' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                         <button 
                            onClick={handleGenerateQuiz} 
                            disabled={isGeneratingQuiz || isLoading}
                            className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors disabled:text-slate-600 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <QuizIcon className="w-5 h-5" />
                            <span>{isGeneratingQuiz ? 'Generating...' : 'Quiz Me!'}</span>
                        </button>
                    </div>
                 }
                {!hasChatStarted && (
                     <div className="grid grid-cols-2 gap-3 mb-4">
                        {quickQuestions.slice(0, 4).map((q, i) => (
                            <button key={i} onClick={() => handleQuickQuestion(q)} className={`bg-white/5 p-3 rounded-xl text-sm text-slate-300 hover:bg-white/10 transition-colors ${isUrdu ? 'text-right leading-relaxed' : 'text-left'}`}>
                                {q}
                            </button>
                        ))}
                    </div>
                )}
                 {files.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        {files.map((file, index) => (
                            <FilePreview key={index} file={file} onRemove={() => removeFile(index)} />
                        ))}
                    </div>
                )}
                <div className="flex items-center gap-3 bg-[#172033] border border-white/10 rounded-xl p-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        multiple
                        accept={ALLOWED_FILE_TYPES.join(',')}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading || files.length >= MAX_FILES}
                        className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors disabled:text-slate-600 disabled:cursor-not-allowed"
                        aria-label="Attach file"
                    >
                        <PaperclipIcon className="w-5 h-5" />
                    </button>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                        placeholder={`Ask JLX anything about ${name}...`}
                        className={`flex-1 bg-transparent focus:outline-none text-slate-200 placeholder-slate-500 px-3 py-2 ${isUrdu ? 'text-right' : ''}`}
                        disabled={isLoading}
                    />
                    <button 
                        onClick={handleSend} 
                        disabled={isLoading || (!inputValue.trim() && files.length === 0)} 
                        className="bg-blue-600 text-white p-3 rounded-xl disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors"
                        aria-label="Send message"
                    >
                        <PaperPlaneIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubjectPage;
