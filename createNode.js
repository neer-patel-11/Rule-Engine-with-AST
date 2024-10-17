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
      if (index < tokens.length) {
        if (tokens[index].startsWith("'") ||  tokens[index].startsWith('"') ) {
            return tokens[index++];
        }

        return tokens[index++].toLowerCase();  // Return the token as is (without lowercase here)
      }
      return null;  // Return null if there are no more tokens
    }
  
    function peekToken() {
      if (index < tokens.length) {
        if (tokens[index].startsWith("'") ||  tokens[index].startsWith('"') ) {
            return tokens[index];
        }

        return tokens[index].toLowerCase();
      }
      return null;  // Return null if there are no more tokens
    }
  
    // Parse an operand (e.g., 'age >= 10')
    function parseOperand() {
      const left = nextToken();  // Field should be case-insensitive
      const operator = nextToken();  // Operator should be case-insensitive
      const right = nextToken();  // Keep the value case-sensitive (e.g., 'Sales')
      
      // Handle quoted strings properly for values
      if ((right.startsWith("'") && right.endsWith("'")) || (right.startsWith('"') && right.endsWith('"'))) {
        return new Node('operand', `${left} ${operator} ${right}`);  // Preserve quotes in the value
      } else {
        return new Node('operand', `${left} ${operator} ${right}`);
      }
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
  
      while (peekToken() && peekToken()=== 'and') {  // Case-insensitive AND
        const operator = nextToken();  // AND
        const rightNode = parsePrimary();  // Parse the right-hand side for AND
        node = new Node('operator', operator, node, rightNode);
      }
  
      return node;
    }
  
    // Parse OR expressions (lower precedence than AND)
    function parseLogicalExpression() {
      let node = parseAndExpression(); // Parse AND first, as it has higher precedence
  
      while (peekToken() && peekToken() === 'or') {  // Case-insensitive OR
        const operator = nextToken();  // OR
        const rightNode = parseAndExpression();  // Parse the right-hand side for OR
        node = new Node('operator', operator, node, rightNode);
      }
  
      return node;
    }
  
    return parseLogicalExpression();
  }

  // Function to convert keys in userData to lowercase for case-insensitive matching
function convertKeysToLowercase(obj) {
    const newObj = {};
    for (const key of Object.keys(obj)) {
      newObj[key.toLowerCase()] = obj[key];
    }
    return newObj;
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
  
      // Convert the field to lowercase to handle case-insensitivity for field names
      const dataValue = data[field.toLowerCase()];  // Case-insensitive field access
    //   console.log(field, operator, value, dataValue);
  
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
  
      if (node.value === 'and') {  // Case-insensitive AND
        return leftResult && rightResult;
      } else if (node.value === 'or') {  // Case-insensitive OR
        return leftResult || rightResult;
      }
    }
  }
  
  // Example usage:
  
  // Define the rule string (with mixed case for demonstration)
  const ruleString = "((age > 30 AND dePartment == 'Sales') OR (age < 25 AND department == 'Marketing')) AND (salary > 50000 OR exPerience > 5)";
  
  // Tokenize and parse the rule string into an AST
  const tokens = tokenize(ruleString);
  const ast = parseExpression(tokens);
  console.log(ast);
  
  // Define sample user data (case-insensitive keys)
  let userData = { aGe: 32, sAlary: 42000, depaRtment: 'Sales', Experience: 13 };
  
// Convert the keys of userData to lowercase for case-insensitive matching
   userData = convertKeysToLowercase(userData);
  // Evaluate the rule against the user's data
  const isEligible = evaluateAST(ast, userData);
  
  console.log(isEligible);  // Output: true, because the rule is satisfied
  