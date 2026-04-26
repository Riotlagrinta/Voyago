"use client";

import React, { useState, useRef, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  date?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
}

export const DatePicker = ({ date, onChange, placeholder = "Sélectionner une date", className }: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(date ? new Date(date) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = date ? new Date(date) : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const renderHeader = () => (
    <div className="flex items-center justify-between px-4 py-2 border-b border-border">
      <span className="text-sm font-black capitalize text-slate-900">
        {format(currentMonth, "MMMM yyyy", { locale: fr })}
      </span>
      <div className="flex gap-1">
        <button 
          onClick={(e) => { e.preventDefault(); setCurrentMonth(subMonths(currentMonth, 1)); }}
          className="p-1.5 hover:bg-surface rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button 
          onClick={(e) => { e.preventDefault(); setCurrentMonth(addMonths(currentMonth, 1)); }}
          className="p-1.5 hover:bg-surface rounded-lg transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 gap-1 p-2">
        {days.map((day) => (
          <div key={day} className="text-[10px] font-black uppercase text-slate-400 text-center py-2">
            {day}
          </div>
        ))}
        {calendarDays.map((day, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.preventDefault();
              onChange(format(day, "yyyy-MM-dd"));
              setIsOpen(false);
            }}
            className={cn(
              "h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all",
              !isSameMonth(day, monthStart) ? "text-slate-200" : "text-slate-700 hover:bg-primary/10 hover:text-primary",
              selectedDate && isSameDay(day, selectedDate) ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110 z-10" : ""
            )}
          >
            {format(day, "d")}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
        className={cn(
          "flex h-14 w-full items-center gap-3 rounded-2xl bg-white px-4 text-left transition-all border border-transparent focus:ring-2 focus:ring-primary/20",
          isOpen ? "ring-2 ring-primary/20 border-primary/20 shadow-lg" : "hover:border-primary/20",
          className
        )}
      >
        <CalendarIcon className={cn("w-5 h-5 transition-colors", date ? "text-primary" : "text-slate-400")} />
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">Date de départ</span>
          <span className={cn("text-sm font-bold truncate", !date && "text-slate-400")}>
            {date ? format(new Date(date), "EEEE d MMMM yyyy", { locale: fr }) : placeholder}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-[100] w-72 bg-white rounded-[2rem] shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-left">
          {renderHeader()}
          {renderDays()}
          <div className="p-4 bg-surface border-t border-border flex justify-center">
             <button 
               onClick={(e) => { e.preventDefault(); onChange(format(new Date(), "yyyy-MM-dd")); setIsOpen(false); }}
               className="text-[10px] font-black uppercase text-primary hover:underline"
             >
               Aujourd'hui
             </button>
          </div>
        </div>
      )}
    </div>
  );
};
