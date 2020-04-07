import {render} from '../../src';

// Fake process.stdout
interface Stream {
	output: string;
	columns: number;
	write(str: string): void;
	get(): string;
}

const createStream: (options: { columns: number }) => Stream = ({
	columns
}) => {
	let output = '';
	return {
		output,
		columns,
		write(str: string) {
			output = str;
		},
		get() {
			return output;
		}
	};
};

interface RenderToStringOptions {
	columns: number;
	includeRegions: boolean;
	experimental: boolean;
}

export const renderToString: (
	node: JSX.Element,
	options?: Partial<RenderToStringOptions>
) => string = (node, _options) => {
	const options: RenderToStringOptions = {
		..._options,
		...{
			columns: 100,
			includeRegions: true,
			experimental: process.env.EXPERIMENTAL === 'true'
		}
	};

	const stream = createStream(options);

	render(node, {
		// @ts-ignore
		stdout: stream,
		debug: true,
		experimental: options.experimental,
		includeRegions: options.includeRegions
	});

	return stream.get();
};
