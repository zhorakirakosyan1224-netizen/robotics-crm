const express = require('express');
const router = express.Router();
const {
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  updateGroupTeacher,
  addStudentToGroup,
  removeStudentFromGroup,
} = require('../controllers/groupController');

router.get('/', getGroups);
router.post('/', createGroup);
router.put('/remove-student', removeStudentFromGroup);
router.put('/:groupId/teacher', updateGroupTeacher);
router.put('/:groupId/add-student', addStudentToGroup);
router.put('/:groupId', updateGroup);
router.delete('/:groupId', deleteGroup);

module.exports = router;