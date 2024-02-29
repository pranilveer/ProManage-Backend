const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['High', 'Moderate', 'Low'],
        required: true
    },
    checklist: [
        {
            text: {
                type: String,
                required: true
            },
            isChecked: {
                type: Boolean,
                default: false
            }
        }
    ],
    dueDate: {
        type: Date,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
