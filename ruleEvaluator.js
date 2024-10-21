const { jsonToNode } = require('./astLogic');  // Import AST logic

function convertKeysToLowercase(obj) {
    const newObj = {};
    for (const key of Object.keys(obj)) {
      newObj[key.toLowerCase()] = obj[key];
    }
    return newObj;
  }
  
  // Function to evaluate AST
  async function evaluateAST(ast, data) {
    data = convertKeysToLowercase(data);
    // console.log(data)
    ast = jsonToNode(ast)
    if (ast.type === 'operand') {
      const [field, operator, ...valueParts] = ast.value.split(' ');
      // console.log(field )
      let value = valueParts.join(' ');
      // console.log(value)
      if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);  // Remove single quotes
      } else if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);  // Remove double quotes
      }
  
      const dataValue = data[field.toLowerCase()];
      // console.log(dataValue)
      switch (operator) {
        case '>': return dataValue > Number(value);
        case '<': return dataValue < Number(value);
        case '>=': return dataValue >= Number(value);
        case '<=': return dataValue <= Number(value);
        case '==': return dataValue == value;
        case '!=': return dataValue != value;
        default: return false;
      }
    } else if (ast.type == 'operator') {
      if (ast.value.toLowerCase() == 'and') {
        return await evaluateAST(ast.left, data) && await evaluateAST(ast.right, data);
      } else if (ast.value.toLowerCase() == 'or') {
        return await evaluateAST(ast.left, data) || await evaluateAST(ast.right, data);
      }
    }
  }
  
  module.exports = {
    evaluateAST,
  };
  