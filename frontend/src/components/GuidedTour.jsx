import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

const STEPS = [
    {
        title: 'Welcome to MAGEAM',
        description: 'Your AI-powered maintenance management system. Let us show you around in 60 seconds.',
        target: null, // no highlight, just overlay
        position: 'center',
    },
    {
        title: 'Plant Selector',
        description: 'Switch between plants here. Each plant has its own data, KPIs, and team.',
        target: '[data-tour="plant-selector"]',
        position: 'bottom',
    },
    {
        title: 'View Mode',
        description: 'Toggle between Executive View (strategic KPIs) and Tactical Operations View (detailed metrics).',
        target: '[data-tour="view-toggle"]',
        position: 'bottom',
    },
    {
        title: 'Sidebar Navigation',
        description: 'All modules are here: Dashboard, Work Management, Scheduling, Execution, Analytics, Reports, and more.',
        target: '[data-tour="sidebar"]',
        position: 'right',
    },
    {
        title: 'AI Agents (CORTEX)',
        description: '33 AI agents help you with predictive health, equipment diagnostics, safety checklists, and more.',
        target: '[data-tour="ai-agents"]',
        position: 'right',
    },
    {
        title: 'You\'re All Set!',
        description: 'Explore the platform freely. Use the Feedback button (bottom-left) to share your thoughts.',
        target: null,
        position: 'center',
    },
];

export default function GuidedTour({ onComplete }) {
    const [step, setStep] = useState(0);
    const [visible, setVisible] = useState(false);

    const current = STEPS[step];
    const isFirst = step === 0;
    const isLast = step === STEPS.length - 1;

    useEffect(() => {
        const seen = localStorage.getItem('ams_tour_completed');
        if (!seen) {
            const timer = setTimeout(() => setVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    // Highlight target element
    useEffect(() => {
        if (!visible || !current.target) return;
        const el = document.querySelector(current.target);
        if (el) {
            el.style.position = 'relative';
            el.style.zIndex = '10001';
            el.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.5), 0 0 20px rgba(16, 185, 129, 0.2)';
            el.style.borderRadius = '12px';
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return () => {
                el.style.zIndex = '';
                el.style.boxShadow = '';
                el.style.borderRadius = '';
            };
        }
    }, [visible, step, current.target]);

    if (!visible) return null;

    const handleClose = () => {
        localStorage.setItem('ams_tour_completed', 'true');
        setVisible(false);
        onComplete?.();
    };

    const handleNext = () => {
        if (isLast) handleClose();
        else setStep(s => s + 1);
    };

    const handlePrev = () => {
        if (!isFirst) setStep(s => s - 1);
    };

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/50 z-[10000] transition-opacity" onClick={handleClose} />

            {/* Tour Card */}
            <div className={`fixed z-[10002] transition-all duration-300 ${
                current.position === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' :
                'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
            }`}>
                <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-[90vw] border border-gray-100">
                    {/* Progress */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-emerald-500" />
                            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Quick Tour</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{step + 1} / {STEPS.length}</span>
                            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1 bg-gray-100 rounded-full mb-5">
                        <div
                            className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                        />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{current.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-6">{current.description}</p>

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleClose}
                            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            Skip tour
                        </button>
                        <div className="flex items-center gap-2">
                            {!isFirst && (
                                <button
                                    onClick={handlePrev}
                                    className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Back
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className="px-5 py-2 text-sm font-medium bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-lg hover:from-emerald-700 hover:to-teal-600 transition-all shadow-sm flex items-center gap-1"
                            >
                                {isLast ? 'Get Started' : 'Next'} {!isLast && <ChevronRight className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
