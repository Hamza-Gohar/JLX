import React from 'react';

export const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

export const ArrowRightIcon: React.FC<{ className?: string }> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7" />
    </svg>
);

export const ArrowLeftIcon: React.FC<{ className?: string }> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7-7l-7 7 7 7" />
    </svg>
);

export const PaperclipIcon: React.FC<{ className?: string }> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01.01-.01z" />
    </svg>
);


export const MathIcon: React.FC<{ className?: string }> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2.5" ry="2.5" />
    <line x1="8" y1="7" x2="8" y2="9" />
    <line x1="7" y1="8" x2="9" y2="8" />
    <line x1="15" y1="7" x2="17" y2="9" />
    <line x1="17" y1="7" x2="15" y2="9" />
    <line x1="8" y1="15" x2="8" y2="17" />
    <line x1="7" y1="16" x2="9" y2="16" />
    <circle cx="16" cy="16" r="1" />
  </svg>
);

export const PhysicsIcon: React.FC<{ className?: string }> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
    <circle cx="12" cy="12" r="1.5" />
    <ellipse cx="12" cy="12" rx="10" ry="4.5" />
    <ellipse cx="12" cy="12" rx="4.5" ry="10" transform="rotate(60 12 12)" />
    <ellipse cx="12" cy="12" rx="4.5" ry="10" transform="rotate(-60 12 12)" />
  </svg>
);

export const ChemistryIcon: React.FC<{ className?: string }> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
    <path d="M9 3h6M10 3v6.26a8 8 0 104 0V3" />
    <path d="M6 17h12M7 21h10" />
  </svg>
);

export const BiologyIcon: React.FC<{ className?: string }> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4m0 0c-2 0-3 1-4 2s-2 3-2 4 1 2 2 3 2 1 4 1m0-10c2 0 3 1 4 2s2 3 2 4-1 2-2 3-2 1-4 1m0 0v6" />
  </svg>
);

export const PakistanStudiesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L9 8h6l-3-6zM7 9h10l2 13H5l2-13z" />
    </svg>
);

export const EnglishIcon: React.FC<{ className?: string }> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h8a3 3 0 013 3v13H3V4zM21 4h-8a3 3 0 00-3 3v13h11V4z" />
  </svg>
);

export const UrduIcon: React.FC<{ className?: string }> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
    <rect x="3" y="4" width="18" height="3" rx="0.5" />
    <rect x="3" y="9" width="18" height="3" rx="0.5" />
    <rect x="3" y="14" width="18" height="3" rx="0.5" />
  </svg>
);

export const HistoryIcon: React.FC<{ className?: string }> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 000 1.5v16.5a.75.75 0 000 1.5h15a.75.75 0 000-1.5V3.75a.75.75 0 000-1.5h-15zM9 6a.75.75 0 000 1.5h6a.75.75 0 000-1.5H9zm-1.5 2.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zM9 10.5a.75.75 0 000 1.5h6a.75.75 0 000-1.5H9zm-1.5 2.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zM9 15a.75.75 0 000 1.5h6a.75.75 0 000-1.5H9z" clipRule="evenodd" />
    </svg>
);

export const ComputerScienceIcon: React.FC<{ className?: string }> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm14.25 6a.75.75 0 01-.22.53l-2.25 2.25a.75.75 0 11-1.06-1.06L15.44 12l-1.72-1.72a.75.75 0 111.06-1.06l2.25 2.25c.141.14.22.331.22.53zM9.28 14.28a.75.75 0 001.06-1.06L8.56 12l1.72-1.72a.75.75 0 10-1.06-1.06l-2.25 2.25a.75.75 0 000 1.06l2.25 2.25z" clipRule="evenodd" />
    </svg>
);

export const GeographyIcon: React.FC<{ className?: string }> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z" />
        <path fillRule="evenodd" d="M.75 12a11.25 11.25 0 0111.25-11.25A11.25 11.25 0 0123.25 12c0 5.68-4.158 10.407-9.563 11.185a.75.75 0 01-.874-.729V18.5a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75v3.956a.75.75 0 01-.874.73C4.908 22.407.75 17.68.75 12zM12 16.5a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
    </svg>
);

export const QuizIcon: React.FC<{ className?: string }> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2.25c-5.23 0-9.75 3.033-9.75 6.75s4.52 6.75 9.75 6.75c.99 0 1.95-.12 2.85-.345-.195.421-.3.882-.3 1.345 0 1.388.941 2.565 2.25 2.872v.528H4.5a.75.75 0 000 1.5h15a.75.75 0 000-1.5h-.938a3.001 3.001 0 00-2.812-2.872 2.992 2.992 0 00-1.8-1.345c.12-.9.18-1.821.18-2.755C21.75 5.283 17.23 2.25 12 2.25z" />
        <path d="M15.75 21.75a3.75 3.75 0 003.75-3.75V16.5a.75.75 0 00-1.5 0v1.5a2.25 2.25 0 01-2.25 2.25h-1.5a.75.75 0 000 1.5h1.5z" />
    </svg>
);

export const CheckIcon: React.FC<{ className?: string }> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

export const XIcon: React.FC<{ className?: string }> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const TrashIcon: React.FC<{ className?: string }> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);