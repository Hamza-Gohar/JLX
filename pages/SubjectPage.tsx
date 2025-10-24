import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SUBJECTS } from '../constants';
import type { Message, Subject, Quiz, Part, TextPart } from '../types';
import { generateResponse, generateQuiz } from '../services/geminiService';
import { ArrowLeftIcon, QuizIcon, PaperclipIcon, XIcon as CloseIcon, TrashIcon } from '../components/icons';
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

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10.5 3.75a2.25 2.25 0 00-2.25 2.25v12a2.25 2.25 0 002.25 2.25h3a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25h-3zm-2.25 2.25a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v12a.75.75 0 01-.75.75h-3a.75.75 0 01-.75-.75V6zm6-1.5A2.25 2.25 0 0012 2.25H6a2.25 2.25 0 00-2.25 2.25v12A2.25 2.25 0 006 19.5h1.5a.75.75 0 000-1.5H6a.75.75 0 01-.75-.75V4.5a.75.75 0 01.75-.75h6a.75.75 0 01.75.75v1.5a.75.75 0 001.5 0v-1.5z" clipRule="evenodd" />
    </svg>
);

const ClipboardCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.454-12.68a.75.75 0 011.04-.208z" clipRule="evenodd" />
    </svg>
);

const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = useCallback(() => {
        if (isCopied) return;
        navigator.clipboard.writeText(code).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2500);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }, [code, isCopied]);

    return (
        <div className="bg-slate-800/70 rounded-lg my-4 overflow-hidden border border-slate-700">
            <div className="flex justify-between items-center px-4 py-1.5 bg-slate-900/50">
                <span className="text-xs font-sans text-slate-400 lowercase">{language || 'code'}</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                    disabled={isCopied}
                >
                    {isCopied ? <ClipboardCheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                    {isCopied ? 'Copied!' : 'Copy code'}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm">
                <code className={`font-mono language-${language}`}>{code}</code>
            </pre>
        </div>
    );
};

