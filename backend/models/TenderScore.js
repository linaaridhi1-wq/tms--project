/**
 * TenderScore Model
 * Stores the Tender Fit Score (TFS) for each tender.
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TenderScore = sequelize.define('TenderScore', {
    score_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    analysis_id: {
      type: DataTypes.INTEGER,
    },
    // Composite score
    total_score: {
      type: DataTypes.INTEGER, // 0-100
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING(20), // 'High Fit' | 'Medium Fit' | 'Low Fit' | 'Poor Fit'
    },
    // Dimension scores
    service_match_score: {
      type: DataTypes.INTEGER, // 0-30
    },
    sector_fit_score: {
      type: DataTypes.INTEGER, // 0-20
    },
    budget_alignment_score: {
      type: DataTypes.INTEGER, // 0-15
    },
    timeline_score: {
      type: DataTypes.INTEGER, // 0-15
    },
    geographic_score: {
      type: DataTypes.INTEGER, // 0-10
    },
    past_similarity_score: {
      type: DataTypes.INTEGER, // 0-10
    },
    // LLM-generated insights
    strengths: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    risks: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    recommendation: {
      type: DataTypes.TEXT,
    },
    reasoning: {
      type: DataTypes.TEXT,
    },
    similar_past_tenders: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'tender_scores',
    timestamps: false,
  });

  TenderScore.associate = (models) => {
    TenderScore.belongsTo(models.Tender, {
      foreignKey: 'tender_id',
      targetKey: 'tender_id',
      as: 'tender',
    });
  };

  return TenderScore;
};
