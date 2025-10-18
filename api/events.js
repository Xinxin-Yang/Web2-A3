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
        c.description as category_description,
        COALESCE(SUM(r.ticket_quantity), 0) as registered_tickets
      FROM events e
      JOIN categories c ON e.category_id = c.id
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE e.is_active = 1
      GROUP BY e.id, c.name, c.description
      ORDER BY e.date_time ASC
    `;
    
    const events = await query(sql);
    
    // 计算可用票数和筹款进度百分比
    const eventsWithCalculations = events.map(event => {
      const now = new Date();
      const eventDate = new Date(event.date_time);
      const isPastEvent = eventDate < now;
      
      return {
        ...event,
        available_tickets: event.max_attendees ? Math.max(0, event.max_attendees - event.registered_tickets) : null,
        // 筹款进度直接使用数据库中的 current_amount 和 goal_amount
        progress_percentage: event.goal_amount > 0 ? Math.min(Math.round((event.current_amount / event.goal_amount) * 100), 100) : 0,
        is_almost_full: event.max_attendees && (event.max_attendees - event.registered_tickets) <= 5 && (event.max_attendees - event.registered_tickets) > 0,
        is_full: event.max_attendees && (event.max_attendees - event.registered_tickets) <= 0,
        is_past_event: isPastEvent
      };
    });
    
    res.json({
      success: true,
      data: eventsWithCalculations,
      count: eventsWithCalculations.length
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
        c.name as category_name,
        COALESCE(SUM(r.ticket_quantity), 0) as registered_tickets
      FROM events e
      JOIN categories c ON e.category_id = c.id
      LEFT JOIN registrations r ON e.id = r.event_id
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
    
    sql += ' GROUP BY e.id, c.name ORDER BY e.date_time ASC';
    
    const events = await query(sql, params);
    
    // 计算可用票数和筹款进度百分比
    const eventsWithCalculations = events.map(event => {
      const now = new Date();
      const eventDate = new Date(event.date_time);
      const isPastEvent = eventDate < now;
      
      return {
        ...event,
        available_tickets: event.max_attendees ? Math.max(0, event.max_attendees - event.registered_tickets) : null,
        // 筹款进度直接使用数据库中的 current_amount 和 goal_amount
        progress_percentage: event.goal_amount > 0 ? Math.min(Math.round((event.current_amount / event.goal_amount) * 100), 100) : 0,
        is_almost_full: event.max_attendees && (event.max_attendees - event.registered_tickets) <= 5 && (event.max_attendees - event.registered_tickets) > 0,
        is_full: event.max_attendees && (event.max_attendees - event.registered_tickets) <= 0,
        is_past_event: isPastEvent
      };
    });
    
    res.json({
      success: true,
      data: eventsWithCalculations,
      count: eventsWithCalculations.length,
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
// 在 events.js 中添加这个端点
// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // 获取事件基本信息
    const eventSql = `
      SELECT 
        e.*,
        c.name as category_name,
        c.description as category_description,
        COALESCE(SUM(r.ticket_quantity), 0) as registered_tickets
      FROM events e
      JOIN categories c ON e.category_id = c.id
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE e.id = ? AND e.is_active = 1
      GROUP BY e.id, c.name, c.description
    `;
    
    const events = await query(eventSql, [eventId]);
    
    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const event = events[0];

    // 获取该事件的注册列表
    const registrationsSql = `
      SELECT 
        id,
        full_name,
        email,
        phone,
        ticket_quantity,
        total_amount,
        registration_date
      FROM registrations 
      WHERE event_id = ?
      ORDER BY registration_date DESC
    `;
    
    const registrations = await query(registrationsSql, [eventId]);

    // 添加调试信息
    console.log('📊 Event data from database:', {
      id: event.id,
      name: event.name,
      current_amount: event.current_amount,
      goal_amount: event.goal_amount,
      progress: (event.current_amount / event.goal_amount * 100).toFixed(2) + '%'
    });
    
    // 计算可用票数和筹款进度百分比
    const now = new Date();
    const eventDate = new Date(event.date_time);
    const isPastEvent = eventDate < now;
    
    const eventWithCalculations = {
      ...event,
      available_tickets: event.max_attendees ? Math.max(0, event.max_attendees - event.registered_tickets) : null,
      // 筹款进度直接使用数据库中的 current_amount 和 goal_amount
      progress_percentage: event.goal_amount > 0 ? Math.min(Math.round((event.current_amount / event.goal_amount) * 100), 100) : 0,
      is_almost_full: event.max_attendees && (event.max_attendees - event.registered_tickets) <= 5 && (event.max_attendees - event.registered_tickets) > 0,
      is_full: event.max_attendees && (event.max_attendees - event.registered_tickets) <= 0,
      is_past_event: isPastEvent
    };
    
    // 合并数据返回
    res.json({
      success: true,
      data: {
        ...eventWithCalculations,
        registrations: registrations
      }
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

// 获取活动详情（包含注册信息）
router.get('/:id/with-registrations', async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // 获取活动详情
    const eventSql = `
      SELECT 
        e.*,
        c.name as category_name,
        c.description as category_description,
        COALESCE(SUM(r.ticket_quantity), 0) as registered_tickets
      FROM events e
      JOIN categories c ON e.category_id = c.id
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE e.id = ?
      GROUP BY e.id, c.name, c.description
    `;
    
    const events = await query(eventSql, [eventId]);
    
    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const event = events[0];
    
    // 获取注册信息
    const registrationsSql = `
      SELECT * FROM registrations 
      WHERE event_id = ? 
      ORDER BY registration_date DESC
    `;
    
    const registrations = await query(registrationsSql, [eventId]);
    
    // 计算可用票数和筹款进度百分比
    const now = new Date();
    const eventDate = new Date(event.date_time);
    const isPastEvent = eventDate < now;
    
    const eventWithCalculations = {
      ...event,
      available_tickets: event.max_attendees ? Math.max(0, event.max_attendees - event.registered_tickets) : null,
      // 筹款进度直接使用数据库中的 current_amount 和 goal_amount
      progress_percentage: event.goal_amount > 0 ? Math.min(Math.round((event.current_amount / event.goal_amount) * 100), 100) : 0,
      is_almost_full: event.max_attendees && (event.max_attendees - event.registered_tickets) <= 5 && (event.max_attendees - event.registered_tickets) > 0,
      is_full: event.max_attendees && (event.max_attendees - event.registered_tickets) <= 0,
      is_past_event: isPastEvent
    };
    
    res.json({
      success: true,
      data: {
        ...eventWithCalculations,
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
      SELECT 
        e.*, 
        c.name as category_name,
        COALESCE(SUM(r.ticket_quantity), 0) as registered_tickets
      FROM events e 
      JOIN categories c ON e.category_id = c.id 
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE e.id = ? AND e.is_active = 1
      GROUP BY e.id, c.name
    `;
    
    const events = await query(eventCheck, [eventId]);
    
    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or not active'
      });
    }

    const event = events[0];
    
    // 检查活动是否已过期
    const now = new Date();
    const eventDate = new Date(event.date_time);
    if (eventDate < now) {
      return res.status(400).json({
        success: false,
        message: 'This event has already ended. Registration is no longer available.'
      });
    }
    
    // 检查票数限制
    if (event.max_attendees) {
      const availableTickets = event.max_attendees - event.registered_tickets;
      if (availableTickets < ticket_quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${availableTickets} tickets available. You requested ${ticket_quantity} tickets.`
        });
      }
    }

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

    // 计算票务金额
    const ticket_amount = event.ticket_price * ticket_quantity;

    // 插入注册记录
    const sql = `
      INSERT INTO registrations (
        event_id, full_name, email, phone, ticket_quantity, total_amount
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      eventId, full_name, email, phone || null, ticket_quantity, ticket_amount
    ]);

    // 关键修复：累加到现有筹款金额
    console.log('🎫 Event registration fundraising:', {
      event_id: eventId,
      current_amount_before: event.current_amount,
      ticket_amount: ticket_amount,
      new_amount: parseFloat(event.current_amount) + ticket_amount
    });

    await query(
      'UPDATE events SET current_amount = current_amount + ? WHERE id = ?',
      [ticket_amount, eventId]
    );

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
          total_amount: ticket_amount
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