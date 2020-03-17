import { render } from "../../build";
import { DOMNode } from "../../build/dom";
import { ExperimentalDOMNode } from "../../build/experimental/dom";

// Fake process.stdout
class Stream {
	output: string = "";
	columns: number;

	constructor({ columns }) {
		this.columns = columns || 100;
	}

	write(str: string) {
		this.output = str;
	}

	get() {
		return this.output;
	}
}

const renderToString: (
	node: DOMNode | ExperimentalDOMNode,
	options: { columns?: number }
) => string = (node, { columns } = {}) => {
	const stream = new Stream({ columns });

	render(node, {
		// @ts-ignore
		stdout: stream,
		debug: true,
		experimental: process.env.EXPERIMENTAL === "true"
	});

	return stream.get();
};

export default renderToString;
