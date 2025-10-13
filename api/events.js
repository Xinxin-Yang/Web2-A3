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

module.exports = router;