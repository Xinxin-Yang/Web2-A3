const express = require('express');
const cors = require('cors');
const eventsRouter = require('./events');
const adminRouter = require('./admin');
const registrationsRouter = require('./registrations'); // 添加这一行
const { connectDB } = require('./database/event_db');

const app = express();
const PORT = process.env.PORT || 4000;

// 中间件
app.use(cors());
app.use(express.json());

// 测试数据库连接
connectDB().then(success => {
    if (success) {
        console.log('Database connection established');
    } else {
        console.log('Failed to connect to database');
    }
});

// 路由
app.use('/api/events', eventsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/registrations', registrationsRouter); // 添加这一行

// 健康检查端点
app.get('/api/health', async (req, res) => {
    try {
        const dbStatus = await connectDB();
        res.json({ 
            status: 'API is running', 
            database: dbStatus ? 'Connected' : 'Disconnected',
            timestamp: new Date().toISOString() 
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'API error', 
            error: error.message 
        });
    }
});

// 404处理
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
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
    console.log(`Registrations API: http://localhost:${PORT}/api/registrations`);
});