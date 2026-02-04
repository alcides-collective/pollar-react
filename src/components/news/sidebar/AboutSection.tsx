import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { AnimateHeight } from "@/components/common/AnimateHeight";

const TAB_IDS = ["truth", "quality", "respect"] as const;

export function AboutSection() {
  const { t } = useTranslation("common");
  const [activeTab, setActiveTab] = useState<typeof TAB_IDS[number]>(TAB_IDS[0]);

  const tabs = TAB_IDS.map((id) => ({
    id,
    label: t(`about.tabs.${id}`),
    title: t(`about.${id}.title`),
    content: t(`about.${id}.content`),
  }));

  const activeContent = tabs.find((tab) => tab.id === activeTab)!;

  return (
    <div className="p-6">
      <h3 className="text-zinc-900 font-semibold mb-4">{t("about.manifest")}</h3>

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
      <AnimateHeight>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
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
      </AnimateHeight>
    </div>
  );
}
