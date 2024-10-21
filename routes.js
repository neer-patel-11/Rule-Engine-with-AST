const express = require('express');
const router = express.Router();
const { combine_rules, ruleToNode } = require('./astLogic');
const { evaluateAST } = require('./ruleEvaluator');
const { saveAST, retrieveAST } = require('./astLogic');  // Import AST logic

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
router.post('/evaluate',async (req, res) => {
  let { ast, data } = req.body;
  ast = JSON.parse(ast)
  data = JSON.parse(data)

  try {
    const result =await evaluateAST(ast, data);
    res.json({ success: true, result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
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


// Route to save AST
router.post('/save-ast', async (req, res) => {
    try {
        const { ast } = req.body;  // AST in request body
        const node = ruleToNode(ast);  
        const nodeId = await saveAST(node);  // Save the AST
        res.status(200).json({ message: 'AST saved successfully', nodeId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save AST', details: error });
    }
});

// Route to retrieve AST by ID
router.get('/retrieve-ast/:id', async (req, res) => {
    try {
        const ast = await retrieveAST(req.params.id);  // Retrieve AST by ID
        // console.log(ast)
        res.status(200).json({ ast });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve AST', details: error });
    }
});


module.exports = router;
