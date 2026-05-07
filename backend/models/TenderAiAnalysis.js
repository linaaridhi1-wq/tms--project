/**
 * TenderAiAnalysis Model
 * Stores the LLM extraction results for each tender.
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TenderAiAnalysis = sequelize.define('TenderAiAnalysis', {
    analysis_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // Raw PDF text (stored for reference/re-processing)
    raw_text: {
      type: DataTypes.TEXT,
    },
    // Original filename
    filename: {
      type: DataTypes.STRING(255),
    },
    // LLM-extracted structured fields
    extracted_title: {
      type: DataTypes.STRING(500),
    },
    sector: {
      type: DataTypes.STRING(100),
    },
    tender_type: {
      type: DataTypes.STRING(100),
    },
    client_name: {
      type: DataTypes.STRING(255),
    },
    client_size: {
      type: DataTypes.STRING(50),
    },
    estimated_budget_eur: {
      type: DataTypes.FLOAT,
    },
    deadline_date: {
      type: DataTypes.DATEONLY,
    },
    estimated_duration_weeks: {
      type: DataTypes.INTEGER,
    },
    geographic_location: {
      type: DataTypes.STRING(200),
    },
    // Full requirements array as JSON
    requirements: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    key_deliverables: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    evaluation_criteria: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    languages_required: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    summary: {
      type: DataTypes.TEXT,
    },
    // Processing state
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending', // 'pending' | 'completed' | 'failed'
    },
    error_message: {
      type: DataTypes.TEXT,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'tender_ai_analysis',
    timestamps: false,
  });

  TenderAiAnalysis.associate = (models) => {
    TenderAiAnalysis.belongsTo(models.Tender, {
      foreignKey: 'tender_id',
      targetKey: 'tender_id',
      as: 'tender',
    });
  };

  return TenderAiAnalysis;
};
