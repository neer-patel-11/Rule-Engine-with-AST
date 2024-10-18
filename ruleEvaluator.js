function convertKeysToLowercase(obj) {
    const newObj = {};
    for (const key of Object.keys(obj)) {
      newObj[key.toLowerCase()] = obj[key];
    }
    return newObj;
  }
  
  // Function to evaluate AST
  function evaluateAST(node, data) {
    data = convertKeysToLowercase(data);
  
    if (node.type === 'operand') {
      const [field, operator, ...valueParts] = node.value.split(' ');
      let value = valueParts.join(' ');
  
      if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);  // Remove single quotes
      } else if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);  // Remove double quotes
      }
  
      const dataValue = data[field.toLowerCase()];
  
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
      } else if (node.value === 'or') {
        return evaluateAST(node.left, data) || evaluateAST(node.right, data);
      }
    }
  }
  
  module.exports = {
    evaluateAST,
  };
  