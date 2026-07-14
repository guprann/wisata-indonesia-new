const express = require('express');
const ctrl = require('../controllers/destinasiController');

const router = express.Router();

router.get('/stats', ctrl.stats);
router.get('/meta', ctrl.meta);

router.get('/destinasi', ctrl.list);
router.get('/destinasi/:id', ctrl.getOne);
router.post('/destinasi', ctrl.create);
router.post('/destinasi/:id/ask', ctrl.ask);
router.put('/destinasi/:id', ctrl.replace);
router.patch('/destinasi/:id', ctrl.update);
router.delete('/destinasi/:id', ctrl.remove);

module.exports = router;
