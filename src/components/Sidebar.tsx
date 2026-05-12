/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Search, ChevronRight, Hash, Star, Layout, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { TOOLS, CATEGORIES } from '../constants';
import { Tool, ToolCategory } from '../types';
import * as Icons from 'lucide-react';

interface SidebarProps {
  onSelectTool: (tool: Tool) => void;
  activeToolId: string;
}

export default function Sidebar({ onSelectTool, activeToolId }: SidebarProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'All'>('All');

  const filteredTools = TOOLS.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) ||
                         tool.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName] || Icons.HelpCircle;
    return <IconComponent size={18} />;
  };

  return (
    <div className="w-72 h-screen bg-white border-r border-slate-200 flex flex-col flex-shrink-0 overflow-hidden">
      {/* Brand Header */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6 text-blue-600">
           <Icons.Image size={28} strokeWidth={2.5} />
           <h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">PixelForge</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search 100+ tools..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tools List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide space-y-6">
        {CATEGORIES.map(cat => {
          const catTools = filteredTools.filter(t => t.category === cat);
          if (catTools.length === 0 && activeCategory !== 'All') return null;
          
          return (
            <div key={cat} className="space-y-1">
              <h2 className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">{cat}</h2>
              {catTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => onSelectTool(tool)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-left ${
                    activeToolId === tool.id
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }`}
                >
                  <span className={activeToolId === tool.id ? 'text-blue-500' : 'text-slate-400 opacity-60'}>
                    {getIcon(tool.icon)}
                  </span>
                  <span className="text-sm truncate">{tool.name}</span>
                </button>
              ))}
            </div>
          );
        })}
        
        {filteredTools.length === 0 && (
          <div className="py-10 text-center text-slate-400">
            <Search size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">No tools found</p>
          </div>
        )}
      </div>

      {/* Footer / Info */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
        <span>v1.0.4 Secure Sandbox</span>
      </div>
    </div>
  );
}
