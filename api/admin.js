// admin.js - 管理端API
const express = require('express');
const { query } = require('./database/event_db');
const router = express.Router();

// 获取所有事件（包含注册数量）
router.get('/events', async (req, res) => {
  try {
    const sql = `
      SELECT 
        e.*,
        c.name as category_name,
        COUNT(r.id) as registration_count,
        COALESCE(SUM(r.ticket_quantity), 0) as total_tickets
      FROM events e
      JOIN categories c ON e.category_id = c.id
      LEFT JOIN registrations r ON e.id = r.event_id
      GROUP BY e.id
      ORDER BY e.date_time DESC
    `;
    
    const events = await query(sql);
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching events for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
});

// 获取特定事件的注册列表
router.get('/events/:id/registrations', async (req, res) => {
  try {
    const eventId = req.params.id;
    
    const sql = `
      SELECT 
        r.*,
        e.name as event_name
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.event_id = ?
      ORDER BY r.registration_date DESC
    `;
    
    const registrations = await query(sql, [eventId]);
    
    res.json({
      success: true,
      data: registrations
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations',
      error: error.message
    });
  }
});

// 创建新事件
router.post('/events', async (req, res) => {
  try {
    const {
      name,
      short_description,
      full_description,
      date_time,
      location,
      address,
      category_id,
      ticket_price,
      ticket_type,
      goal_amount,
      max_attendees
    } = req.body;

    // 验证必填字段
    if (!name || !date_time || !location || !category_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const sql = `
      INSERT INTO events (
        name, short_description, full_description, date_time, 
        location, address, category_id, ticket_price, ticket_type, 
        goal_amount, max_attendees, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `;

    const params = [
      name,
      short_description,
      full_description,
      date_time,
      location,
      address,
      category_id,
      ticket_price || 0,
      ticket_type || 'free',
      goal_amount || 0,
      max_attendees
    ];

    const result = await query(sql, params);
    
    res.json({
      success: true,
      message: 'Event created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
});

// 更新事件
router.put('/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const {
      name,
      short_description,
      full_description,
      date_time,
      location,
      address,
      category_id,
      ticket_price,
      ticket_type,
      goal_amount,
      current_amount,
      max_attendees,
      is_active
    } = req.body;

    const sql = `
      UPDATE events 
      SET name = ?, short_description = ?, full_description = ?, 
          date_time = ?, location = ?, address = ?, category_id = ?,
          ticket_price = ?, ticket_type = ?, goal_amount = ?,
          current_amount = ?, max_attendees = ?, is_active = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const params = [
      name,
      short_description,
      full_description,
      date_time,
      location,
      address,
      category_id,
      ticket_price,
      ticket_type,
      goal_amount,
      current_amount,
      max_attendees,
      is_active,
      eventId
    ];

    await query(sql, params);
    
    res.json({
      success: true,
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message
    });
  }
});

// 删除事件
router.delete('/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;

    // 检查是否有注册记录
    const checkSql = 'SELECT COUNT(*) as registration_count FROM registrations WHERE event_id = ?';
    const checkResult = await query(checkSql, [eventId]);
    
    if (checkResult[0].registration_count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete event with existing registrations'
      });
    }

    const deleteSql = 'DELETE FROM events WHERE id = ?';
    await query(deleteSql, [eventId]);
    
    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message
    });
  }
});

// 用户注册事件
router.get('/registrations', async (req, res) => {
  try {
    const sql = `
      SELECT 
        r.*,
        e.name as event_name,
        e.date_time as event_date,
        e.location as event_location
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      ORDER BY r.registration_date DESC
    `;
    
    const registrations = await query(sql);
    
    res.json({
      success: true,
      data: registrations
    });
  } catch (error) {
    console.error('Error fetching all registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations',
      error: error.message
    });
  }
});

// 获取注册统计信息
router.get('/registrations/stats', async (req, res) => {
  try {
    const statsSql = `
      SELECT 
        COUNT(*) as total_registrations,
        COALESCE(SUM(ticket_quantity), 0) as total_tickets,
        COALESCE(SUM(total_amount), 0) as total_revenue
      FROM registrations
    `;
    
    const recentSql = `
      SELECT 
        r.*,
        e.name as event_name
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      ORDER BY r.registration_date DESC
      LIMIT 10
    `;
    
    const [statsResult, recentRegistrations] = await Promise.all([
      query(statsSql),
      query(recentSql)
    ]);
    
    const stats = statsResult[0];
    
    res.json({
      success: true,
      data: {
        total_registrations: stats.total_registrations,
        total_tickets: stats.total_tickets,
        total_revenue: stats.total_revenue,
        recent_registrations: recentRegistrations
      }
    });
  } catch (error) {
    console.error('Error fetching registration stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registration statistics',
      error: error.message
    });
  }
});

module.exports = router;