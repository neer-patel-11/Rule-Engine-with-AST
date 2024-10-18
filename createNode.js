// Define Node class to represent AST nodes
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
      const left = nextToken();  
      const operator = nextToken();
      const right = nextToken();  
  
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

  function ruleToNode(ruleString)
  {
    const tokens = tokenize(ruleString);
    const ast = parseExpression(tokens);    
    return ast
  }


function convertKeysToLowercase(obj) {
    const newObj = {};
    for (const key of Object.keys(obj)) {
      newObj[key.toLowerCase()] = obj[key];
    }
    return newObj;
  }
  
function combineASTs(asts, operator) {
  let combinedNode = asts[0]; 
  for (let i = 1; i < asts.length; i++) {
    combinedNode = new Node('operator', operator, combinedNode, asts[i]);  
  }
  return combinedNode;
}

// Main function to combine multiple rule strings into one AST based on user-specified operator
function combine_rules(rules, operator) {
  const asts = rules.map(rule => ruleToNode(rule));  // Convert each rule to an AST

  // Combine all ASTs into one using the user-specified operator
  const combinedAST = combineASTs(asts, operator.toLowerCase());  // Ensure operator is lowercase for consistency
  
  return optimizeAST(combinedAST);  // Return the root node of the combined AST
}
  // Function to evaluate the AST against user data
  function evaluateAST(node, data) {
    data = convertKeysToLowercase(data);

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

      if (node.value === 'and') {  
        
        return evaluateAST(node.left, data) && evaluateAST(node.right, data);
      } 
      else if (node.value === 'or') {  // Case-insensitive OR
        return evaluateAST(node.left, data) || evaluateAST(node.right, data);
      }
  
    }
  }


function optimizeAST(node) {
  if (!node || node.type === 'operand') return node;  // Base case for recursion: return operand nodes as-is

  // Recursively optimize the left and right children
  const leftOptimized = optimizeAST(node.left);
  const rightOptimized = optimizeAST(node.right);

  // Short-circuiting logic for AND and OR nodes
  if (node.type === 'operator') {
    // For AND, if any child is False, the result is always False
    if (node.value === 'and') {
      if (isConstantFalse(leftOptimized)) return leftOptimized;
      if (isConstantFalse(rightOptimized)) return rightOptimized;
      if (isConstantTrue(leftOptimized)) return rightOptimized;  // True AND x => x
      if (isConstantTrue(rightOptimized)) return leftOptimized;  // x AND True => x
    }

    // For OR, if any child is True, the result is always True
    if (node.value === 'or') {
      if (isConstantTrue(leftOptimized)) return leftOptimized;
      if (isConstantTrue(rightOptimized)) return rightOptimized;
      if (isConstantFalse(leftOptimized)) return rightOptimized;  // False OR x => x
      if (isConstantFalse(rightOptimized)) return leftOptimized;  // x OR False => x
    }
  }

  // Create a new optimized node if no short-circuiting occurred
  return new Node(node.type, node.value, leftOptimized, rightOptimized);
}


function isConstantTrue(node) {
  return node.type === 'operand' && node.value === 'true';
}

function isConstantFalse(node) {
  return node.type === 'operand' && node.value === 'false';
}



const rules = [
  "age > 30 AND department == 'Sales'",
  "age < 25 AND department == 'Marketing'",
  "salary > 50000 OR experience > 5"
];

// Combine the rules using 'OR' operator
const combinedAST = combine_rules(rules, 'Or');


console.log(combinedAST)

let userData = { aGe: 35, sAlary: 40000, depaRtment: 'Sales', Experience: 1 };


// Evaluate the optimized AST
const isEligible = evaluateAST(combinedAST, userData);
console.log(isEligible);  // Output will depend on userData and combined rules
  