import React from 'react';
import { SUBJECTS } from '../constants';
import SubjectCard from './SubjectCard';

const SubjectGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {SUBJECTS.map((subject) => (
        <SubjectCard key={subject.id} subject={subject} />
      ))}
    </div>
  );
};

export default SubjectGrid;
