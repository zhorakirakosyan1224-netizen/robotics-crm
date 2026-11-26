const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const markAttendance = async (req, res) => {
  try {
    const { studentId, date, status } = req.body;

    if (!studentId || !date || !status) {
      return res.status(400).json({ error: 'Բոլոր դաշտերը պարտադիր են' });
    }

    const parsedDate = new Date(`${date}T12:00:00.000Z`);

    const attendance = await prisma.attendance.create({
      data: {
        studentId: Number(studentId),
        date: parsedDate,
        status,
      },
    });

    if (status === 'PRESENT') {
      await prisma.student.update({
        where: { id: Number(studentId) },
        data: {
          remainingClasses: {
            decrement: 1,
          },
        },
      });
    }

    res.status(201).json(attendance);
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ error: error.message });
  }
};

const getAttendance = async (req, res) => {
  try {
    const list = await prisma.attendance.findMany({
      include: { student: true },
      orderBy: { date: 'desc' },
    });
    res.json(list);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { markAttendance, getAttendance };