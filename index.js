// Define Node class to represent AST nodes

class Node {
    constructor(type, value = null, left = null, right = null) {
      this.type = type;  // 'operator' or 'operand'
      this.value = value;  // e.g., 'age > 30' for operand, 'AND' or 'OR' for operator
      this.left = left;  // Left child node
      this.right = right;  // Right child node
    }
  }
  
  // Tokenizer to handle multi-character comparison operators and parentheses
  function tokenize(ruleString) {
    const regex = /\s*(>=|<=|==|!=|[><]=?|[()&|]|[\w]+|\'[^\']*\'|\"[^\"]*\")\s*/g;
    return ruleString.match(regex).map(token => token.trim()).filter(token => token.length > 0);
  }
  
  // Parse the tokens into an AST (Abstract Syntax Tree), handling parentheses and precedence
  function parseExpression(tokens) {
    let index = 0;
  
    // Helper functions
    function nextToken() {
      return tokens[index++];
    }
  
    function peekToken() {
      return tokens[index];
    }
  
    // Parse an operand (e.g., 'age >= 10')
    function parseOperand() {
      const left = nextToken();  // e.g., 'age'
      const operator = nextToken();  // e.g., '>=', '>'
      const right = nextToken();  // e.g., '10' or 'Sales'
      return new Node('operand', `${left} ${operator} ${right}`);
    }
  
    // Parse parentheses and sub-expressions
    function parsePrimary() {
      if (peekToken() === '(') {
        nextToken();  // Skip '('
        const node = parseLogicalExpression();  // Recursively parse the inner expression
        nextToken();  // Skip ')'
        return node;
      }
      return parseOperand();
    }
  
    // Parse AND expressions (higher precedence than OR)
    function parseAndExpression() {
      let node = parsePrimary();  // Parse the primary expression (operand or parentheses)
  
      while (peekToken() === 'AND') {
        const operator = nextToken();  // AND
        const rightNode = parsePrimary();  // Parse the right-hand side for AND
        node = new Node('operator', operator, node, rightNode);
      }
  
      return node;
    }
  
    // Parse OR expressions (lower precedence than AND)
    function parseLogicalExpression() {
      let node = parseAndExpression(); // Parse AND first, as it has higher precedence
  
      while (peekToken() === 'OR') {
        const operator = nextToken();  // OR
        const rightNode = parseAndExpression();  // Parse the right-hand side for OR
        node = new Node('operator', operator, node, rightNode);
      }
  
      return node;
    }
  
    return parseLogicalExpression();
  }
  
  // Function to evaluate the AST against user data
  function evaluateAST(node, data) {
    if (node.type === 'operand') {
      const [field, operator, ...valueParts] = node.value.split(' ');
      let value = valueParts.join(' ');  // Join in case the value is a string with spaces
  
      // If value is a string (starts and ends with a quote), remove the quotes
      if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);  // Remove single quotes
      } else if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);  // Remove double quotes
      }
  
      const dataValue = data[field];
  
      // Handle different operators for comparison
      switch (operator) {
        case '>': return dataValue > Number(value);
        case '<': return dataValue < Number(value);
        case '>=': return dataValue >= Number(value);
        case '<=': return dataValue <= Number(value);
        case '==': return dataValue == value;
        case '!=': return dataValue != value;
        default: return false;
      }
    } else if (node.type === 'operator') {
      const leftResult = evaluateAST(node.left, data);
      const rightResult = evaluateAST(node.right, data);
  
      if (node.value === 'AND') {
        return leftResult && rightResult;
      } else if (node.value === 'OR') {
        return leftResult || rightResult;
      }
    }
  }
  
  
  const ruleString = "((age > 30 AND department == 'Sales') OR (age < 25 AND department == 'Marketing')) AND (salary > 50000 OR experience > 5)";
  
  const tokens = tokenize(ruleString);
  const ast = parseExpression(tokens);
  
  console.log(ast)
  
  const userData = { age: 32, salary: 43000, department: 'Sales',experience :23 };
  

  const isEligible = evaluateAST(ast, userData);
  
  console.log(isEligible);  
  