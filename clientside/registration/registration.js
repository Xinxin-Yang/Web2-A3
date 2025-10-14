const express = require('express');
const { query } = require('./database/event_db');
const router = express.Router();

// 创建新注册
router.post('/', async (req, res) => {
  try {
    const { 
      event_id, 
      full_name, 
      email, 
      phone, 
      emergency_contact_name, 
      emergency_contact_phone, 
      address, 
      ticket_quantity, 
      special_requirements 
    } = req.body;
    
    // 验证必填字段
    if (!event_id || !full_name || !email || !ticket_quantity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: event_id, full_name, email, and ticket_quantity are required' 
      });
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }
    
    // 获取活动信息计算总金额
    const event = await query('SELECT ticket_price, ticket_type, max_attendees FROM events WHERE id = ? AND is_active = 1', [event_id]);
    if (event.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found or not active' 
      });
    }
    
    // 检查票数限制
    if (ticket_quantity < 1 || ticket_quantity > 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ticket quantity must be between 1 and 10' 
      });
    }
    
    // 检查活动人数限制
    if (event[0].max_attendees) {
      const currentRegistrations = await query(
        'SELECT SUM(ticket_quantity) as total_tickets FROM registrations WHERE event_id = ?', 
        [event_id]
      );
      const totalTickets = currentRegistrations[0].total_tickets || 0;
      
      if (totalTickets + ticket_quantity > event[0].max_attendees) {
        return res.status(400).json({ 
          success: false, 
          message: `Only ${event[0].max_attendees - totalTickets} tickets remaining for this event` 
        });
      }
    }
    
    const total_amount = event[0].ticket_price * ticket_quantity;
    
    const sql = `
      INSERT INTO registrations (
        event_id, full_name, email, phone, emergency_contact_name, 
        emergency_contact_phone, address, ticket_quantity, special_requirements, total_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await query(sql, [
      event_id, full_name, email, phone, emergency_contact_name,
      emergency_contact_phone, address, ticket_quantity, special_requirements, total_amount
    ]);
    
    // 更新活动的当前金额
    await query(
      'UPDATE events SET current_amount = current_amount + ? WHERE id = ?',
      [total_amount, event_id]
    );
    
    res.json({
      success: true,
      message: 'Registration successful',
      data: { 
        id: result.insertId,
        total_amount: total_amount,
        ticket_type: event[0].ticket_type
      }
    });
  } catch (error) {
    console.error('Error creating registration:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create registration', 
      error: error.message 
    });
  }
});

// 获取活动的所有注册
router.get('/event/:eventId', async (req, res) => {
  try {
    const eventId = req.params.eventId;
    
    const sql = `
      SELECT 
        id, full_name, email, ticket_quantity, total_amount,
        DATE_FORMAT(registration_date, '%Y-%m-%d %H:%i:%s') as registration_date,
        payment_status
      FROM registrations 
      WHERE event_id = ? 
      ORDER BY registration_date DESC
    `;
    
    const registrations = await query(sql, [eventId]);
    
    res.json({ 
      success: true, 
      data: registrations,
      count: registrations.length 
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

// 检查邮箱是否已注册该活动
router.get('/check-email', async (req, res) => {
  try {
    const { event_id, email } = req.query;
    
    if (!event_id || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing event_id or email parameters' 
      });
    }
    
    const sql = 'SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND email = ?';
    const result = await query(sql, [event_id, email]);
    
    res.json({
      success: true,
      data: {
        is_registered: result[0].count > 0
      }
    });
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check email', 
      error: error.message 
    });
  }
});

module.exports = router;