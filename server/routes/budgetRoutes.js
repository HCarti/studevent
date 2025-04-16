const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');

// ======================
// BUDGET PROPOSAL ROUTES
// ======================
router.post('/submit', budgetController.createBudgetProposal);
router.put('/:budgetId', budgetController.updateBudgetProposal);
router.get('/', budgetController.getBudgetProposals);
router.get('/:id', budgetController.getBudgetProposalById);
router.delete('/:id', budgetController.deleteBudgetProposal);

// Form association endpoints
router.post('/:budgetId/attach-to-form/:formId', budgetController.attachToForm);
router.post('/:budgetId/detach-from-form', budgetController.detachFromForm);

module.exports = router;