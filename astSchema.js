const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for AST Node
const astNodeSchema = new Schema({
    type: { type: String, required: true },  // 'operator' or 'operand'
    value: { type: String, required: true },  // Operator ('and', 'or') or operand (e.g., 'age > 30')
    left: { type: Schema.Types.ObjectId, ref: 'AstNode' },  // Reference to left child node
    right: { type: Schema.Types.ObjectId, ref: 'AstNode' }  // Reference to right child node
});

// Create a model for the AST Node
const AstNode = mongoose.model('AstNode', astNodeSchema);

module.exports = AstNode;
