const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getGroups = async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      include: { students: true, teacher: true },
      orderBy: { startTime: 'asc' },
    });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createGroup = async (req, res) => {
  try {
    const { name, days, startTime, endTime, teacherId } = req.body;
    const parsedTeacherId =
      teacherId !== undefined && teacherId !== '' && teacherId !== null && !isNaN(Number(teacherId))
        ? Number(teacherId)
        : null;

    const group = await prisma.group.create({
      data: {
        name: String(name).trim(),
        days: Array.isArray(days) ? days.join(', ') : String(days || ''),
        startTime: startTime || '15:00',
        endTime: endTime || '16:30',
        teacherId: parsedTeacherId,
      },
    });
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Խմբի անվան, օրերի և ժամերի խմբագրում
const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, days, startTime, endTime } = req.body;

    const dataToUpdate = {};
    if (name !== undefined && String(name).trim() !== '') {
      dataToUpdate.name = String(name).trim();
    }
    if (days !== undefined) {
      dataToUpdate.days = Array.isArray(days) ? days.join(', ') : String(days);
    }
    if (startTime !== undefined) {
      dataToUpdate.startTime = startTime;
    }
    if (endTime !== undefined) {
      dataToUpdate.endTime = endTime;
    }

    const updated = await prisma.group.update({
      where: { id: Number(groupId) },
      data: dataToUpdate,
      include: { students: true, teacher: true },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Խմբի ջնջում (նախ աշակերտներին անջատելով խմբից)
const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const id = Number(groupId);

    await prisma.student.updateMany({
      where: { groupId: id },
      data: { groupId: null },
    });

    await prisma.group.delete({
      where: { id },
    });

    res.json({ message: 'Խումբը հաջողությամբ ջնջվեց' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Խմբի դասատուին նշանակել կամ փոխել
const updateGroupTeacher = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { teacherId } = req.body;
    const parsedTeacherId =
      teacherId !== undefined && teacherId !== '' && teacherId !== null && !isNaN(Number(teacherId))
        ? Number(teacherId)
        : null;

    const updated = await prisma.group.update({
      where: { id: Number(groupId) },
      data: { teacherId: parsedTeacherId },
      include: { students: true, teacher: true },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addStudentToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { studentId } = req.body;

    await prisma.student.update({
      where: { id: Number(studentId) },
      data: { groupId: Number(groupId) },
    });

    res.json({ message: 'Աշակերտը կցվեց խմբին' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeStudentFromGroup = async (req, res) => {
  try {
    const { studentId } = req.body;

    await prisma.student.update({
      where: { id: Number(studentId) },
      data: { groupId: null },
    });

    res.json({ message: 'Աշակերտը հանվեց խմբից' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  updateGroupTeacher,
  addStudentToGroup,
  removeStudentFromGroup,
};