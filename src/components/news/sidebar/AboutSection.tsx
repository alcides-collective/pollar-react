import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { tabContentAnimation } from "@/lib/animations";

const tabs = [
  {
    id: "truth",
    label: "Rzetelność",
    title: "Informacja powinna służyć zrozumieniu, nie zyskowi.",
    content:
      "Skupiamy się na rzetelnej informacji, nie na wzbudzaniu emocji. Unikamy sensacyjności i nadmiaru bodźców, stawiając na kontekst, klarowność i użyteczność dla czytelnika.",
  },
  {
    id: "quality",
    label: "Jakość",
    title: "Wierzymy w jakość ponad ilość.",
    content:
      "Zamiast walczyć o kliki, walczymy o jasność. Zamiast wzmacniać szum, destylujemy sygnał. Grupujemy powiązane historie, eliminujemy duplikaty i prezentujemy różne perspektywy bez uprzedzeń redakcyjnych.",
  },
  {
    id: "respect",
    label: "Szacunek",
    title: "Każda historia zasługuje na kontekst. Każdy czytelnik zasługuje na szacunek.",
    content:
      "Każda chwila spędzona tutaj powinna pozostawić cię bardziej świadomym, nie bardziej zaniepokojonym. Budujemy narzędzia dla myślących ludzi, którzy chcą rozumieć swój świat.",
  },
];

export function AboutSection() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const activeContent = tabs.find((tab) => tab.id === activeTab)!;

  return (
    <div className="p-6">
      <h3 className="text-zinc-900 font-semibold mb-4">Manifest</h3>

      {/* Tabs */}
      <div className="flex justify-center border-b border-zinc-200 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative text-sm px-4 py-2 transition-colors ${
              activeTab === tab.id
                ? "text-zinc-900 font-medium"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="manifestTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900"
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div layout transition={{ duration: 0.3, ease: "easeInOut" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabContentAnimation}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-2"
          >
            <p className="text-zinc-900 font-semibold text-sm">
              {activeContent.title}
            </p>
            <p className="text-sm text-zinc-600 leading-relaxed">
              {activeContent.content}
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
