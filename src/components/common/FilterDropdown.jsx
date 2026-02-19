import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function FilterDropdown({ label, options, value, onChange, counts = {} }) {
    return (
        <div className="relative group min-w-[140px]">
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full appearance-none bg-black/20 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-white text-sm font-medium outline-none focus:border-cyan-500 transition-all cursor-pointer hover:bg-white/5 active:bg-black/30"
                aria-label={label}
            >
                {options.map(opt => (
                    <option key={opt.key} value={opt.key} className="bg-primary-900 text-white py-1">
                        {opt.label} {counts[opt.key] !== undefined && opt.key !== 'ALL' ? `(${counts[opt.key]})` : ''}
                    </option>
                ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 pointer-events-none group-hover:text-cyan-400 transition-colors" />
        </div>
    );
}
