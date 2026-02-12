import { useTranslation } from "react-i18next";

export function ContactSection() {
  const { t } = useTranslation("common");

  return (
    <div className="p-6">
      <h3 className="text-content-heading font-semibold mb-4">{t("contact.title")}</h3>
      <div className="text-sm text-content leading-relaxed mb-6 space-y-3">
        <p>{t("contact.intro")}</p>
        <p>{t("contact.jakub")}</p>
        <p>{t("contact.bartosz")}</p>
        <p>{t("contact.ignacy")}</p>
        <p>{t("contact.goal")}</p>
      </div>

      <h4 className="text-content-heading font-semibold mb-2">{t("contact.feedback")}</h4>
      <p className="text-sm text-content leading-relaxed mb-3">
        {t("contact.feedbackText")}
      </p>
      <a
        href="mailto:contact@pollar.news"
        className="text-sm text-content-heading hover:underline"
      >
        contact@pollar.news
      </a>
    </div>
  );
}
