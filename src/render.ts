import { ReactNode } from "react";
import { WriteStream, ReadStream } from "tty";
import { Ink, createInk, InkOptions } from "./ink";
import { createExperimentalInk } from "./experimental/createExperimentalInk";
import instances from "./instances";

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

export default (node: ReactNode, options: WriteStream | RenderOptions) => {
	const defaults = {
		experimental: false,
		...options
	};

	const inkOptions: InkOptions = {
		stdout: process.stdout,
		stdin: process.stdin,
		debug: false,
		exitOnCtrlC: true,
		...(options instanceof WriteStream ? streamToOptions(options) : options)
	};

	const { stdout } = inkOptions;

	const instance = retrieveCachedInstance(stdout, () =>
		defaults.experimental
			? createExperimentalInk(inkOptions)
			: createInk(inkOptions)
	);

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

function retrieveCachedInstance(
	stdout: WriteStream,
	createInstance: () => Ink
) {
	let instance: Ink;
	if (instances.has(stdout)) {
		instance = instances.get(stdout);
	} else {
		instance = createInstance();
		instances.set(stdout, instance);
	}
	return instance;
}