const FormattedMessageContent: React.FC<{ text: string; isStreaming: boolean }> = ({ text, isStreaming }) => {
    const contentRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!isStreaming && contentRef.current && typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
            MathJax.typesetClear([contentRef.current]);
            MathJax.typesetPromise([contentRef.current]).catch((err: any) => {
                console.error('MathJax typesetting error:', err);
            });
        }
    }, [isStreaming, text]);

    const parseInline = (line: string): React.ReactNode => {
        const mathRegex = /(\$[^$]+\$|\$\$[\s\S]+?\$\$)/g;
        const parts = line.split(mathRegex);

        return parts.map((part, i) => {
            if (i % 2 === 1) { // This is a MathJax part
                return part;
            }

            const inlineRegex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|~~.*?~~)/g;
            const textParts = part.split(inlineRegex).filter(Boolean);

            return textParts.map((textPart, j) => {
                if (textPart.startsWith('**') && textPart.endsWith('**')) {
                    return <strong key={j}>{textPart.slice(2, -2)}</strong>;
                }
                if (textPart.startsWith('*') && textPart.endsWith('*')) {
                    return <em key={j}>{textPart.slice(1, -1)}</em>;
                }
                if (textPart.startsWith('`') && textPart.endsWith('`')) {
                    return <code key={j} className="bg-slate-700 rounded px-1 py-0.5 font-mono text-sm">{textPart.slice(1, -1)}</code>;
                }
                if (textPart.startsWith('~~') && textPart.endsWith('~~')) {
                    return <del key={j}>{textPart.slice(2, -2)}</del>;
                }
                return textPart;
            });
        });
    };
    
    const MarkdownList: React.FC<{ lines: string[], parseInlineFn: (line: string) => React.ReactNode }> = ({ lines, parseInlineFn }) => {
        const getIndent = (line: string): number => line.match(/^\s*/)?.[0].length ?? 0;

        const buildList = (startIndex: number, minIndent: number): [React.ReactElement | null, number] => {
            const items: React.ReactNode[] = [];
            let currentIndex = startIndex;

            if (currentIndex >= lines.length) return [null, currentIndex];

            const listType = lines[startIndex].trim().startsWith('*') || lines[startIndex].trim().startsWith('-') ? 'ul' : 'ol';

            while (currentIndex < lines.length) {
                const line = lines[currentIndex];
                const indent = getIndent(line);
                
                if (line.trim() === '') {
                    currentIndex++;
                    continue;
                }

                if (indent < minIndent) break;

                if (indent === minIndent) {
                    const liContentNodes: React.ReactNode[] = [];
                    let textBlockLines: string[] = [line.trim().replace(/^\s*(\*|-|\d+\.)\s+/, '')];
                    let nestedList: React.ReactElement | null = null;
                    let nextIndex = currentIndex + 1;

                    const renderTextBlock = () => {
                        if (textBlockLines.length > 0 && textBlockLines.join('').trim()) {
                            liContentNodes.push(parseInlineFn(textBlockLines.join('\n')));
                        }
                        textBlockLines = [];
                    };

                    while (nextIndex < lines.length) {
                        const nextLine = lines[nextIndex];
                        const nextIndent = getIndent(nextLine);
                        if (nextIndent <= minIndent && nextLine.trim() !== '') break;

                        if (nextIndent > minIndent || nextLine.trim() === '') {
                             if (nextLine.match(/^\s*(\*|-|\d+\.)\s/)) {
                                renderTextBlock();
                                [nestedList, nextIndex] = buildList(nextIndex, nextIndent);
                                break;
                            } else if (nextLine.trim().startsWith('```')) {
                                renderTextBlock();
                                const lang = nextLine.trim().substring(3);
                                const codeLines: string[] = [];
                                nextIndex++;
                                while (nextIndex < lines.length && !lines[nextIndex].trim().startsWith('```')) {
                                    codeLines.push(lines[nextIndex]);
                                    nextIndex++;
                                }
                                const baseIndent = codeLines.length > 0 ? getIndent(codeLines[0]) : 0;
                                const code = codeLines.map(l => l.substring(baseIndent)).join('\n');
                                liContentNodes.push(<CodeBlock key={liContentNodes.length} language={lang} code={code} />);
                                if (nextIndex < lines.length) nextIndex++; 
                            } else {
                                textBlockLines.push(nextLine.substring(minIndent + 2)); // Basic un-indent
                                nextIndex++;
                            }
                        } else {
                            break;
                        }
                    }
                    renderTextBlock();

                    items.push(<li key={currentIndex}>{liContentNodes}{nestedList}</li>);
                    currentIndex = nextIndex;
                } else {
                   currentIndex++;
                }
            }

            const ListComponent = listType === 'ul' ? 'ul' : 'ol';
            const listClasses = ListComponent === 'ul' 
                ? "list-disc list-outside space-y-2 my-2 pl-5"
                : "list-decimal list-outside space-y-2 my-2 pl-5";
    
            return [<ListComponent key={startIndex} className={listClasses}>{items}</ListComponent>, currentIndex];
        };

        const firstRealLineIndex = lines.findIndex(l => l.trim() !== '');
        if (firstRealLineIndex === -1) return null;

        const [listElement] = buildList(firstRealLineIndex, getIndent(lines[firstRealLineIndex]));
        return listElement;
    };


    const renderContent = () => {
        const blocks = text.split(/\n{2,}/);
        
        return blocks.map((block, i) => {
            const trimmedBlock = block.trim();
            if (!trimmedBlock) return null;

            const lines = trimmedBlock.split('\n');
            const firstLine = lines[0];

            if (firstLine.startsWith('###### ')) return <h6 key={i} className="text-xs font-bold mt-2 mb-2">{parseInline(firstLine.substring(7))}</h6>;
            if (firstLine.startsWith('##### ')) return <h5 key={i} className="text-sm font-bold mt-2 mb-2">{parseInline(firstLine.substring(6))}</h5>;
            if (firstLine.startsWith('#### ')) return <h4 key={i} className="text-base font-bold mt-3 mb-2">{parseInline(firstLine.substring(5))}</h4>;
            if (firstLine.startsWith('### ')) return <h3 key={i} className="text-lg font-bold mt-4 mb-2">{parseInline(firstLine.substring(4))}</h3>;
            if (firstLine.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-5 mb-2">{parseInline(firstLine.substring(3))}</h2>;
            if (firstLine.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold mt-6 mb-2">{parseInline(firstLine.substring(2))}</h1>;
            
            if (trimmedBlock.startsWith('```') && trimmedBlock.endsWith('```')) {
                const language = lines[0].substring(3).trim();
                const code = lines.slice(1, -1).join('\n');
                return <CodeBlock key={i} language={language} code={code} />;
            }

            const isSeparatorLine = (line: string) => /^\s*\|?(\s*:?--+:?\s*\|)+(\s*:?--+:?\s*)?\|?\s*$/.test(line);
            const isTable = lines.length >= 2 && lines[0].includes('|') && isSeparatorLine(lines[1]);
            
            if (isTable) {
                const parseRow = (rowString: string) => {
                    return rowString.replace(/^\s*\||\|\s*$/g, '').split('|').map(cell => cell.trim());
                };

                const headers = parseRow(lines[0]);
                const bodyLines = lines.slice(2);

                return (
                    <div key={i} className="my-4 overflow-x-auto rounded-lg border border-slate-600">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-700/50">
                                <tr>
                                    {headers.map((header, hIndex) => (
                                        <th key={hIndex} className="p-3 font-semibold text-left text-slate-200">{parseInline(header)}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {bodyLines.map((line, lIndex) => {
                                    if (!line.includes('|')) return null;
                                    const cells = parseRow(line);
                                    const cellCountDiff = headers.length - cells.length;
                                    if (cellCountDiff > 0) {
                                        for(let k = 0; k < cellCountDiff; k++) cells.push('');
                                    }

                                    return (
                                        <tr key={lIndex} className="border-t border-slate-700 hover:bg-slate-800/40">
                                            {cells.slice(0, headers.length).map((cell, cIndex) => (
                                                <td key={cIndex} className="p-3 text-slate-300 align-top">{parseInline(cell)}</td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                );
            }
            
            if (/^\s*(\*|-|\d+\.)\s/.test(trimmedBlock)) {
                return <MarkdownList key={i} lines={lines} parseInlineFn={parseInline} />;
            }

            return <p key={i} className="my-2">{parseInline(block)}</p>;
        });
    };

    return (
        <div
            ref={contentRef}
            className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap"
        >
          {renderContent()}
        </div>
    );
};


const MessagePartRenderer: React.FC<{ parts: Part[]; isStreaming: boolean }> = ({ parts, isStreaming }) => {
    return (
        <div className="space-y-3">
            {parts.map((part, index) => {
                if ('text' in part) {
                    return <FormattedMessageContent key={index} text={part.text} isStreaming={isStreaming} />;
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
            } else {
                setMessages([]);
            }
        } catch (error) {
            console.error("Failed to parse messages from localStorage", error);
            setMessages([]);
        }
    }, [subject, storageKey]);

    useEffect(() => {
        if (!subject) return;
        if (messages.length > 0) {
            localStorage.setItem(storageKey, JSON.stringify(messages));
        } else {
            localStorage.removeItem(storageKey);
        }
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

    const clearChat = useCallback(() => {
        // Explicitly remove from localStorage to ensure data is cleared,
        // then update state to re-render the UI. This is more robust
        // than relying solely on the useEffect hook.
        localStorage.removeItem(storageKey);
        setMessages([]);
    }, [storageKey]);

    const sendMessage = useCallback(async (parts: Part[]) => {
        if (!subject || parts.length === 0) return;

        const userMessage: Message = { role: 'user', parts };
        const assistantMessagePlaceholder: Message = { role: 'model', parts: [{ text: '' }] };
        
        setMessages(prev => [...prev, userMessage, assistantMessagePlaceholder]);
        setIsLoading(true);

        try {
            const fullText = await generateResponse(subject, messages, parts);
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.role === 'model') {
                    lastMessage.parts = [{ text: fullText }];
                }
                return newMessages;
            });
        } catch (error) {
            const errorText = error instanceof Error ? error.message : "An unknown error occurred.";
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.role === 'model') {
                    lastMessage.parts = [{ text: errorText }];
                    lastMessage.isInterrupted = true;
                }
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }

    }, [subject, messages]);

    const handleTryAgain = useCallback(async (userParts: Part[], placeholderIndex: number) => {
        if (!subject) return;

        const historyForRetry = messages.slice(0, placeholderIndex - 1);
        const userMessage: Message = { role: 'user', parts: userParts };
        const assistantMessagePlaceholder: Message = { role: 'model', parts: [{ text: '' }] };
        
        setMessages([...historyForRetry, userMessage, assistantMessagePlaceholder]);
        setIsLoading(true);

        try {
            const fullText = await generateResponse(subject, historyForRetry, userParts);
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.role === 'model') {
                    lastMessage.parts = [{ text: fullText }];
                }
                return newMessages;
            });
        } catch (error) {
            const errorText = error instanceof Error ? error.message : "An unknown error occurred.";
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.role === 'model') {
                    lastMessage.parts = [{ text: errorText }];
                    lastMessage.isInterrupted = true;
                }
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }

    }, [subject, messages]);

    return { messages, isLoading, sendMessage, handleTryAgain, clearChat };
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
    const { messages, isLoading, sendMessage, handleTryAgain, clearChat } = useChat(subject);
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
    
    const handleClearChat = () => {
        clearChat();
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
            <div className={`w-full transition-all duration-500 ease-in-out ${hasChatStarted ? 'py-3 px-6 border-b border-white/10' : 'p-6'}`}>
                 <div className="flex items-center justify-between w-full" dir="ltr">
                    {/* Left: Back Button */}
                    <Link to="/" className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Back to Home">
                        <ArrowLeftIcon className="w-6 h-6 text-slate-300" />
                    </Link>

                    {/* Center: Icon and Title */}
                    <div className={`flex items-center gap-4 transition-all duration-500 ease-in-out ${hasChatStarted ? 'flex-row' : 'flex-col'}`}>
                        <Icon className={`text-white transition-all duration-500 ease-in-out ${hasChatStarted ? 'w-10 h-10' : 'w-16 h-16 sm:w-24 sm:h-24'}`} />
                        <div>
                            <h2 className={`font-bold text-white transition-all duration-500 ease-in-out ${hasChatStarted ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl md:text-5xl text-center'}`}>{name}</h2>
                            {!hasChatStarted && 
                                <p className="text-slate-400 transition-all duration-500 ease-in-out text-center text-base md:text-lg mt-2">
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
                                            className="text-xs sm:text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-500 transition-colors flex-shrink-0"
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
                    <div className={`flex flex-wrap items-center gap-x-6 gap-y-3 mb-4 ${isUrdu ? 'justify-start' : 'justify-end'}`} dir="ltr">
                        {isUrdu ? (
                            <>
                                <button 
                                    onClick={handleGenerateQuiz} 
                                    disabled={isGeneratingQuiz || isLoading}
                                    className="text-xs sm:text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors disabled:text-slate-600 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <QuizIcon className="w-5 h-5" />
                                    <span>{isGeneratingQuiz ? 'Generating...' : 'Quiz Me!'}</span>
                                </button>
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
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
                                <button onClick={exportChat} className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors">Export Chat</button>
                                <button onClick={handleClearChat} className="text-xs sm:text-sm text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1.5">
                                    <TrashIcon className="w-4 h-4" />
                                    Clear Chat
                                </button>
                            </>
                        ) : (
                             <>
                                <button onClick={handleClearChat} className="text-xs sm:text-sm text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1.5">
                                    <TrashIcon className="w-4 h-4" />
                                    Clear Chat
                                </button>
                                <button onClick={exportChat} className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors">Export Chat</button>
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
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
                                    className="text-xs sm:text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors disabled:text-slate-600 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <QuizIcon className="w-5 h-5" />
                                    <span>{isGeneratingQuiz ? 'Generating...' : 'Quiz Me!'}</span>
                                </button>
                            </>
                        )}
                    </div>
                 }
                {!hasChatStarted && (
                     <div className="grid grid-cols-2 gap-3 mb-4">
                        {quickQuestions.slice(0, 4).map((q, i) => (
                            <button key={i} onClick={() => handleQuickQuestion(q)} className={`bg-white/5 p-2 sm:p-3 rounded-xl text-xs sm:text-sm text-slate-300 hover:bg-white/10 transition-colors ${isUrdu ? 'text-right leading-relaxed' : 'text-left'}`}>
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
                        className={`flex-1 bg-transparent focus:outline-none text-slate-200 placeholder-slate-500 px-3 py-2 ${isUrdu ? 'text-right' : 'text-left'}`}
                        dir={isUrdu ? 'rtl' : 'ltr'}
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