const { models, successResponse, errorResponse, getPagination, getPagingData, Op, config, Admin, Support, CareGiver, CareRecipient, CareNeed, Review, SettlementRequest, sequelize, getStripe } = require('./adminShared');

/**
 * Get dashboard analytics
 */
const getDashboardAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get counts for all user types
    const [
      totalAdmins,
      totalSupports,
      totalCareGivers,
      totalCareRecipients,
      activeCareGivers,
      activeCareRecipients,
      recentCareGivers,
      recentCareRecipients,
      verifiedCareGivers,
    ] = await Promise.all([
      Admin.count(),
      Support.count(),
      CareGiver.count(),
      CareRecipient.count(),
      CareGiver.count({ where: { isActive: true } }),
      CareRecipient.count({ where: { isActive: true } }),
      CareGiver.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } }),
      CareRecipient.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } }),
      CareGiver.count({ where: { isVerified: true } }),
    ]);

    // Get registration trend (last 30 days grouped by day)
    const registrationTrend = await sequelize.query(`
      SELECT 
        DATE(created_at) as date,
        'care_giver' as type,
        COUNT(*) as count
      FROM care_givers 
      WHERE created_at >= :thirtyDaysAgo
      GROUP BY DATE(created_at)
      UNION ALL
      SELECT 
        DATE(created_at) as date,
        'care_recipient' as type,
        COUNT(*) as count
      FROM care_recipients 
      WHERE created_at >= :thirtyDaysAgo
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, {
      replacements: { thirtyDaysAgo },
      type: sequelize.QueryTypes.SELECT
    });

    // Get recent registrations (last 10)
    const [recentCareGiversList, recentCareRecipientsList] = await Promise.all([
      CareGiver.findAll({
        attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt', 'isActive', 'isVerified'],
        order: [['createdAt', 'DESC']],
        limit: 5,
      }),
      CareRecipient.findAll({
        attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt', 'isActive'],
        order: [['createdAt', 'DESC']],
        limit: 5,
      }),
    ]);

    return successResponse(res, {
      totals: {
        admins: totalAdmins,
        supports: totalSupports,
        careGivers: totalCareGivers,
        careRecipients: totalCareRecipients,
        totalUsers: totalCareGivers + totalCareRecipients,
      },
      active: {
        careGivers: activeCareGivers,
        careRecipients: activeCareRecipients,
      },
      verified: {
        careGivers: verifiedCareGivers,
      },
      last30Days: {
        careGivers: recentCareGivers,
        careRecipients: recentCareRecipients,
        total: recentCareGivers + recentCareRecipients,
      },
      registrationTrend,
      recentRegistrations: {
        careGivers: recentCareGiversList,
        careRecipients: recentCareRecipientsList,
      },
    }, 'Dashboard analytics retrieved successfully');
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    return errorResponse(res, 'Failed to retrieve analytics', 500, 'ANALYTICS_ERROR');
  }
};

module.exports = { getDashboardAnalytics };
