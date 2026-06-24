import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

export async function GET() {
  const authUser = await getUserFromToken();
  const userId = authUser?.id ?? 1;
  const client = await pool.connect();
  try {
    const institutionRes = await client.query('SELECT institution_id FROM users WHERE id = $1', [userId]);
    const institutionId = institutionRes.rows[0]?.institution_id ?? 1;

    const [pickups, chart, stats, profit] = await Promise.all([
      client.query(`
        SELECT scheduled_date, quantity, status, revenue, buyer_name, pickup_type
        FROM pickups WHERE user_id = $1
        ORDER BY scheduled_date DESC LIMIT 5
      `, [userId]),
      client.query(`
        SELECT TO_CHAR(recorded_month, 'Mon') AS month, oil_collected_liters AS val
        FROM impact_records WHERE institution_id = $1
        ORDER BY recorded_month ASC
      `, [institutionId]),
      client.query(`
        SELECT
          (SELECT COALESCE(SUM(oil_collected_liters),0) FROM impact_records WHERE institution_id=$1) AS oil_kg,
          (SELECT COALESCE(SUM(revenue_oil),0) FROM impact_records WHERE institution_id=$1) AS earnings,
          (SELECT COALESCE(SUM(co2_saved_tons),0) FROM impact_records WHERE institution_id=$1) AS co2,
          (SELECT COUNT(*) FROM compliance_docs WHERE user_id=$2 AND status='valid') AS docs
      `, [institutionId, userId]),
      // Full profit & cost-savings breakdown
      client.query(`
        SELECT
          COALESCE(SUM(revenue_oil),0)              AS revenue_oil,
          COALESCE(SUM(revenue_ewaste),0)           AS revenue_ewaste,
          COALESCE(SUM(water_saved_liters),0)       AS water_saved_liters,
          COALESCE(SUM(co2_saved_tons),0)           AS co2_saved_tons,
          COALESCE(SUM(oil_collected_liters),0)     AS oil_collected_liters,
          COALESCE(SUM(ewaste_items),0)             AS ewaste_items,
          COUNT(*)                                   AS months_tracked
        FROM impact_records WHERE institution_id = $1
      `, [institutionId]),
    ]);

    const p = profit.rows[0];
    // Cost savings calculations:
    // Water: ₹5/litre municipal tariff avoided
    // CO2: ₹2000/tonne carbon credit value
    // Oil disposal: ₹8/litre avoided disposal cost
    // E-waste disposal: ₹500/item avoided certified disposal cost
    const waterSavings    = Number(p.water_saved_liters)   * 5;
    const co2Credits      = Number(p.co2_saved_tons)       * 2000;
    const oilDisposal     = Number(p.oil_collected_liters) * 8;
    const ewasteDisposal  = Number(p.ewaste_items)         * 500;
    const totalCostSavings = waterSavings + co2Credits + oilDisposal + ewasteDisposal;
    const totalRevenue     = Number(p.revenue_oil) + Number(p.revenue_ewaste);
    const totalProfit      = totalRevenue + totalCostSavings;

    return NextResponse.json({
      stats: stats.rows[0],
      pickups: pickups.rows,
      chart: chart.rows,
      profit: {
        revenue_oil:       Number(p.revenue_oil),
        revenue_ewaste:    Number(p.revenue_ewaste),
        total_revenue:     totalRevenue,
        water_savings:     waterSavings,
        co2_credits:       co2Credits,
        oil_disposal:      oilDisposal,
        ewaste_disposal:   ewasteDisposal,
        total_cost_savings: totalCostSavings,
        total_profit:      totalProfit,
        water_liters:      Number(p.water_saved_liters),
        co2_tons:          Number(p.co2_saved_tons),
        oil_liters:        Number(p.oil_collected_liters),
        ewaste_items:      Number(p.ewaste_items),
      },
    });
  } finally {
    client.release();
  }
}
