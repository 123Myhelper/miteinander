'use strict';

/**
 * Migration: align_care_needs_taxonomy
 * Created: 2026-07-10
 * Description: Align the care_needs taxonomy with MyHelper's Alltagsbegleitung
 * scope. Deactivates categories implying medical/nursing care (medication,
 * personalHygiene, mealPreparation), reframes "mobility" around everyday
 * outings rather than physical transfers, strips bathing/personal-care
 * wording from "dailyLiving", and corrects French sentence case. Rows are
 * targeted by their stable `key`, never by numeric id, and no rows are
 * deleted.
 */

const DEACTIVATED_KEYS = ['medication', 'personalHygiene', 'mealPreparation'];

const MOBILITY_UPDATED = {
  label_en: 'Getting Out & About',
  label_de: 'Begleitung unterwegs',
  label_fr: 'Accompagnement en déplacement',
  description_en: 'Support with walks, appointments, errands, and everyday outings',
  description_de: 'Unterstützung bei Spaziergängen, Terminen, Besorgungen und alltäglichen Ausflügen',
  description_fr: 'Aide pour les promenades, rendez-vous, courses et sorties quotidiennes',
};

const MOBILITY_ORIGINAL = {
  label_en: 'Mobility Assistance',
  label_de: 'Mobilitätshilfe',
  label_fr: 'Aide À La Mobilité',
  description_en: 'Help with walking, transfers, and physical movement',
  description_de: 'Hilfe beim Gehen, Transfers und körperlicher Bewegung',
  description_fr: 'Aide à la marche, aux transferts et aux mouvements physiques',
};

const DAILY_LIVING_UPDATED = {
  label_fr: 'Activités quotidiennes',
  description_en: 'Assistance with daily activities like eating and dressing',
  description_de: 'Unterstützung bei täglichen Aktivitäten wie Essen und Anziehen',
  description_fr: "Aide aux activités quotidiennes comme manger et s'habiller",
};

const DAILY_LIVING_ORIGINAL = {
  label_fr: 'Activités Quotidiennes',
  description_en: 'Assistance with daily activities like eating, dressing, and bathing',
  description_de: 'Unterstützung bei täglichen Aktivitäten wie Essen, Anziehen und Baden',
  description_fr: "Aide aux activités quotidiennes comme manger, s'habiller et se laver",
};

const HOUSEKEEPING_UPDATED = {
  label_fr: 'Entretien ménager',
};

const HOUSEKEEPING_ORIGINAL = {
  label_fr: 'Entretien Ménager',
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkUpdate(
      'care_needs',
      { is_active: false, updated_at: new Date() },
      { key: { [Sequelize.Op.in]: DEACTIVATED_KEYS } }
    );

    await queryInterface.bulkUpdate(
      'care_needs',
      { ...MOBILITY_UPDATED, updated_at: new Date() },
      { key: 'mobility' }
    );

    await queryInterface.bulkUpdate(
      'care_needs',
      { ...DAILY_LIVING_UPDATED, updated_at: new Date() },
      { key: 'dailyLiving' }
    );

    await queryInterface.bulkUpdate(
      'care_needs',
      { ...HOUSEKEEPING_UPDATED, updated_at: new Date() },
      { key: 'housekeeping' }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkUpdate(
      'care_needs',
      { is_active: true, updated_at: new Date() },
      { key: { [Sequelize.Op.in]: DEACTIVATED_KEYS } }
    );

    await queryInterface.bulkUpdate(
      'care_needs',
      { ...MOBILITY_ORIGINAL, updated_at: new Date() },
      { key: 'mobility' }
    );

    await queryInterface.bulkUpdate(
      'care_needs',
      { ...DAILY_LIVING_ORIGINAL, updated_at: new Date() },
      { key: 'dailyLiving' }
    );

    await queryInterface.bulkUpdate(
      'care_needs',
      { ...HOUSEKEEPING_ORIGINAL, updated_at: new Date() },
      { key: 'housekeeping' }
    );
  },
};
