const express = require('express');
const { query } = require('./database/event_db');
const router = express.Router();

// Get all active events for homepage (without date filtering)
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT 
        e.*,
        c.name as category_name,
        c.description as category_description
      FROM events e
      JOIN categories c ON e.category_id = c.id
      WHERE e.is_active = 1
      ORDER BY e.date_time ASC
    `;
    
    const events = await query(sql);
    
    res.json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
});

// Get event categories
router.get('/categories', async (req, res) => {
  try {
    const sql = 'SELECT * FROM categories ORDER BY name';
    const categories = await query(sql);
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// Search events with filters
router.get('/search', async (req, res) => {
  try {
    const { date, location, category, category_id } = req.query;
    
    let sql = `
      SELECT 
        e.*,
        c.name as category_name
      FROM events e
      JOIN categories c ON e.category_id = c.id
      WHERE e.is_active = 1
    `;
    
    const params = [];
    
    // Add filters based on query parameters
    if (date) {
      sql += ' AND DATE(e.date_time) = ?';
      params.push(date);
    }
    
    if (location) {
      sql += ' AND e.location LIKE ?';
      params.push(`%${location}%`);
    }
    
    if (category) {
      sql += ' AND c.name LIKE ?';
      params.push(`%${category}%`);
    }
    
    if (category_id) {
      sql += ' AND e.category_id = ?';
      params.push(category_id);
    }
    
    sql += ' ORDER BY e.date_time ASC';
    
    const events = await query(sql, params);
    
    res.json({
      success: true,
      data: events,
      count: events.length,
      filters: { date, location, category, category_id }
    });
  } catch (error) {
    console.error('Error searching events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search events',
      error: error.message
    });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    
    const sql = `
      SELECT 
        e.*,
        c.name as category_name,
        c.description as category_description
      FROM events e
      JOIN categories c ON e.category_id = c.id
      WHERE e.id = ? AND e.is_active = 1
    `;
    
    const events = await query(sql, [eventId]);
    
    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    res.json({
      success: true,
      data: events[0]
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: error.message
    });
  }
});

// Get events by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    
    const sql = `
      SELECT 
        e.*,
        c.name as category_name
      FROM events e
      JOIN categories c ON e.category_id = c.id
      WHERE e.category_id = ? 
      AND e.is_active = 1
      ORDER BY e.date_time ASC
    `;
    
    const events = await query(sql, [categoryId]);
    
    res.json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (error) {
    console.error('Error fetching events by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events by category',
      error: error.message
    });
  }
});

// 获取活动详情（包含注册信息）
router.get('/:id/with-registrations', async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // 获取活动详情
    const eventSql = `
      SELECT 
        e.*,
        c.name as category_name,
        c.description as category_description
      FROM events e
      JOIN categories c ON e.category_id = c.id
      WHERE e.id = ?
    `;
    
    const events = await query(eventSql, [eventId]);
    
    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // 获取注册信息
    const registrationsSql = `
      SELECT * FROM registrations 
      WHERE event_id = ? 
      ORDER BY registration_date DESC
    `;
    
    const registrations = await query(registrationsSql, [eventId]);
    
    res.json({
      success: true,
      data: {
        ...events[0],
        registrations: registrations
      }
    });
  } catch (error) {
    console.error('Error fetching event with registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event details',
      error: error.message
    });
  }
});

// 创建新活动
router.post('/', async (req, res) => {
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

    // 验证必需字段
    if (!name || !date_time || !location || !category_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const sql = `
      INSERT INTO events (
        name, short_description, full_description, date_time, 
        location, address, category_id, ticket_price, 
        ticket_type, goal_amount, max_attendees
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      name, short_description || '', full_description || '', date_time,
      location, address || '', category_id, ticket_price || 0,
      ticket_type || 'free', goal_amount || 0, max_attendees || null
    ]);

    res.json({
      success: true,
      message: 'Event created successfully',
      data: {
        id: result.insertId
      }
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

// 更新活动
router.put('/:id', async (req, res) => {
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
      is_active,
      max_attendees
    } = req.body;

    // 检查活动是否存在
    const checkSql = 'SELECT id FROM events WHERE id = ?';
    const existingEvent = await query(checkSql, [eventId]);
    
    if (existingEvent.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const sql = `
      UPDATE events SET
        name = ?, short_description = ?, full_description = ?, date_time = ?,
        location = ?, address = ?, category_id = ?, ticket_price = ?,
        ticket_type = ?, goal_amount = ?, current_amount = ?, is_active = ?, max_attendees = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await query(sql, [
      name, short_description, full_description, date_time,
      location, address, category_id, ticket_price,
      ticket_type, goal_amount, current_amount, is_active, max_attendees,
      eventId
    ]);

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

// 删除活动
router.delete('/:id', async (req, res) => {
  try {
    const eventId = req.params.id;

    // 检查是否有注册记录
    const registrationsCheck = `
      SELECT COUNT(*) as registration_count 
      FROM registrations 
      WHERE event_id = ?
    `;
    
    const registrationResult = await query(registrationsCheck, [eventId]);
    
    if (registrationResult[0].registration_count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete event with existing registrations'
      });
    }

    const sql = 'DELETE FROM events WHERE id = ?';
    await query(sql, [eventId]);

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

// 注册活动
router.post('/:id/register', async (req, res) => {
  try {
    const eventId = req.params.id;
    const {
      full_name,
      email,
      phone,
      ticket_quantity
    } = req.body;

    // 验证必需字段
    if (!full_name || !email || !ticket_quantity) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: full_name, email, ticket_quantity'
      });
    }

    // 检查活动是否存在且活跃
    const eventCheck = `
      SELECT e.*, c.name as category_name 
      FROM events e 
      JOIN categories c ON e.category_id = c.id 
      WHERE e.id = ? AND e.is_active = 1
    `;
    
    const events = await query(eventCheck, [eventId]);
    
    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or not active'
      });
    }

    const event = events[0];
    
    // 计算总金额
    const total_amount = event.ticket_price * ticket_quantity;

    // 检查是否已经注册
    const existingRegistration = await query(
      'SELECT id FROM registrations WHERE event_id = ? AND email = ?',
      [eventId, email]
    );

    if (existingRegistration.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this event'
      });
    }

    // 插入注册记录
    const sql = `
      INSERT INTO registrations (
        event_id, full_name, email, phone, ticket_quantity, total_amount
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      eventId, full_name, email, phone || null, ticket_quantity, total_amount
    ]);

    res.json({
      success: true,
      message: 'Registration successful',
      data: {
        registration_id: result.insertId,
        event: {
          name: event.name,
          date_time: event.date_time,
          location: event.location
        },
        registration: {
          full_name,
          email,
          ticket_quantity,
          total_amount: total_amount
        }
      }
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register for event',
      error: error.message
    });
  }
});

module.exports = router;