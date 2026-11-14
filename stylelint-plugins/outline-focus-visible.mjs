import stylelint from 'stylelint';

const outlineRule = 'tusch/outline-focus-visible';
const outlineMessages = stylelint.utils.ruleMessages(outlineRule, {
	rejected: (prop) =>
		`Unexpected "${prop}" outside :focus-visible: a resting outline breaks REQ-038`,
});

const tokenRule = 'tusch/custom-property-in-root';
const tokenMessages = stylelint.utils.ruleMessages(tokenRule, {
	rejected: (prop) => `Unexpected "${prop}" outside :root: raw values live in the token block`,
});

// `:not(:focus-visible)` matches the resting state, so it must not count.
const withoutNegations = (selector) => {
	let previous;
	let current = selector;
	do {
		previous = current;
		current = current.replace(/:not\([^()]*(?:\([^()]*\)[^()]*)*\)/g, '');
	} while (current !== previous);
	return current;
};

// Every selector in the list must be a focus-visible one, or `a, b:focus-visible`
// would give `a` a resting outline.
const isFocusVisibleRule = (rule) =>
	rule.selectors.every((selector) => withoutNegations(selector).includes(':focus-visible'));

const ancestorRules = (node) => {
	const rules = [];
	for (let parent = node.parent; parent; parent = parent.parent) {
		if (parent.type === 'rule') rules.push(parent);
	}
	return rules;
};

// No built-in rule looks at the selector and the property together.
const outlineFunction = (primary) => (root, result) => {
	if (!primary) return;
	root.walkDecls(/^outline(-|$)/i, (decl) => {
		if (ancestorRules(decl).some(isFocusVisibleRule)) return;
		stylelint.utils.report({
			ruleName: outlineRule,
			result,
			node: decl,
			message: outlineMessages.rejected(decl.prop),
		});
	});
};
outlineFunction.ruleName = outlineRule;
outlineFunction.messages = outlineMessages;

const tokenFunction = (primary) => (root, result) => {
	if (!primary) return;
	root.walkDecls(/^--/, (decl) => {
		const [rule] = ancestorRules(decl);
		if (rule && rule.selector.trim() === ':root') return;
		stylelint.utils.report({
			ruleName: tokenRule,
			result,
			node: decl,
			message: tokenMessages.rejected(decl.prop),
		});
	});
};
tokenFunction.ruleName = tokenRule;
tokenFunction.messages = tokenMessages;

export default [
	stylelint.createPlugin(outlineRule, outlineFunction),
	stylelint.createPlugin(tokenRule, tokenFunction),
];
