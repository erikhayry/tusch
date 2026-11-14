import stylelint from 'stylelint';

const ruleName = 'tusch/outline-focus-visible';
const messages = stylelint.utils.ruleMessages(ruleName, {
	rejected: (prop) =>
		`Unexpected "${prop}" outside :focus-visible: a resting outline breaks REQ-038`,
});

// No built-in rule looks at the selector and the property together.
const ruleFunction = (primary) => (root, result) => {
	if (!primary) return;
	root.walkDecls(/^outline(-|$)/i, (decl) => {
		for (let node = decl.parent; node; node = node.parent) {
			if (node.type === 'rule' && /:focus-visible/.test(node.selector)) return;
		}
		stylelint.utils.report({
			ruleName,
			result,
			node: decl,
			message: messages.rejected(decl.prop),
		});
	});
};
ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;

export default stylelint.createPlugin(ruleName, ruleFunction);
