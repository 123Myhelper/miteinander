"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/context/LanguageContext";

export default function AppSection() {
  const { t } = useTranslation();

  return (
    <section id="app" className="py-24 md:py-32 bg-[#eae9e4] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              className="text-accent text-sm tracking-[0.2em] uppercase font-medium"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              {t("app.badge")}
            </motion.span>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-primary mt-4 mb-6">
              {t("app.title")}
            </h2>

            <p className="text-muted text-lg mb-8 leading-relaxed">
              {t("app.subtitle")}
            </p>

            {/* Features List */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              {[
                t("app.feature1"),
                t("app.feature2"),
                t("app.feature3"),
                t("app.feature4"),
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-2 text-primary/70"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span className="text-sm">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Phone Mockup */}
          <motion.div
            className="relative flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-10 bg-gradient-to-r from-accent/20 via-primary/10 to-accent/20 rounded-full blur-3xl opacity-50" />

              {/* Phone Frame */}
              <motion.div
                className="relative floating-phone"
                style={{ transformOrigin: "center center" }}
              >
                <div className="relative w-[280px] md:w-[320px] h-[580px] md:h-[640px] bg-[#1a1a1a] rounded-[3rem] p-3 shadow-2xl">
                  {/* Screen */}
                  <div className="w-full h-full bg-background rounded-[2.5rem] overflow-hidden relative">
                    {/* Status Bar */}
                    <div className="absolute top-0 left-0 right-0 h-12 bg-primary/10 flex items-center justify-center">
                      <div className="w-20 h-6 bg-[#1a1a1a] rounded-full" />
                    </div>

                    {/* App Content Preview */}
                    <div className="pt-16 px-6">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <p className="text-muted text-xs">Guten Tag,</p>
                          <p className="text-primary font-serif text-lg">
                            Maria
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                          <span className="text-accent font-serif">M</span>
                        </div>
                      </div>

                      {/* Search */}
                      <div className="glass rounded-2xl p-4 mb-6">
                        <p className="text-muted text-sm">
                          🔍 Alltagsbegleitung suchen...
                        </p>
                      </div>

                      {/* Cards */}
                      <p className="text-primary font-medium mb-3">
                        In Ihrer Nähe
                      </p>
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="glass rounded-2xl p-4 mb-3 flex items-center gap-3"
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/30 to-primary/30" />
                          <div className="flex-1">
                            <p className="text-primary text-sm font-medium">
                              {i === 1 ? "Thomas M." : "Peter K."}
                            </p>
                            <p className="text-muted text-xs">
                              {i === 1
                                ? "Alltagsbegleiter • 5 Jahre"
                                : "Begleiter • 3 Jahre"}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-accent text-xs">★</span>
                            <span className="text-primary text-xs">
                              {i === 1 ? "4.9" : "4.7"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Nav */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-white/50 backdrop-blur-xl flex items-center justify-around px-8">
                      {["🏠", "💬", "📅", "👤"].map((icon, i) => (
                        <div
                          key={i}
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            i === 0 ? "bg-accent/20" : ""
                          }`}
                        >
                          <span className="text-lg">{icon}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
