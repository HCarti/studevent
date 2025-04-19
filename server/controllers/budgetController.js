const BudgetProposal = require("../models/BudgetProposal");
const Form = require("../models/Form");
const mongoose = require("mongoose");

// Create new budget proposal
exports.createBudgetProposal = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, eventTitle, targetFormType, targetFormId } = req.body;
    
    // Validate budget items
    if (!items?.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'At least one budget item is required' });
    }

    // Resolve organization - comprehensive approach
    let organizationId, organizationName;

    // Scenario 1: Directly provided in request
    if (req.body.studentOrganization) {
      const org = await User.findOne({
        _id: req.body.studentOrganization,
        role: 'Organization'
      }).session(session);
      
      if (!org) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: 'Specified organization not found' });
      }
      
      organizationId = org._id;
      organizationName = org.organizationName;
    }
    // Scenario 2: From authenticated user (organization user)
    else if (req.user?.role === 'Organization') {
      organizationId = req.user._id;
      organizationName = req.user.organizationName;
    }
    // Scenario 3: From authenticated user (regular user with organization association)
    else if (req.user?.organizationId) {
      const org = await User.findById(req.user.organizationId).session(session);
      if (!org) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: 'Your associated organization not found' });
      }
      
      organizationId = org._id;
      organizationName = org.organizationName;
    }
    // Scenario 4: No organization could be determined
    else {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        error: 'Organization reference is required',
        details: 'Please specify an organization or ensure your account is properly associated with one'
      });
    }

    // Calculate grand total
    const grandTotal = items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitCost);
    }, 0);

    // Create new budget proposal
    const newBudget = new BudgetProposal({
      nameOfRso: organizationName || 'Organization',
      eventTitle: eventTitle || 'Budget Proposal',
      items: items.map(item => ({
        quantity: Number(item.quantity),
        unit: item.unit.trim(),
        description: item.description.trim(),
        unitCost: Number(item.unitCost),
        totalCost: Number(item.quantity * item.unitCost)
      })),
      grandTotal,
      createdBy: req.user._id,
      organization: organizationId,
      associatedForm: targetFormId || null,
      formType: targetFormType || null,
      isActive: true
    });

    await newBudget.save({ session });

    // If linked to an existing form, update the form
    if (targetFormId) {
      await Form.findByIdAndUpdate(
        targetFormId,
        {
          $set: {
            attachedBudget: newBudget._id,
            budgetAmount: grandTotal,
            budgetFrom: organizationName
          }
        },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Budget proposal created successfully',
      budget: newBudget,
      returnPath: req.body.returnPath
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error creating budget proposal:', error);
    res.status(500).json({ 
      error: 'Failed to create budget proposal',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update budget proposal
exports.updateBudgetProposal = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { budgetId } = req.params;
    const { items, eventTitle, status } = req.body;

    // Find and validate budget
    const budget = await BudgetProposal.findOne({
      _id: budgetId,
      $or: [
        { organization: req.user.organizationId },
        { createdBy: req.user._id }
      ]
    }).session(session);

    if (!budget) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Budget proposal not found' });
    }

    // Prevent updates to submitted/approved budgets
    if (budget.status === 'submitted' || budget.status === 'approved') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        error: 'Cannot update a submitted or approved budget' 
      });
    }

    // Update budget fields
    if (items) {
      budget.items = items.map(item => ({
        quantity: Number(item.quantity),
        unit: item.unit.trim(),
        description: item.description.trim(),
        unitCost: Number(item.unitCost),
        totalCost: Number(item.quantity * item.unitCost)
      }));
      budget.grandTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
    }

    if (eventTitle) budget.eventTitle = eventTitle;
    if (status) budget.status = status;
    budget.updatedAt = new Date();

    await budget.save({ session });

    // Update linked form if exists
    if (budget.associatedForm) {
      await Form.findByIdAndUpdate(
        budget.associatedForm,
        { $set: { budgetAmount: budget.grandTotal } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Budget proposal updated successfully',
      budget
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error updating budget proposal:', error);
    res.status(500).json({ 
      error: 'Failed to update budget proposal',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get budget proposals
exports.getBudgetProposals = async (req, res) => {
  try {
    let query = {};
    
    // Organization users see their org's budgets
    if (req.user.role === 'Organization') {
      query = { organization: req.user._id };
    } 
    // Regular users see budgets they created
    else {
      query = { createdBy: req.user._id };
    }

    // Admins can see all budgets
    if (req.user.role === 'Admin') {
      query = {};
    }

    const budgets = await BudgetProposal.find(query)
      .select('_id nameOfRso eventTitle grandTotal status createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json(budgets);
  } catch (error) {
    console.error('Error fetching budget proposals:', error);
    res.status(500).json({ 
      error: 'Failed to fetch budget proposals',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single budget proposal
exports.getBudgetProposalById = async (req, res) => {
  try {
    const budget = await BudgetProposal.findOne({
      _id: req.params.id,
      $or: [
        { organization: req.user.organizationId || req.user._id },
        { createdBy: req.user._id },
        req.user.organizationName ? { 
          nameOfRso: req.user.organizationName 
        } : {}
      ],
      isActive: true
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget proposal not found' });
    }

    res.status(200).json(budget);
  } catch (error) {
    console.error('Error fetching budget proposal:', error);
    res.status(500).json({ 
      error: 'Failed to fetch budget proposal',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete budget proposal
exports.deleteBudgetProposal = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const budget = await BudgetProposal.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
      status: 'draft'
    }).session(session);

    if (!budget) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Budget proposal not found or cannot be deleted' });
    }

    // Remove reference from form if attached
    if (budget.associatedForm) {
      await Form.findByIdAndUpdate(
        budget.associatedForm,
        { $unset: { attachedBudget: 1 } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Budget proposal deleted successfully'
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error deleting budget proposal:', error);
    res.status(500).json({ 
      error: 'Failed to delete budget proposal',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Attach budget to form
exports.attachToForm = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { budgetId, formId } = req.params;

    // Verify budget exists and belongs to user
    const budget = await BudgetProposal.findOne({
      _id: budgetId,
      $or: [
        { organization: req.user.organizationId },
        { createdBy: req.user._id }
      ]
    }).session(session);

    if (!budget) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Budget proposal not found' });
    }

    // Verify form exists and belongs to user
    const form = await Form.findOne({
      _id: formId,
      submittedBy: req.user._id
    }).session(session);

    if (!form) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Form not found' });
    }

    // Check if form type matches
    if (budget.formType && budget.formType !== form.formType) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        error: `Budget is for ${budget.formType} forms but form is ${form.formType}`
      });
    }

    // Update both records
    budget.associatedForm = form._id;
    budget.formType = form.formType;
    await budget.save({ session });

    form.attachedBudget = budget._id;
    form.budgetAmount = budget.grandTotal;
    form.budgetFrom = budget.nameOfRso;
    await form.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Budget successfully attached to form',
      budget,
      form
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error attaching budget to form:', error);
    res.status(500).json({ 
      error: 'Failed to attach budget to form',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Detach budget from form
exports.detachFromForm = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const budget = await BudgetProposal.findOneAndUpdate(
      {
        _id: req.params.budgetId,
        $or: [
          { organization: req.user.organizationId },
          { createdBy: req.user._id }
        ]
      },
      {
        $unset: { associatedForm: 1, formType: 1 }
      },
      { new: true, session }
    );

    if (!budget) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Budget proposal not found' });
    }

    // Update form if it exists
    if (budget.associatedForm) {
      await Form.findByIdAndUpdate(
        budget.associatedForm,
        {
          $unset: {
            attachedBudget: 1,
            budgetAmount: 1,
            budgetFrom: 1
          }
        },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Budget successfully detached from form',
      budget
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error detaching budget from form:', error);
    res.status(500).json({ 
      error: 'Failed to detach budget from form',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};