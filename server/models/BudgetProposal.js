const mongoose = require('mongoose');

const budgetItemSchema = new mongoose.Schema({
    quantity: { 
        type: Number, 
        required: true,
        min: 1
    },
    unit: { 
        type: String, 
        required: true,
        trim: true
    },
    description: { 
        type: String, 
        required: true,
        trim: true
    },
    unitCost: { 
        type: Number, 
        required: true,
        min: 0
    },
    totalCost: { 
        type: Number,
        default: function() {
            return this.quantity * this.unitCost;
        }
    }
}, { _id: false });

const BudgetProposalSchema = new mongoose.Schema({
    // Basic identification
    nameOfRso: { 
        type: String, 
        required: true,
        trim: true
    },
    eventTitle: { 
        type: String, 
        required: true,
        trim: true,
        default: 'Budget Proposal'
    },
    
    // Budget items
    items: { 
        type: [budgetItemSchema],
        required: true,
        validate: {
            validator: function(v) {
                return v.length > 0 && v.every(item => 
                    item.quantity && item.unit && item.description && item.unitCost
                );
            },
            message: 'At least one valid budget item is required'
        }
    },
    
    // Financial summary
    grandTotal: { 
        type: Number, 
        required: true,
        min: 0
    },
    
    // Relationships
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    organization: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    
    // Form association
    associatedForm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Form',
        required: false
    },
    
    // Metadata
    createdAt: { 
        type: Date, 
        default: Date.now,
        immutable: true 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

BudgetProposalSchema.pre('save', function(next) {
    this.items.forEach(item => {
        if (!item.totalCost) {
            item.totalCost = item.quantity * item.unitCost;
        }
    });
    
    if (!this.grandTotal) {
        this.grandTotal = this.items.reduce(
            (sum, item) => sum + (item.totalCost || item.quantity * item.unitCost), 
            0
        );
    }
    
    this.updatedAt = new Date();
    next();
});

BudgetProposalSchema.index({ organization: 1, isActive: 1 });
BudgetProposalSchema.index({ associatedForm: 1 });

module.exports = mongoose.model('BudgetProposal', BudgetProposalSchema);