const AuthorController = require('../../controllers/AuthorController');
const express = require('express');

const router = express.Router();


router.get('/test', (req, res) => res.json({ message: "Authors Routes Works" }));

router.get('/',AuthorController.getAllAuthors);
router.post('/',AuthorController.createAuthor);
//Dates logic
router.post('/dates/logic',AuthorController.createWorkDaysAndHours);
router.get('/all/dates', AuthorController.getAddDatesAndTimes);
// Retrieve a single Tutorial with id
// router.get("/:id", TutorialController.findOne);
// Update an Author with id
router.put("/:id", AuthorController.updateAuthor);
// Delete an Author with id
router.delete("/:id", AuthorController.deleteAuthor);



module.exports = router;