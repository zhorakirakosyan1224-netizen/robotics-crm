const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: { group: true },
      orderBy: { id: 'desc' },
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await prisma.student.findUnique({
      where: { id: Number(id) },
      include: {
        group: { include: { teacher: true } },
        attendances: { orderBy: { date: 'desc' } },
        payments: { orderBy: { date: 'desc' } },
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Աշակերտը չի գտնվել' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createStudent = async (req, res) => {
  try {
    const { firstName, lastName, age, parentPhone, secondaryPhone, remainingClasses, status, groupId } = req.body;

    if (!firstName || !lastName || !parentPhone) {
      return res.status(400).json({ error: 'Անունը, ազգանունը և հեռախոսահամարը պարտադիր են' });
    }

    const parsedAge = age && !isNaN(Number(age)) ? Number(age) : null;
    const parsedClasses = remainingClasses !== undefined && remainingClasses !== '' && !isNaN(Number(remainingClasses)) ? Number(remainingClasses) : 8;
    const parsedGroupId = groupId && !isNaN(Number(groupId)) ? Number(groupId) : null;

    const newStudent = await prisma.student.create({
      data: {
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        age: parsedAge,
        parentPhone: String(parentPhone).trim(),
        secondaryPhone: secondaryPhone ? String(secondaryPhone).trim() : null,
        remainingClasses: parsedClasses,
        status: status || 'ACTIVE',
        groupId: parsedGroupId,
      },
    });

    res.status(201).json(newStudent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, age, parentPhone, secondaryPhone, remainingClasses, status, groupId } = req.body;

    const parsedAge = age && !isNaN(Number(age)) ? Number(age) : null;
    const parsedClasses = remainingClasses !== undefined && remainingClasses !== '' && !isNaN(Number(remainingClasses)) ? Number(remainingClasses) : 8;
    const parsedGroupId = groupId && !isNaN(Number(groupId)) ? Number(groupId) : null;

    const updated = await prisma.student.update({
      where: { id: Number(id) },
      data: {
        firstName,
        lastName,
        age: parsedAge,
        parentPhone,
        secondaryPhone: secondaryPhone || null,
        remainingClasses: parsedClasses,
        status,
        groupId: parsedGroupId,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.student.delete({ where: { id: Number(id) } });
    res.json({ message: 'Աշակերտը հաջողությամբ ջնջվեց' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getStudents, getStudentById, createStudent, updateStudent, deleteStudent };