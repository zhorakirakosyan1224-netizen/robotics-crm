const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTeachers = async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany({
      include: { groups: true },
      orderBy: { id: 'desc' },
    });
    res.json(teachers);
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ error: error.message });
  }
};

const createTeacher = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    if (!firstName || !lastName || !phone) {
      return res.status(400).json({ error: 'Անունը, ազգանունը և հեռախոսահամարը պարտադիր են' });
    }
    const teacher = await prisma.teacher.create({
      data: {
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        phone: String(phone).trim(),
      },
    });
    res.status(201).json(teacher);
  } catch (error) {
    console.error('Create teacher error:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone } = req.body;
    const updated = await prisma.teacher.update({
      where: { id: Number(id) },
      data: { firstName, lastName, phone },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.teacher.delete({ where: { id: Number(id) } });
    res.json({ message: 'Դասատուն ջնջվեց' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getTeachers, createTeacher, updateTeacher, deleteTeacher };