import React from 'react';
import ScrollableTimePicker from './ScrollableTimePicker';
import './TimePickerContainer.css';

const TimePickerContainer = ({ 
  fightMinutes, 
  fightSeconds, 
  restMinutes, 
  restSeconds,
  onFightTimeChange,
  onRestTimeChange,
  maxMinutes = 59,
  maxSeconds = 59 
}) => {
  return (
    <div className="time-picker-container">
      <ScrollableTimePicker
        label="FIGHT TIME"
        initialMinutes={fightMinutes}
        initialSeconds={fightSeconds}
        onTimeChange={onFightTimeChange}
        maxMinutes={maxMinutes}
        maxSeconds={maxSeconds}
      />
      
      <ScrollableTimePicker
        label="REST TIME"
        initialMinutes={restMinutes}
        initialSeconds={restSeconds}
        onTimeChange={onRestTimeChange}
        maxMinutes={maxMinutes}
        maxSeconds={maxSeconds}
      />
    </div>
  );
};

export default TimePickerContainer;
