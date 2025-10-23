import React from 'react';
import type { Subject } from './types';
import { 
    MathIcon, 
    PhysicsIcon, 
    ChemistryIcon, 
    BiologyIcon, 
    PakistanStudiesIcon, 
    EnglishIcon, 
    UrduIcon, 
    HistoryIcon, 
    ComputerScienceIcon 
} from './components/icons';


export const SUBJECTS: Subject[] = [
  {
    id: 'mathematics',
    name: 'Mathematics',
    description: 'Algebra, geometry, calculus and problem-solving',
    Icon: MathIcon,
    gradient: 'from-blue-500 to-sky-400',
    systemPrompt: 'You are JLX — Mathematics Expert of JLHS. Be clear, encouraging, and show steps with LaTeX formatting. Use markdown for formatting.',
    quickQuestions: ['Explain the Pythagorean theorem.', 'How do I solve a quadratic equation?', 'What are derivatives?', 'What is the value of Pi?'],
    quotes: ["The only way to learn mathematics is to do mathematics.", "Mathematics is the language in which God has written the universe."],
    demoResponse: "Of course! The Pythagorean theorem is a fundamental principle in geometry. It states that for any right-angled triangle, the square of the length of the hypotenuse (the side opposite the right angle) is equal to the sum of the squares of the lengths of the other two sides. This is expressed as the formula: $$a^2 + b^2 = c^2$$"
  },
  {
    id: 'physics',
    name: 'Physics',
    description: 'Laws of motion, energy, and the physical universe',
    Icon: PhysicsIcon,
    gradient: 'from-purple-500 to-violet-400',
    systemPrompt: 'You are JLX — Physics Expert for JLHS. Focus on explaining laws, formulas, and experiments. Use LaTeX for mathematical formulas and markdown for general formatting.',
    quickQuestions: ["Explain Newton's first law of motion.", "What is the theory of relativity?", "Define kinetic energy.", "How does gravity work?"],
    quotes: ["The important thing is not to stop questioning.", "Look deep into nature, and then you will understand everything better."],
    demoResponse: "Newton's First Law of Motion, also known as the law of inertia, states that an object will remain at rest or in uniform motion in a straight line unless acted upon by an external force. This means things tend to keep doing what they're already doing!"
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    description: 'Elements, reactions, and molecular science',
    Icon: ChemistryIcon,
    gradient: 'from-emerald-500 to-green-400',
    systemPrompt: 'You are JLX — Chemistry Expert for JLHS. Provide balanced equations and safe lab tips. Use markdown for formatting.',
    quickQuestions: ["What is a covalent bond?", "How do you balance a chemical equation?", "Describe the periodic table.", "What is pH?"],
    quotes: ["Chemistry is the study of matter, but I prefer to see it as the study of change.", "Every aspect of the world today... is affected by chemistry."],
    demoResponse: "A covalent bond is a chemical bond that involves the sharing of electron pairs between atoms. These shared pairs are known as shared pairs or bonding pairs, and the stable balance of attractive and repulsive forces between atoms when they share electrons is known as covalent bonding."
  },
  {
    id: 'biology',
    name: 'Biology',
    description: 'Life sciences, cells, and living organisms',
    Icon: BiologyIcon,
    gradient: 'from-rose-500 to-pink-400',
    systemPrompt: 'You are JLX — Biology Expert for JLHS. Use simple explanations, diagrams (ASCII if needed), and mnemonics. Use markdown for formatting.',
    quickQuestions: ["What is photosynthesis?", "Explain DNA replication.", "What are the parts of a cell?", "Describe the human circulatory system."],
    quotes: ["The good thing about science is that it's true whether or not you believe in it.", "In all things of nature there is something of the marvelous."],
    demoResponse: "Photosynthesis is the process used by plants, algae, and certain bacteria to harness energy from sunlight and turn it into chemical energy. Here's a simple formula:\n\n`6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂`"
  },
  {
    id: 'pakistan-studies',
    name: 'Pakistan Studies',
    description: 'History, culture, and civics of Pakistan',
    Icon: PakistanStudiesIcon,
    gradient: 'from-green-600 to-emerald-500',
    systemPrompt: 'You are JLX — Pakistan Studies Expert for JLHS. Provide factual, unbiased summaries. Use markdown for formatting.',
    quickQuestions: ["Who was the first Governor-General of Pakistan?", "What is the significance of the Lahore Resolution?", "Describe the geography of northern Pakistan.", "What are some major cultural festivals?"],
    quotes: ["There is no power on earth that can undo Pakistan.", "Think 100 times before you take a decision, But once that decision is taken, stand by it as one man."],
    demoResponse: "The first Governor-General of Pakistan was Muhammad Ali Jinnah. He was a key figure in the Pakistan Movement and is revered as the nation's founder, or *Quaid-i-Azam* (Great Leader)."
  },
  {
    id: 'english',
    name: 'English',
    description: 'Grammar, literature, and communication skills',
    Icon: EnglishIcon,
    gradient: 'from-indigo-500 to-purple-400',
    systemPrompt: 'You are JLX — English Expert for JLHS. Help with grammar, writing, and literature. Use markdown for formatting.',
    quickQuestions: ["What is the difference between 'its' and 'it's'?", "Can you explain what a metaphor is?", "Who wrote 'Hamlet'?", "How can I improve my essay writing?"],
    quotes: ["A word after a word after a word is power.", "The limits of my language mean the limits of my world."],
    demoResponse: "Great question! Here's the difference:\n\n*   **It's** is a contraction for 'it is' or 'it has'. (e.g., *It's* a beautiful day.)\n*   **Its** is a possessive pronoun that means 'belonging to it'. (e.g., The dog wagged *its* tail.)"
  },
  {
    id: 'urdu',
    name: 'Urdu',
    description: 'Language, poetry, and prose analysis',
    Icon: UrduIcon,
    gradient: 'from-teal-500 to-cyan-400',
    systemPrompt: "You are JLX — Urdu Expert for JLHS. You must conduct this entire conversation in the Urdu language. Do not use any English words or Roman Urdu. All of your responses must be in pure Urdu script. Provide help with translation, grammar, poetry, and prose. آپ کو تمام جوابات صرف اور صرف اردو زبان میں دینے ہیں۔",
    quickQuestions: ["'خوش آمدید' کا مطلب کیا ہے؟", "علامہ اقبال کون تھے؟", "غزل کی تشریح کریں۔", "لفظ 'محبت' کے مترادفات کیا ہیں؟"],
    quotes: ["Urdu is a language of poetry and love.", "He who knows no foreign languages knows nothing of his own."],
    demoResponse: "خوش آمدید' کا مطلب ہے 'Welcome'۔ یہ کسی کو خوش دلی سے استقبال کرنے کے لیے استعمال ہوتا ہے۔"
  },
  {
    id: 'history',
    name: 'History',
    description: 'World events, timelines, and civilizations',
    Icon: HistoryIcon,
    gradient: 'from-amber-600 to-yellow-500',
    systemPrompt: 'You are JLX — History Expert for JLHS. Explain events with timelines and short summaries. Use markdown for formatting.',
    quickQuestions: ["What were the main causes of World War I?", "Who was Alexander the Great?", "Describe the Indus Valley Civilization.", "What was the Renaissance?"],
    quotes: ["Those who do not remember the past are condemned to repeat it.", "History is a set of lies agreed upon."],
    demoResponse: "The main causes of World War I are often summarized by the acronym M.A.I.N.:\n\n*   **Militarism**: The build-up of armies and weapons.\n*   **Alliances**: Complex agreements between nations.\n*   **Imperialism**: Competition for colonies and resources.\n*   **Nationalism**: Intense pride and rivalry between nations."
  },
  {
    id: 'computer-science',
    name: 'Computer Science',
    description: 'Algorithms, data structures, and programming',
    Icon: ComputerScienceIcon,
    gradient: 'from-fuchsia-500 to-pink-500',
    systemPrompt: 'You are JLX — Computer Science Expert for JLHS. Explain concepts clearly, provide code examples in Python or JavaScript, and discuss algorithms and data structures. Use markdown for formatting.',
    quickQuestions: ["What is an algorithm?", "Explain Big O notation.", "What's the difference between an array and a linked list?", "How does the internet work?"],
    quotes: ["Talk is cheap. Show me the code.", "The computer was born to solve problems that did not exist before."],
    demoResponse: "An algorithm is a set of step-by-step instructions for solving a problem or accomplishing a task. For example, a simple algorithm for making tea would be:\n\n1.  Boil water.\n2.  Place a tea bag in a cup.\n3.  Pour boiled water into the cup.\n4.  Wait 3-5 minutes.\n5.  Remove the tea bag."
  },
];
