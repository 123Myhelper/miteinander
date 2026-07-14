"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

export default function TargetGroupsSection() {
  const { t } = useTranslation();

  const targetGroups = [
    {
      id: 1,
      title: t("targetGroups.card1Title"),
      items: [
        t("targetGroups.card1Item1"),
        t("targetGroups.card1Item2"),
        t("targetGroups.card1Item3"),
        t("targetGroups.card1Cancellation"),
      ],
      price: t("targetGroups.card1Price"),
      priceValue: t("targetGroups.card1PriceValue"),
      recommendationTitle: t("targetGroups.noteTitle"),
      recommendations: [
        t("targetGroups.recommendation1"),
        t("targetGroups.recommendation2"),
      ],
    },
    {
      id: 2,
      title: t("targetGroups.card2Title"),
      items: [
        t("targetGroups.card2Item1"),
        t("targetGroups.card2Item2"),
        t("targetGroups.card2Item3"),
        t("targetGroups.card2Cancellation"),
      ],
      price: t("targetGroups.card2Price"),
      priceValue: t("targetGroups.card2PriceValue"),
      recommendationTitle: t("targetGroups.recommendationTitle"),
      recommendations: [
        t("targetGroups.recommendation1"),
        t("targetGroups.recommendation2"),
      ],
    },
  ];

  return (
    <section id="target-groups" className="py-24 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-16 md:mb-24"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-primary mt-4 mb-6">
            {t("targetGroups.title")}
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            {t("targetGroups.subtitle")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {targetGroups.map((group, index) => (
            <motion.div
              key={group.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 p-8 h-full flex flex-col min-w-0"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-2xl font-serif text-primary mb-4 break-words">
                {group.title}
              </h3>
              <ul className="flex flex-1 flex-col gap-4 pb-8">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 min-w-0">
                    <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
                      <Check className="w-4 h-4 text-accent" aria-hidden="true" />
                    </span>
                    <span className="text-muted leading-relaxed break-words min-w-0">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mb-6">
                <p className="text-sm font-semibold text-primary mb-3 break-words">
                  {group.recommendationTitle}
                </p>
                <ul className="flex flex-col gap-2">
                  {group.recommendations.map((rec) => (
                    <li key={rec} className="flex items-start gap-2 min-w-0">
                      <span className="shrink-0 mt-[7px] w-1.5 h-1.5 rounded-full bg-accent" aria-hidden="true" />
                      <span className="text-sm text-muted leading-relaxed break-words min-w-0">
                        {rec}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-accent/20 bg-accent/10 px-6 py-5 text-center">
                <p className="text-sm font-medium text-primary/75 break-words">
                  {group.price}
                </p>
                <p className="mt-2 font-serif text-3xl md:text-4xl font-semibold text-primary break-words">
                  {group.priceValue}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
