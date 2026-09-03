import React, { useState } from 'react';
import { ShieldCheck, Clock, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import type { PDFTool } from '../../types/tools';

interface Props {
  tool: PDFTool;
}

export default function ComingSoonTool({ tool }: Props) {
  const [notified, setNotified] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setNotified(true);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-6 sm:py-8">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-12 text-center shadow-xs">
        <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center">
          <Clock className="w-6 h-6 text-neutral-900 dark:text-neutral-100" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/20 text-xs font-mono font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Roadmap Feature • In Development
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">
          {tool.name} is Coming Soon
        </h2>

        <p className="mt-3 text-sm text-neutral-700 dark:text-neutral-300 max-w-md mx-auto leading-relaxed">
          {tool.description}
        </p>

        {/* Why it's taking time note */}
        <div className="mt-6 p-4 sm:p-5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-left text-xs text-neutral-700 dark:text-neutral-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-neutral-950 dark:text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Why isn't this tool available yet?</span>
          </div>
          <p className="leading-relaxed">
            Unlike competing sites that upload your confidential files to remote servers, our engineering requirement is <strong>100% client-side execution</strong> in your browser. We are currently testing WebAssembly modules to process this format locally with zero security risks.
          </p>
        </div>

        {/* Feature roadmap */}
        {tool.features && tool.features.length > 0 && (
          <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800">
            <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-3">
              Planned Capabilities
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {tool.features.map((feat, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-medium flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  {feat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notify me */}
        <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
          {notified ? (
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
              ✓ Thanks! We'll notify you when {tool.name} launches.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="Enter email for launch notification"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 min-h-[44px] px-4 py-2 rounded-full text-xs bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
              />
              <button
                type="submit"
                className="min-h-[44px] px-6 py-2 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-xs shrink-0"
              >
                Notify Me
              </button>
            </form>
          )}
        </div>

        {/* Link back to active flagship */}
        <div className="mt-8">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
          >
            Explore available active tools <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
