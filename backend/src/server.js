const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const financeRoutes = require('./routes/financeRoutes');
const groupRoutes = require('./routes/groupRoutes');
const teacherRoutes = require('./routes/teacherRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/teachers', teacherRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Robotics CRM Backend running on port ${PORT}`));