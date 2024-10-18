const express = require('express');
const router = express.Router();
const { combine_rules, ruleToNode } = require('./astLogic');
const { evaluateAST } = require('./ruleEvaluator');

// Route for combining rules into an AST
router.post('/combine_rules', (req, res) => {
  const { rules, operator } = req.body;

  try {
    const combinedAST = combine_rules(rules, operator);
    res.json({ success: true, combinedAST });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Route for evaluating AST
router.post('/evaluate', (req, res) => {
  const { ast, data } = req.body;

  try {
    const result = evaluateAST(ast, data);
    res.json({ success: true, result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Route for converting rule to AST
router.post('/rule_to_node', (req, res) => {
  const { rule } = req.body;

  try {
    const ast = ruleToNode(rule);
    res.json({ success: true, ast });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
