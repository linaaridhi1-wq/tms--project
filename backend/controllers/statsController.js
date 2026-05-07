const { Client, Tender, Submission } = require('../models');

const parseBudget = (value) => {
  if (!value) return 0;
  const cleaned = String(value).replace(/[^0-9.]/g, '');
  const num = Number.parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
};

const formatDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};

const MONTHS = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const buildMonthBuckets = (count = 5) => {
  const now = new Date();
  const buckets = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    buckets.push({
      key,
      month: MONTHS[d.getMonth()],
      tenders: 0,
      won: 0,
    });
  }
  return buckets;
};

exports.dashboard = async (req, res) => {
  try {
    const [clients, tenders, submissions] = await Promise.all([
      Client.count({ where: { actif: true } }),
      Tender.count({ where: { actif: true } }),
      Submission.count({ where: { actif: true } }),
    ]);

    const [wonCount, lostCount, recentTenders, statusRows] = await Promise.all([
      Tender.count({ where: { actif: true, statut: 'gagne' } }),
      Tender.count({ where: { actif: true, statut: 'perdu' } }),
      Tender.findAll({
        where: { actif: true },
        order: [['date_creation', 'DESC'], ['tender_id', 'DESC']],
        limit: 5,
      }),
      Tender.findAll({ where: { actif: true }, attributes: ['statut'] }),
    ]);

    const totalResult = wonCount + lostCount;
    const winRate = totalResult > 0 ? Math.round((wonCount / totalResult) * 100) : null;

    const statusCounts = { detecte: 0, qualifie: 0, en_cours: 0, soumis: 0, gagne: 0, perdu: 0 };
    statusRows.forEach((row) => {
      const key = row.statut || 'detecte';
      statusCounts[key] = (statusCounts[key] || 0) + 1;
    });

    res.json({
      counts: { clients, tenders, submissions },
      winRate,
      statusCounts,
      recentTenders,
    });
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.reports = async (req, res) => {
  try {
    const [clients, tenders] = await Promise.all([
      Client.findAll({ attributes: ['raison_sociale', 'secteur'] }),
      Tender.findAll({ where: { actif: true } }),
    ]);

    const clientSectorMap = new Map(
      clients.map((c) => [c.raison_sociale, c.secteur || 'Autre'])
    );

    const sectorMap = new Map();
    let wonCount = 0;
    let lostCount = 0;
    let valueWon = 0;
    const delays = [];

    tenders.forEach((t) => {
      const sector = clientSectorMap.get(t.client) || 'Autre';
      const entry = sectorMap.get(sector) || { name: sector, won: 0, lost: 0, total: 0 };
      entry.total += 1;
      if (t.statut === 'gagne') {
        entry.won += 1;
        wonCount += 1;
        valueWon += parseBudget(t.budget);
      } else if (t.statut === 'perdu') {
        entry.lost += 1;
        lostCount += 1;
      }
      sectorMap.set(sector, entry);

      if (t.date_creation && t.date_limite) {
        const start = new Date(t.date_creation).getTime();
        const end = new Date(t.date_limite).getTime();
        if (!Number.isNaN(start) && !Number.isNaN(end)) {
          const diff = Math.ceil((end - start) / 86400000);
          if (Number.isFinite(diff)) delays.push(diff);
        }
      }
    });

    const sectorData = Array.from(sectorMap.values())
      .map((s) => ({
        ...s,
        rate: s.total > 0 ? Math.round((s.won / s.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);

    const monthlyBuckets = buildMonthBuckets(5);
    const bucketMap = new Map(monthlyBuckets.map((b) => [b.key, b]));

    tenders.forEach((t) => {
      const dateValue = t.date_creation || t.date_limite;
      if (!dateValue) return;
      const d = new Date(dateValue);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const bucket = bucketMap.get(key);
      if (!bucket) return;
      bucket.tenders += 1;
      if (t.statut === 'gagne') bucket.won += 1;
    });

    const recentResults = tenders
      .map((t) => ({
        titre: t.titre,
        statut: t.statut === 'gagne' ? 'gagne' : t.statut === 'perdu' ? 'perdu' : 'pending',
        montant: t.budget || '—',
        date: formatDate(t.date_limite || t.date_creation),
      }))
      .sort((a, b) => {
        const ad = a.date ? new Date(a.date).getTime() : 0;
        const bd = b.date ? new Date(b.date).getTime() : 0;
        return bd - ad;
      })
      .slice(0, 5);

    const totalResults = wonCount + lostCount;
    const winRate = totalResults > 0 ? Math.round((wonCount / totalResults) * 100) : null;
    const avgDelayDays = delays.length > 0
      ? Math.round(delays.reduce((a, b) => a + b, 0) / delays.length)
      : null;

    res.json({
      kpis: {
        totalTenders: tenders.length,
        winRate,
        valueWon,
        avgDelayDays,
      },
      sectorData,
      monthly: monthlyBuckets,
      recentResults,
    });
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
