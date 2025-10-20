const express = require('express');
const { query } = require('./database/event_db');
const router = express.Router();




// 在 registrations.js 文件的开头或其他路由之前添加：

// GET /api/registrations 根路径
router.get('/', async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Registrations API is working',
            availableEndpoints: [
                'POST / - Create new registration',
                'GET /event/:eventId - Get event registrations',
                'GET /check-email - Check if email is registered',
                'GET /event/:eventId/availability - Check event availability'
            ],
            usage: {
                createRegistration: {
                    method: 'POST',
                    url: '/api/registrations',
                    body: {
                        event_id: 'number (required)',
                        full_name: 'string (required)',
                        email: 'string (required)',
                        ticket_quantity: 'number (required)',
                        phone: 'string (optional)'
                    }
                },
                getEventRegistrations: {
                    method: 'GET', 
                    url: '/api/registrations/event/:eventId'
                },
                checkEmail: {
                    method: 'GET',
                    url: '/api/registrations/check-email?event_id=:eventId&email=:email'
                },
                checkAvailability: {
                    method: 'GET',
                    url: '/api/registrations/event/:eventId/availability'
                }
            }
        });
    } catch (error) {
        console.error('Error in registrations root route:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

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
        
        // 获取活动信息和当前筹款金额
        const eventQuery = `
            SELECT 
                e.*,
                COALESCE(SUM(r.ticket_quantity), 0) as registered_tickets
            FROM events e 
            LEFT JOIN registrations r ON e.id = r.event_id 
            WHERE e.id = ? AND e.is_active = 1
            GROUP BY e.id
        `;
        
        const events = await query(eventQuery, [event_id]);
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
        if (ticket_quantity < 1 || ticket_quantity > 10) {
            return res.status(400).json({ 
                success: false, 
                message: 'Ticket quantity must be between 1 and 10' 
            });
        }
        
        // 检查活动人数限制
        if (event.max_attendees) {
            const totalRegisteredTickets = event.registered_tickets;
            const availableTickets = event.max_attendees - totalRegisteredTickets;
            
            if (availableTickets < ticket_quantity) {
                if (availableTickets <= 0) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Sorry, this event is fully booked. No tickets available.' 
                    });
                } else {
                    return res.status(400).json({ 
                        success: false, 
                        message: `Only ${availableTickets} tickets remaining for this event. You requested ${ticket_quantity} tickets.` 
                    });
                }
            }
        }
        
        // 检查是否已经用相同邮箱注册过
        const existingRegistration = await query(
            'SELECT id FROM registrations WHERE event_id = ? AND email = ?',
            [event_id, email]
        );

        if (existingRegistration.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'This email has already been used to register for this event' 
            });
        }
        
        // 计算票务金额
        const ticket_amount = event.ticket_price * ticket_quantity;
        
        const sql = `
            INSERT INTO registrations (
                event_id, full_name, email, phone, emergency_contact_name, 
                emergency_contact_phone, address, ticket_quantity, special_requirements, total_amount
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const result = await query(sql, [
            event_id, full_name, email, phone, emergency_contact_name,
            emergency_contact_phone, address, ticket_quantity, special_requirements, ticket_amount
        ]);
        
        // 关键修复：累加到现有筹款金额，而不是覆盖
        console.log('💰 Updating fundraising amount:', {
            event_id: event_id,
            current_amount_before: event.current_amount,
            ticket_amount: ticket_amount,
            new_total_amount: parseFloat(event.current_amount) + ticket_amount
        });
        
        await query(
            'UPDATE events SET current_amount = current_amount + ? WHERE id = ?',
            [ticket_amount, event_id]
        );
        
        // 验证更新
        const verifyResult = await query('SELECT current_amount FROM events WHERE id = ?', [event_id]);
        console.log('✅ Verified current_amount after update:', verifyResult[0].current_amount);
        
        res.json({
            success: true,
            message: 'Registration successful',
            data: { 
                id: result.insertId,
                total_amount: ticket_amount,
                ticket_type: event.ticket_type,
                available_tickets: event.max_attendees ? event.max_attendees - (event.registered_tickets + ticket_quantity) : null
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

// 获取活动可用票数 - 修复版本
router.get('/event/:eventId/availability', async (req, res) => {
    try {
        const eventId = req.params.eventId;
        
        const sql = `
            SELECT 
                e.max_attendees,
                e.date_time,
                e.is_active,
                COALESCE(SUM(r.ticket_quantity), 0) as registered_tickets
            FROM events e
            LEFT JOIN registrations r ON e.id = r.event_id
            WHERE e.id = ?
            GROUP BY e.id, e.max_attendees, e.date_time, e.is_active
        `;
        
        const result = await query(sql, [eventId]);
        
        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        const event = result[0];
        
        // 修复：将字符串转换为数字
        const registeredTickets = parseInt(event.registered_tickets) || 0;
        const maxAttendees = event.max_attendees ? parseInt(event.max_attendees) : null;
        
        const availableTickets = maxAttendees ? maxAttendees - registeredTickets : null;
        
        // 检查活动是否已过期
        const now = new Date();
        const eventDate = new Date(event.date_time);
        const isPastEvent = eventDate < now;
        
        // 修复逻辑：活动可用的条件
        // 1. 活动是活跃状态 (is_active = 1)
        // 2. 活动未过期
        // 3. 如果没有人数限制 或者 有可用票数
        const isAvailable = event.is_active === 1 && 
                           !isPastEvent && 
                           (maxAttendees === null || availableTickets > 0);
        
        res.json({
            success: true,
            data: {
                max_attendees: maxAttendees,
                registered_tickets: registeredTickets,
                available_tickets: availableTickets,
                is_available: isAvailable,
                is_past_event: isPastEvent,
                is_active: event.is_active === 1,
                event_date: event.date_time,
                current_time: now.toISOString()
            }
        });
    } catch (error) {
        console.error('Error checking event availability:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to check event availability', 
            error: error.message 
        });
    }
});

module.exports = router;