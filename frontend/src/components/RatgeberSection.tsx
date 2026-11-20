"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Compass, Scale, type LucideIcon } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import {
  localizedPath,
  type AuthorityPagePath,
} from "@/lib/i18n/authority-pages";

interface GuideCard {
  key: "finden" | "pflegedienst";
  path: AuthorityPagePath;
  icon: LucideIcon;
}

// Links to the editorial guides in the visitor's current language. Paths come
// from the shared authority-page list, so a guide renamed or added there cannot
// be linked inconsistently here.
const guides: GuideCard[] = [
  { key: "finden", path: "/alltagsbegleitung-finden", icon: Compass },
  {
    key: "pflegedienst",
    path: "/alltagsbegleitung-oder-pflegedienst",
    icon: Scale,
  },
];

export default function RatgeberSection() {
  const { locale, t } = useTranslation();

  return (
    <section
      id="ratgeber"
      aria-labelledby="ratgeber-heading"
      className="py-24 md:py-32 bg-background"
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-accent text-sm tracking-[0.2em] uppercase font-medium">
            {t("ratgeber.badge")}
          </span>
          <h2
            id="ratgeber-heading"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-primary mt-4 mb-6 break-words"
          >
            {t("ratgeber.title")}
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            {t("ratgeber.intro")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {guides.map(({ key, path, icon: Icon }, index) => {
            const titleId = `ratgeber-${key}-title`;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                <Link
                  href={localizedPath(locale, path)}
                  hrefLang={locale}
                  aria-labelledby={titleId}
                  className="group flex h-full flex-col rounded-3xl border border-primary/10 bg-white p-8 md:p-10 shadow-sm transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                >
                  <span
                    aria-hidden="true"
                    className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3
                    id={titleId}
                    className="font-serif text-2xl md:text-3xl text-primary mb-3 break-words"
                  >
                    {t(`ratgeber.${key}Title`)}
                  </h3>
                  <p className="text-muted text-base md:text-lg leading-relaxed mb-8">
                    {t(`ratgeber.${key}Desc`)}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-2 font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4">
                    {t(`ratgeber.${key}Cta`)}
                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4 text-accent transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
