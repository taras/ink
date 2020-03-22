import {ReactNode} from 'react';
import {
	unstable_scheduleCallback as schedulePassiveEffects,
	unstable_cancelCallback as cancelPassiveEffects
} from 'scheduler';
import ReactReconciler, {HostConfig} from 'react-reconciler';
import {
	createNode,
	createTextNode,
	appendChildNode,
	insertBeforeNode,
	removeChildNode,
	setAttribute,
	setStyle,
	setTextContent,
	NodeNames,
	ExperimentalDOMNode
} from './dom';

const NO_CONTEXT = true;

interface Props {
	children: ReactNode;
}

const hostConfig: HostConfig<NodeNames, Props, ExperimentalDOMNode, any, any, any, any, any, any, any, any, any> = {
	// @ts-ignore
	schedulePassiveEffects,
	cancelPassiveEffects,
	now: Date.now,
	getRootHostContext: () => NO_CONTEXT,
	prepareForCommit: () => {},
	resetAfterCommit: rootNode => {
		// Since renders are throttled at the instance level and <Static> component children
		// are rendered only once and then get deleted, we need an escape hatch to
		// trigger an immediate render to ensure <Static> children are written to output before they get erased
		if (rootNode.isStaticDirty) {
			rootNode.isStaticDirty = false;
			rootNode.onImmediateRender();
			return;
		}

		rootNode.onRender();
	},
	getChildHostContext: () => NO_CONTEXT,
	shouldSetTextContent: (type, props) => {
		return typeof props.children === 'string' || typeof props.children === 'number';
	},
	createInstance: (type, newProps) => {
		const node = createNode(type);

		for (const [key, value] of Object.entries(newProps)) {
			if (key === 'children') {
				if (typeof value === 'string' || typeof value === 'number') {
					if (type === 'div') {
						// Text node must be wrapped in another node, so that text can be aligned within container
						const textNode = createNode('div');
						setTextContent(textNode, String(value));
						appendChildNode(node, textNode);
					}

					if (type === 'span') {
						setTextContent(node, String(value));
					}
				}
			} else if (key === 'style') {
				setStyle(node, value);
			} else if (key === 'unstable__transformChildren') {
				node.unstable__transformChildren = value;
			} else if (key === 'unstable__static') {
				node.unstable__static = true;
			} else {
				setAttribute(node, key, value);
			}
		}

		return node;
	},
	createTextInstance: createTextNode,
	resetTextContent: node => {
		if (node.textContent) {
			node.textContent = '';
		}

		if (node.childNodes.length > 0) {
			for (const childNode of node.childNodes) {
				removeChildNode(node, childNode);
			}
		}
	},
	getPublicInstance: instance => instance,
	appendInitialChild: appendChildNode,
	appendChild: appendChildNode,
	insertBefore: insertBeforeNode,
	finalizeInitialChildren: (node, type, props, rootNode) => {
		if (node.unstable__static) {
			rootNode.isStaticDirty = true;
		}

		return false;
	},
	supportsMutation: true,
	appendChildToContainer: appendChildNode,
	insertInContainerBefore: insertBeforeNode,
	removeChildFromContainer: removeChildNode,
	prepareUpdate: (node, _type, _oldProps, _newProps, rootNode) => {
		if (node.unstable__static) {
			rootNode.isStaticDirty = true;
		}

		return true;
	},
	commitUpdate: (node, _updatePayload, type, _oldProps, newProps) => {
		for (const [key, value] of Object.entries(newProps)) {
			if (key === 'children') {
				if (typeof value === 'string' || typeof value === 'number') {
					if (type === 'div') {
						// Text node must be wrapped in another node, so that text can be aligned within container
						// If there's no such node, a new one must be created
						if (node.childNodes.length === 0) {
							const textNode = createNode('div');
							setTextContent(textNode, String(value));
							appendChildNode(node, textNode);
						} else {
							setTextContent(node.childNodes[0], String(value));
						}
					}

					if (type === 'span') {
						setTextContent(node, String(value));
					}
				}
			} else if (key === 'style') {
				setStyle(node, value);
			} else if (key === 'unstable__transformChildren') {
				node.unstable__transformChildren = value;
			} else if (key === 'unstable__static') {
				node.unstable__static = true;
			} else {
				setAttribute(node, key, value);
			}
		}
	},
	commitTextUpdate: (node, oldText, newText) => {
		setTextContent(node, newText);
	},
	removeChild: removeChildNode
};

export default ReactReconciler(hostConfig); // eslint-disable-line new-cap
