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
        <p>{t("contact.goal")}</p>
      </div>

      <h4 className="text-content-heading font-semibold mb-2">{t("contact.feedback")}</h4>
      <p className="text-sm text-content leading-relaxed mb-3">
        {t("contact.feedbackText")}
      </p>
      <div className="flex flex-col gap-1">
        <a
          href="mailto:jakub@pollar.pl"
          className="text-sm text-content-heading hover:underline"
        >
          jakub@pollar.pl
        </a>
        <a
          href="mailto:bartosz@pollar.pl"
          className="text-sm text-content-heading hover:underline"
        >
          bartosz@pollar.pl
        </a>
      </div>
    </div>
  );
}
