const express = require('express');
const cors = require('cors');
const eventsRouter = require('./events');
const adminRouter = require('./admin');
const registrationsRouter = require('./registrations');
const { connectDB } = require('./database/event_db');

const app = express();
const PORT = process.env.PORT || 4000;

// 中间件
app.use(cors());
app.use(express.json());

// 添加请求日志中间件（用于调试）
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// 测试数据库连接
connectDB().then(success => {
    if (success) {
        console.log('Database connection established');
    } else {
        console.log('Failed to connect to database');
    }
});

// 路由 - 确保这些路径正确
app.use('/api/events', eventsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/registrations', registrationsRouter);

// 健康检查端点
app.get('/api/health', async (req, res) => {
    try {
        const dbStatus = await connectDB();
        res.json({ 
            status: 'API is running', 
            database: dbStatus ? 'Connected' : 'Disconnected',
            timestamp: new Date().toISOString(),
            availableEndpoints: [
                'GET /api/events',
                'GET /api/events/categories', 
                'GET /api/events/search',
                'GET /api/events/:id',
                'POST /api/events/:id/register',
                'GET /api/admin/events',
                'GET /api/admin/events/:id/registrations',
                'POST /api/admin/events',
                'PUT /api/admin/events/:id',
                'DELETE /api/admin/events/:id',
                'POST /api/admin/registrations',
                'POST /api/registrations',
                'GET /api/registrations/event/:eventId',
                'GET /api/registrations/check-email',
                'GET /api/registrations/event/:eventId/availability'
            ]
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'API error', 
            error: error.message 
        });
    }
});

// 根路径重定向到健康检查
app.get('/', (req, res) => {
    res.redirect('/api/health');
});

// 404处理
app.use('*', (req, res) => {
    console.log(`404 - Route not found: ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        requestedUrl: req.originalUrl,
        availableEndpoints: [
            '/api/health',
            '/api/events',
            '/api/admin/events', 
            '/api/registrations'
        ]
    });
});

// 错误处理中间件
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Charity Events API Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Events API: http://localhost:${PORT}/api/events`);
    console.log(`Admin API: http://localhost:${PORT}/api/admin/events`);
    console.log(`Registrations API: http://localhost:${PORT}/api/registrations`);
});