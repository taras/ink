import React from "react";
import { Box, Text, render } from "../..";


const Erase = () => (
	<Box flexDirection="column">
		<Text>A</Text>
		<Text>B</Text>
		<Text>C</Text>
	</Box>
);

process.stdout.rows = Number(process.argv[3]);
render(<Erase/>, {experimental: true});
