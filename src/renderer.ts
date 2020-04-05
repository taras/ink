import Yoga, {YogaNode} from 'yoga-layout-prebuilt';
import {Output} from './output';
import {createNode, appendStaticNode, DOMElement, TEXT_NAME} from './dom';
import {buildLayout} from './build-layout';
import {renderNodeToOutput} from './render-node-to-output';
import {calculateWrappedText} from './calculate-wrapped-text';

// Since <Static> components can be placed anywhere in the tree, this helper finds and returns them
const getStaticNodes = (element: DOMElement): DOMElement[] => {
	const staticNodes: DOMElement[] = [];

	for (const childNode of element.childNodes) {
		if (childNode.nodeName !== TEXT_NAME) {
			if (childNode.unstable__static) {
				staticNodes.push(childNode);
			}

			if (
				Array.isArray(childNode.childNodes) &&
				childNode.childNodes.length > 0
			) {
				staticNodes.push(...getStaticNodes(childNode));
			}
		}
	}

	return staticNodes;
};

export interface InkRendererOutput {
	output: string;
	outputHeight: number;
	staticOutput: string;
}

export type InkRenderer = (node: DOMElement) => InkRendererOutput;

type RendererCreator = (options: {
	terminalWidth: number;
}) => (
	node: DOMElement
) => { output: string; outputHeight: number; staticOutput: string };

// Build layout, apply styles, build text output of all nodes and return it
export const createRenderer: RendererCreator = ({terminalWidth}) => {
	const config = Yoga.Config.create();

	// Used to free up memory used by last Yoga node tree
	let lastYogaNode: YogaNode;
	let lastStaticYogaNode: YogaNode;

	return (node: DOMElement) => {
		if (lastYogaNode) {
			lastYogaNode.freeRecursive();
		}

		if (lastStaticYogaNode) {
			lastStaticYogaNode.freeRecursive();
		}

		const staticElements = getStaticNodes(node);
		if (staticElements.length > 1) {
			if (process.env.NODE_ENV !== 'production') {
				console.error('Warning: There can only be one <Static> component');
			}
		}

		// <Static> component must be built and rendered separately, so that the layout of the other output is unaffected
		let staticOutput;
		if (staticElements.length === 1) {
			const rootNode = createNode('root');
			appendStaticNode(rootNode, staticElements[0]);

			const {yogaNode: staticYogaNode} = buildLayout(rootNode, {
				config,
				terminalWidth,
				skipStaticElements: false
			});

			if (staticYogaNode) {
				staticYogaNode.calculateLayout(undefined, undefined, Yoga.DIRECTION_LTR);
				calculateWrappedText(rootNode);
				staticYogaNode.calculateLayout(undefined, undefined, Yoga.DIRECTION_LTR);

				// Save current Yoga node tree to free up memory later
				lastStaticYogaNode = staticYogaNode;

				staticOutput = new Output({
					width: staticYogaNode.getComputedWidth(),
					height: staticYogaNode.getComputedHeight()
				});

				renderNodeToOutput(rootNode, staticOutput, {skipStaticElements: false});
			}
		}

		const {yogaNode} = buildLayout(node, {
			config,
			terminalWidth,
			skipStaticElements: true
		});

		if (yogaNode) {
			yogaNode.calculateLayout(undefined, undefined, Yoga.DIRECTION_LTR);
			calculateWrappedText(node);
			yogaNode.calculateLayout(undefined, undefined, Yoga.DIRECTION_LTR);

			// Save current node tree to free up memory later
			lastYogaNode = yogaNode;

			const output = new Output({
				width: yogaNode.getComputedWidth(),
				height: yogaNode.getComputedHeight()
			});

			renderNodeToOutput(node, output, {skipStaticElements: true});

			return {
				output: output.get(),
				outputHeight: output.getHeight(),
				staticOutput: staticOutput ? `${staticOutput.get()}\n` : ''
			};
		}

		return {
			output: '',
			outputHeight: 1,
			staticOutput: ''
		};
	};
};
