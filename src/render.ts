import { ReactNode } from "react";
import { WriteStream, ReadStream } from "tty";
import { Ink, createInk, InkOptions } from "./ink";
import { createExperimentalInk } from "./experimental/createExperimentalInk";
import instances from "./instances";
import { ExperimentalDOMNode } from "./experimental/dom";
import { DOMNode } from "./dom";

export interface RenderOptions {
	stdout?: WriteStream;
	stdin?: ReadStream;
	debug?: boolean;
	exitOnCtrlC?: boolean;
	experimental?: boolean;
}

interface TtyStreams {
	stdout: WriteStream;
	stdin: NodeJS.ReadStream;
}

interface InkControls<T> {
	rerender?: Ink<T>["render"];
	unmount?: Ink<T>["unmount"];
	waitUntilExit?: Ink<T>["waitUntilExit"];
	cleanup?: () => void;
}

type RenderFunction = <T extends WriteStream | RenderOptions = {}>(
	node: ReactNode,
	options?: T
) => InkControls<
	T extends { experimental: true } ? ExperimentalDOMNode : DOMNode
>;

const render: RenderFunction = (
	node,
	options
): InkControls<DOMNode | ExperimentalDOMNode> => {
	const defaults = {
		experimental: false,
		...(options ?? {})
	};

	const inkOptions: InkOptions = {
		stdout: process.stdout,
		stdin: process.stdin,
		debug: false,
		exitOnCtrlC: true,
		waitUntilExit: () => instance.exitPromise,
		...(options instanceof WriteStream ? streamToOptions(options) : options)
	};

	const { stdout } = inkOptions;

	let instance: Ink<DOMNode | ExperimentalDOMNode>;
	if (defaults.experimental) {
		instance = retrieveCachedInstance<ExperimentalDOMNode>(stdout, () =>
			createExperimentalInk(inkOptions)
		);
	} else {
		instance = retrieveCachedInstance<DOMNode>(stdout, () =>
			createInk(inkOptions)
		);
	}

	instance.render(node);

	return {
		rerender: instance.render,
		unmount: () => instance.unmount(),
		waitUntilExit: instance.waitUntilExit,
		cleanup: () => instances.delete(inkOptions.stdout)
	};
};

function streamToOptions(stdout: WriteStream): TtyStreams {
	return {
		stdout,
		stdin: process.stdin
	};
}

function retrieveCachedInstance<T>(
	stdout: WriteStream,
	createInstance: () => Ink<T>
) {
	let instance: Ink<T>;
	if (instances.has(stdout)) {
		instance = instances.get(stdout);
	} else {
		instance = createInstance();
		instances.set(stdout, instance);
	}
	return instance;
}

export default render;
