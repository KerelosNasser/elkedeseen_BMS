"use client";

import { useState, useEffect, useRef } from "react";
import { UserSearchResult } from "@/actions/booking.actions";
import { searchAttendees } from "@/actions/booking.actions";
import { X, Search, Loader2 } from "lucide-react";

interface AttendeeSelectorProps {
  value: UserSearchResult[]; // currently selected users
  onChange: (users: UserSearchResult[]) => void;
  currentUserId: string; // auto-included, not removable
  currentUserName: string;
}

export default function AttendeeSelector({ value, onChange, currentUserId, currentUserName }: AttendeeSelectorProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        const users = await searchAttendees(query);
        setResults(users);
        setIsOpen(true);
        setLoading(false);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  const handleSelect = (user: UserSearchResult) => {
    if (!value.find((u) => u.id === user.id)) {
      onChange([...value, user]);
    }
    setQuery("");
    setIsOpen(false);
  };

  const handleRemove = (userId: string) => {
    if (userId === currentUserId) return; // Cannot remove self
    onChange(value.filter((u) => u.id !== userId));
  };

  return (
    <div className="w-full relative" dir="rtl" ref={dropdownRef}>
      <label className="form-label block mb-2">المشاركون</label>

      <div className="flex flex-wrap gap-2 mb-3">
        <div className="flex items-center gap-2 bg-church-bg-warm px-3 py-1.5 rounded-full border border-church-border">
          <div className="w-6 h-6 rounded-full bg-church-gold-light/60 flex items-center justify-center text-church-gold-dark font-body font-bold text-xs shrink-0">
            {currentUserName.charAt(0)}
          </div>
          <span className="text-sm font-body text-church-text font-bold">{currentUserName} (أنت)</span>
        </div>

        {value.filter((u) => u.id !== currentUserId).map((user) => (
          <div key={user.id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-church-border-light shadow-sm">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-body font-bold text-xs shrink-0">
              {user.name.charAt(0)}
            </div>
            <span className="text-sm font-body text-church-text-muted">{user.name}</span>
            <button
              type="button"
              onClick={() => handleRemove(user.id)}
              className="text-gray-400 hover:text-church-red transition-colors focus:outline-none ml-[-4px]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-church-text-light">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث بالاسم لإضافة مشاركين..."
          className="form-input w-full pr-10"
          onFocus={() => { if (results.length > 0) setIsOpen(true) }}
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-church-border-light rounded-lg soft-shadow-md max-h-[200px] overflow-y-auto church-scroll">
          {results.map((user) => {
            const isSelected = value.some((u) => u.id === user.id) || user.id === currentUserId;
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => handleSelect(user)}
                disabled={isSelected}
                className={`w-full flex items-center gap-3 p-3 text-right hover:bg-church-bg-warm transition-colors border-b border-church-border-light/50 last:border-b-0
                  ${isSelected ? "opacity-50 cursor-not-allowed bg-gray-50" : "cursor-pointer"}
                `}
              >
                <div className="w-8 h-8 rounded-full bg-church-gold-light/40 flex items-center justify-center text-church-gold-dark font-body font-bold shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-body font-semibold text-sm text-church-text truncate">
                    {user.name} 
                    {isSelected && <span className="text-emerald-600 text-xs mr-2">(مضاف)</span>}
                  </div>
                </div>
                <div className={`badge ${user.role === 'admin' ? "bg-church-gold-light/20 text-church-gold-dark border border-church-gold/30" : "bg-gray-100 text-gray-500"}`}>
                  {user.role === 'admin' ? "مسؤول" : "مستخدم"}
                </div>
              </button>
            );
          })}
        </div>
      )}
      
      {value.map((user) => (
        <input key={user.id} type="hidden" name="attendeeIds" value={user.id} />
      ))}
      <input type="hidden" name="attendeeIds" value={currentUserId} />
    </div>
  );
}
