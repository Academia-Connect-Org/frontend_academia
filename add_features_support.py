import re

file_path = "/home/nasaire/Projet Ecole/frontend-web/src/pages/Support.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Add ArrowUp to imports if not there
if "ArrowUp" not in content:
    content = content.replace("ArrowRight,", "ArrowRight, ArrowUp,")

# Add useEffect to React import
content = re.sub(r"import React,\s*\{\s*useState\s*\}\s*from\s*'react';", "import React, { useState, useEffect } from 'react';", content)

# Add searchQuery and scroll state
state_search = """    const [activeTab, setActiveTab] = useState('getting-started');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showTopBtn, setShowTopBtn] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setShowTopBtn(true);
            } else {
                setShowTopBtn(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filteredMenuItems = menuItems.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
"""
content = content.replace(
    "    const [activeTab, setActiveTab] = useState('getting-started');\n    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);",
    state_search
)

# Update the input field
old_input = '<input type="text" placeholder="Rechercher une fonctionnalité..." className="w-full bg-transparent border-none text-white text-lg p-4 focus:outline-none" />'
new_input = '<input type="text" placeholder="Rechercher une fonctionnalité..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent border-none text-white text-lg p-4 focus:outline-none" />'
content = content.replace(old_input, new_input)

# Replace menuItems.map with filteredMenuItems.map
content = content.replace("menuItems.map(item =>", "filteredMenuItems.map(item =>")
content = content.replace("menuItems.map((item) =>", "filteredMenuItems.map((item) =>")

# Ensure if nothing matches, the desktop menu shows a message
no_results_desktop = """                            <nav className="hidden xl:flex flex-col gap-3">
                                {filteredMenuItems.length === 0 && (
                                    <div className="p-4 text-center text-slate-500 font-medium">Aucun résultat trouvé.</div>
                                )}
                                {filteredMenuItems.map((item) => {"""
content = content.replace("""                            <nav className="hidden xl:flex flex-col gap-3">
                                {filteredMenuItems.map((item) => {""", no_results_desktop)

# Add the scrollToTop button at the end of the root div
button_code = """
            <AnimatePresence>
                {showTopBtn && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        onClick={scrollToTop}
                        className="fixed bottom-8 right-8 z-50 p-4 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 hover:shadow-blue-500/50 transition-all group"
                        title="Remonter en haut"
                    >
                        <ArrowUp size={24} className="group-hover:-translate-y-1 transition-transform" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
"""
content = content.replace("        </div>\n    );\n};\n\nexport default Support;", button_code + "};\n\nexport default Support;")

with open(file_path, "w") as f:
    f.write(content)

print("Done.")
