import Yoga from 'yoga-layout-prebuilt';

export default (yogaNode: Yoga.Node) => {
	return yogaNode.getComputedWidth() - (yogaNode.getComputedPadding() * 2);
};
