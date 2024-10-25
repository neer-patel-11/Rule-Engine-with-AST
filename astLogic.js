// AST Logic
const AstNode = require('./astSchema');  // Import the AST schema
class Node {
  constructor(type, value = null, left = null, right = null) {
    this.type = type;  // 'operator' or 'operand'
    this.value = value;  // e.g., 'age > 30' for operand, 'AND' or 'OR' for operator
    this.left = left;  // Left child node
    this.right = right;  // Right child node
  }
}

// Function to convert JSON into Node structure
function jsonToNode(json) {
  if (!json || typeof json !== 'object') {
    throw new Error('Invalid JSON input');
  }

  const { type, value, left, right } = json;

  // Create the current node
  const node = new Node(type, value);

  // Recursively convert left and right if they exist
  if (left) {
    node.left = jsonToNode(left);  // Recursively convert left child
  }

  if (right) {
    node.right = jsonToNode(right);  // Recursively convert right child
  }

  return node;
}

function tokenize(ruleString) {
  const regex = /\s*(>=|<=|==|!=|=|[><]=?|[()&|]|[\w]+|\'[^\']*\'|\"[^\"]*\")\s*/g;  
  const tokens = ruleString.match(regex).map(token => token.trim()).filter(token => token.length > 0);  
  return tokens.map(token => token === '=' ? '==' : token);
}


function parseExpression(tokens) {
  let index = 0;

  function nextToken() {
    if (index < tokens.length) {
      if (tokens[index].startsWith("'") || tokens[index].startsWith('"')) {
        return tokens[index++];
      }
      return tokens[index++].toLowerCase();
    }
    return null;
  }

  function peekToken() {
    if (index < tokens.length) {
      if (tokens[index].startsWith("'") || tokens[index].startsWith('"')) {
        return tokens[index];
      }
      return tokens[index].toLowerCase();
    }
    return null;
  }

  function parseOperand() {
    const left = nextToken();
    const operator = nextToken();
    const right = nextToken();
    return new Node('operand', `${left} ${operator} ${right}`);
  }

  function parsePrimary() {
    if (peekToken() === '(') {
      nextToken();  // Skip '('
      const node = parseLogicalExpression();  // Recursively parse the inner expression
      nextToken();  // Skip ')'
      return node;
    }
    return parseOperand();
  }

  function parseAndExpression() {
    let node = parsePrimary();

    while (peekToken() && peekToken() === 'and') {
      const operator = nextToken();  // AND
      const rightNode = parsePrimary();
      node = new Node('operator', operator, node, rightNode);
    }
    return node;
  }

  function parseLogicalExpression() {
    let node = parseAndExpression();

    while (peekToken() && peekToken() === 'or') {
      const operator = nextToken();  // OR
      const rightNode = parseAndExpression();
      node = new Node('operator', operator, node, rightNode);
    }
    return node;
  }

  return parseLogicalExpression();
}

// Convert rule string to AST
function ruleToNode(ruleString) {
  const tokens = tokenize(ruleString);
  return parseExpression(tokens);
}

// Combine multiple ASTs into one based on the operator
function combineASTs(asts, operator) {
  let combinedNode = asts[0];
  for (let i = 1; i < asts.length; i++) {
    combinedNode = new Node('operator', operator, combinedNode, asts[i]);
  }
  return combinedNode;
}

// Main function to combine multiple rules into one AST
function combine_rules(rules, operator) {
  const asts = rules.map(rule => ruleToNode(rule));
  return combineASTs(asts, operator.toLowerCase());
}

// Function to save AST recursively to the database
async function saveAST(node) {
  if (!node) return null;
  // console.log(node)

  // Save left and right child nodes recursively
  const rightId = node.right ? await saveAST(node.right) : null;
  const leftId = node.left ? await saveAST(node.left) : null;

  // Create a new AST node document
  const astNode = new AstNode({
      type: node.type,
      value: node.value,
      left: leftId,
      right: rightId
  });

  // Save and return the node ID
  const savedNode = await astNode.save();
  // console.log(savedNode)
  return savedNode._id;
}

// Function to retrieve an AST from the database by ID
async function retrieveAST(nodeId) {
  const node = await AstNode.findById(nodeId).populate('left right').exec();  // Populate left and right child nodes
  if (!node) return null;

  return {
      type: node.type,
      value: node.value,
      left: node.left ? await retrieveAST(node.left._id) : null,
      right: node.right ? await retrieveAST(node.right._id) : null
  };
}

// Exports
module.exports = {
  Node,
  ruleToNode,
  combine_rules,
  saveAST,
  retrieveAST,
  jsonToNode
};
