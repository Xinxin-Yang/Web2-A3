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

// 获取活动可用票数
router.get('/event/:eventId/availability', async (req, res) => {
    try {
        const eventId = req.params.eventId;
        
        const sql = `
            SELECT 
                e.max_attendees,
                e.date_time,
                COALESCE(SUM(r.ticket_quantity), 0) as registered_tickets
            FROM events e
            LEFT JOIN registrations r ON e.id = r.event_id
            WHERE e.id = ?
            GROUP BY e.id, e.max_attendees, e.date_time
        `;
        
        const result = await query(sql, [eventId]);
        
        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        const event = result[0];
        const availableTickets = event.max_attendees ? event.max_attendees - event.registered_tickets : null;
        
        // 检查活动是否已过期
        const now = new Date();
        const eventDate = new Date(event.date_time);
        const isPastEvent = eventDate < now;
        
        res.json({
            success: true,
            data: {
                max_attendees: event.max_attendees,
                registered_tickets: event.registered_tickets,
                available_tickets: availableTickets,
                is_available: (availableTickets === null || availableTickets > 0) && !isPastEvent,
                is_past_event: isPastEvent
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