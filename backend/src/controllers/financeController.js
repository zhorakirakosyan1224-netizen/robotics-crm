const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addPayment = async (req, res) => {
  try {
    const { studentId, amount, classesAdded } = req.body;

    // 1. Գրանցել վճարումը
    const payment = await prisma.payment.create({
      data: {
        studentId: parseInt(studentId, 10),
        amount: parseFloat(amount),
        classesAdded: parseInt(classesAdded, 10),
      },
    });

    // 2. Ավելացնել դասերը
    await prisma.student.update({
      where: { id: parseInt(studentId, 10) },
      data: { remainingClasses: { increment: parseInt(classesAdded, 10) } },
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFinanceSummary = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: { student: true },
      orderBy: { date: 'desc' },
    });

    const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({ totalIncome, payments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addPayment, getFinanceSummary };