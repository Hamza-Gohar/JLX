
import React from 'react';
import { Link } from 'react-router-dom';
import type { Subject } from '../types';
import { ArrowRightIcon } from './icons';

interface SubjectCardProps {
  subject: Subject;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject }) => {
  const { id, name, description, Icon, gradient } = subject;

  return (
    <Link 
      to={`/subject/${id}`} 
      className="group relative block p-6 sm:p-8 rounded-2xl bg-slate-800/50 border border-slate-700/80 
                 hover:border-slate-600 
                 transition-all duration-300 ease-in-out 
                 transform hover:-translate-y-2 hover:scale-[1.03]
                 text-center overflow-hidden"
    >
      <div className="absolute top-5 right-5 p-2 bg-slate-700/50 rounded-full
                      opacity-0 group-hover:opacity-100
                      transform scale-90 group-hover:scale-100
                      transition-all duration-300 ease-in-out">
        <ArrowRightIcon className="w-5 h-5 text-white" />
      </div>

      <div 
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 
                   transition-opacity duration-300 ease-in-out blur-2xl -z-10`}
      />

      <div className="relative z-10 flex flex-col items-center">
        <div className={`flex items-center justify-center w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl mb-5 shadow-lg`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">{name}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </Link>
  );
};

export default SubjectCard;
