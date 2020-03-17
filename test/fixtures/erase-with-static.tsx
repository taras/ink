import React from "react";
import { Static, Box, Text, render } from "../..";

const EraseWithStatic = () => (
	<React.Fragment>
		<Static>
			<Text key="a">A</Text>
			<Text key="b">B</Text>
			<Text key="c">C</Text>
		</Static>

		<Box flexDirection="column">
			<Text>D</Text>
			<Text>E</Text>
			<Text>F</Text>
		</Box>
	</React.Fragment>
);

process.stdout.rows = Number(process.argv[3]);
render(<EraseWithStatic />, { experimental: true });
