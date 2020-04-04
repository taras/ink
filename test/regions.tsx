import React from "react";
import test from "ava";
import { renderToString } from "./helpers/render-to-string";
import chalk from "chalk";
import { Color, Box, Text } from "../src";
import { findByName } from "./helpers/regions";

test("findAll matches multiple regions", t => {
	const message = findByName(
		"message",
		"\x1b_message\x1b[Hello\x1b_/message\x1b[ \x1b_message\x1b[World\x1b_/message\x1b["
	);

	t.deepEqual(message, ["Hello", "World"]);
});

test("Text wraps in a region", t => {
	const output = renderToString(<Text name="greeting">Hello World</Text>);

	t.is(output, "\x1b_greeting\x1b[Hello World\x1b_/greeting\x1b[");
});

test("Retrieving multiple regions", t => {
	const output = renderToString(
		<>
			<Text name="greeting">Hello</Text> <Text name="greeting">World</Text>
		</>
	);

	t.deepEqual(findByName("greeting", output), ["Hello", "World"]);
});

test("Box with multiple Color children", t => {
	const output = renderToString(
		<Box name="message">
			<Color red>Hello</Color> <Color blue>World</Color>
		</Box>
	);

	t.deepEqual(
		findByName("message", output),
		[`${chalk.red("Hello")} ${chalk.blue("World")}`]
	);
});

test("Getting Boxes inside of a Box", t => {
	const output = renderToString(
		<Box name="shoebox" flexDirection="column">
			<Box>
				<Text name="postcard">Paris</Text>
			</Box>
			<Box name="pin">
				<Text>Vote</Text>
			</Box>
		</Box>
	);

	t.deepEqual(findByName("postcard", output), ["Paris"]);
	t.deepEqual(findByName("pin", output), ["Vote"]);
});

test("Getting children of other parent regions", t => {
	const output = renderToString(
		<>
			<Box name="A">
				<Text name="text">First</Text>
			</Box>
			<Box name="B">
				<Text name="text">Second</Text>
			</Box>
		</>
	);

	t.deepEqual(findByName("A text", output), ["First"]);
	t.deepEqual(findByName("B text", output), ["Second"]);
});
