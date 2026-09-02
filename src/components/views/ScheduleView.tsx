import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { ScheduleItem } from '../../types';
import { Calendar, Plus, Trash2, Clock, DoorOpen, User } from 'lucide-react';

interface ScheduleViewProps {
  onOpenAddSchedule: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ onOpenAddSchedule }) => {
  const { schedule, classes, deleteScheduleItem, selectedClassId, setSelectedClassId } = useSchool();

  const currentClassId = selectedClassId === 'all' ? classes[0]?.id || 'cls-1' : selectedClassId;
  const currentClass = classes.find((c) => c.id === currentClassId);

  const days: ('Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi')[] = [
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
  ];

  const classSchedule = schedule.filter((s) => s.classId === currentClassId);

  return (
    <div className="space-y-6">
      {/* Top filter & action */}
      <div className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Classe :
          </label>
          <select
            value={currentClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3.5 py-2 bg-white/80 border border-teal-900/10 rounded-xl text-sm text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#00818c]/30"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <button
          id="btn-add-schedule"
          onClick={onOpenAddSchedule}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00818c] hover:bg-[#006e77] text-white rounded-xl font-bold text-sm shadow-md shadow-teal-800/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Créneau</span>
        </button>
      </div>

      {/* 5-Day Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {days.map((day) => {
          const dayItems = classSchedule
            .filter((item) => item.dayOfWeek === day)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div key={day} className="glass-card rounded-2xl p-4 border border-white/80 flex flex-col min-h-[400px]">
              {/* Day Header */}
              <div className="pb-3 mb-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-sm font-heading">{day}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-50 text-[#00818c] rounded-full">
                  {dayItems.length} cours
                </span>
              </div>

              {/* Schedule cards list */}
              <div className="space-y-3 flex-1">
                {dayItems.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-xs text-gray-400 italic">
                    Aucun cours programmé
                  </div>
                ) : (
                  dayItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-white/80 hover:bg-white border border-teal-900/10 shadow-xs hover:shadow-md transition-all group relative"
                    >
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer le cours de ${item.subjectName} le ${item.dayOfWeek} ?`)) {
                            deleteScheduleItem(item.id);
                          }
                        }}
                        className="absolute top-2 right-2 text-gray-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1.5 text-teal-800 text-xs font-bold mb-1">
                        <Clock className="w-3 h-3 text-[#00818c]" />
                        <span>
                          {item.startTime} - {item.endTime}
                        </span>
                      </div>

                      <h4 className="font-bold text-gray-900 text-xs leading-snug">
                        {item.subjectName}
                      </h4>

                      <div className="mt-2.5 pt-2 border-t border-gray-100 space-y-1 text-[11px] text-gray-500">
                        <p className="flex items-center gap-1.5 truncate">
                          <DoorOpen className="w-3 h-3 text-gray-400 shrink-0" />
                          <span>{item.room}</span>
                        </p>
                        <p className="flex items-center gap-1.5 truncate">
                          <User className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="truncate">{item.teacherName}</span>
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
