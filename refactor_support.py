import os
import re

file_path = "/home/nasaire/Projet Ecole/frontend-web/src/pages/Support.tsx"

with open(file_path, "r") as f:
    content = f.read()

# Add ChevronDown to imports
content = content.replace("ChevronRight, PlayCircle,", "ChevronRight, ChevronDown, PlayCircle,")

# Add isMobileMenuOpen state
state_str = "    const [activeTab, setActiveTab] = useState('getting-started');"
new_state_str = "    const [activeTab, setActiveTab] = useState('getting-started');\n    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);\n"
content = content.replace(state_str, new_state_str)

# Replace the <nav> section with mobile dropdown + desktop nav
old_nav = """                            <nav className="flex xl:flex-col overflow-x-auto xl:overflow-x-visible gap-3 pb-4 xl:pb-0 scrollbar-hide">
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <button key={item.id} onClick={() => setActiveTab(item.id)}
                                            className={`flex-shrink-0 xl:w-full group flex items-start gap-4 p-4 md:p-5 ] font-bold transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl scale-[1.02]' : 'text-slate-700 bg-white   hover:bg-slate-50'}`}>
                                            <Icon size={20} className={activeTab === item.id ? 'text-white' : 'text-blue-600'} />
                                            <div className="text-left flex-1 min-w-[120px] md:min-w-0">
                                                <div className="text-sm md:text-lg whitespace-nowrap xl:whitespace-normal">{item.label}</div>
                                                <div className={`text-xs ${activeTab === item.id ? 'text-blue-100' : 'text-slate-400'} hidden md:block`}>{item.desc}</div>
                                            </div>
                                            <ChevronRight size={18} className={`hidden xl:block ${activeTab === item.id ? 'text-white' : 'text-slate-300'}`} />
                                        </button>
                                    );
                                })}
                            </nav>"""

active_item_logic = """
                            {(() => {
                                const activeItem = menuItems.find(m => m.id === activeTab) || menuItems[0];
                                const ActiveIcon = activeItem.icon;
                                return (
                                    <div className="xl:hidden relative z-50">
                                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="w-full flex items-center justify-between bg-blue-50 p-4 border border-blue-100 shadow-sm font-bold text-blue-900">
                                            <div className="flex items-center gap-3">
                                                <ActiveIcon className="text-blue-600" size={20} />
                                                <div className="text-left">
                                                    <div className="text-sm">{activeItem.label}</div>
                                                    <div className="text-[10px] text-slate-500 font-normal">{activeItem.desc}</div>
                                                </div>
                                            </div>
                                            <ChevronDown className={`transition-transform duration-300 shrink-0 ${isMobileMenuOpen ? 'rotate-180' : ''}`} size={20} />
                                        </button>
                                        <AnimatePresence>
                                            {isMobileMenuOpen && (
                                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full mt-1 left-0 w-full bg-white shadow-2xl z-50 flex flex-col border border-slate-100 max-h-[60vh] overflow-y-auto">
                                                    {menuItems.map(item => (
                                                        <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} className={`flex items-start gap-3 p-4 text-left hover:bg-slate-50 transition-colors ${activeTab === item.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 border-b border-slate-50 last:border-0'}`}>
                                                            <item.icon size={18} className={`mt-0.5 shrink-0 ${activeTab === item.id ? 'text-blue-600' : 'text-slate-400'}`} />
                                                            <div>
                                                                <div className="font-bold text-sm">{item.label}</div>
                                                                <div className="text-xs text-slate-400">{item.desc}</div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })()}

                            <nav className="hidden xl:flex flex-col gap-3">
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <button key={item.id} onClick={() => setActiveTab(item.id)}
                                            className={`w-full group flex items-start gap-4 p-5 font-bold transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl scale-[1.02]' : 'text-slate-700 bg-white hover:bg-slate-50'}`}>
                                            <Icon size={20} className={activeTab === item.id ? 'text-white' : 'text-blue-600'} />
                                            <div className="text-left flex-1 min-w-0">
                                                <div className="text-lg whitespace-normal">{item.label}</div>
                                                <div className={`text-xs ${activeTab === item.id ? 'text-blue-100' : 'text-slate-400'}`}>{item.desc}</div>
                                            </div>
                                            <ChevronRight size={18} className={activeTab === item.id ? 'text-white' : 'text-slate-300'} />
                                        </button>
                                    );
                                })}
                            </nav>
"""
content = content.replace(old_nav, active_item_logic)

# Responsive text sizes
# H1: text-4xl md:text-5xl font-black
content = content.replace('className="text-4xl md:text-5xl font-black', 'className="text-2xl md:text-4xl lg:text-5xl font-black')

# H2: text-3xl font-extrabold
content = content.replace('className="text-3xl font-extrabold', 'className="text-xl md:text-3xl font-extrabold')

# H3: text-2xl font-bold
content = content.replace('className="text-2xl font-bold', 'className="text-lg md:text-2xl font-bold')

# P: text-xl text-slate-500
content = content.replace('className="text-xl text-slate-500', 'className="text-sm md:text-xl text-slate-500')

# Div arrows: text-lg text-slate-600
content = content.replace('className="text-lg text-slate-600', 'className="text-sm md:text-lg text-slate-600')

# padding of white boxes: p-5
content = content.replace('gap-4 p-5 bg-white', 'gap-3 md:gap-4 p-3 md:p-5 bg-white')
content = content.replace('mt-1 shrink-0 w-8 h-8', 'mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8')

# The top title: text-4xl md:text-5xl xl:text-6xl
content = content.replace('className="text-4xl md:text-5xl xl:text-6xl font-black', 'className="text-3xl md:text-5xl xl:text-6xl font-black')

with open(file_path, "w") as f:
    f.write(content)

print("Done replacing.")
