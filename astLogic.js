// AST Logic
class Node {
  constructor(type, value = null, left = null, right = null) {
    this.type = type;  // 'operator' or 'operand'
    this.value = value;  // e.g., 'age > 30' for operand, 'AND' or 'OR' for operator
    this.left = left;  // Left child node
    this.right = right;  // Right child node
  }
}

function tokenize(ruleString) {
  const regex = /\s*(>=|<=|==|!=|[><]=?|[()&|]|[\w]+|\'[^\']*\'|\"[^\"]*\")\s*/g;
  return ruleString.match(regex).map(token => token.trim()).filter(token => token.length > 0);
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

// Exports
module.exports = {
  Node,
  ruleToNode,
  combine_rules,
};
