'use client';

import { Cell, Pie, PieChart } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

type CampaignResponsePropsType = {
	response: number;
};

export function CampaignResponse({ response }: CampaignResponsePropsType) {
	const chartData = [
		{ name: 'Response (%)-', response: response, fill: '#3B82F6' },
		{ name: 'No Response (%)-', response: 100 - response, fill: '#10B981' },
	];

	return (
		<Card className="flex flex-col">
			<CardHeader>
				<CardTitle className="text-xl font-semibold">Response</CardTitle>
				<CardDescription>Response received from users.</CardDescription>
			</CardHeader>

			<CardContent className="flex-1">
				<ChartContainer config={{}} className="mx-auto aspect-square max-h-[250px]">
					<PieChart>
						<ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />

						<Pie data={chartData} dataKey="response" nameKey="name" innerRadius={45}>
							{chartData.map((entry, index) => (
								<Cell key={`slice-${index}`} fill={entry.fill} />
							))}
						</Pie>
					</PieChart>
				</ChartContainer>
			</CardContent>

			{/* <CardFooter className="flex-col gap-2 text-sm">
				<div className="flex items-center gap-2 font-medium leading-none">
					+5.2% growth this month <TrendingUp className="h-4 w-4" />
				</div>
				<div className="leading-none text-muted-foreground">Total messages sent across campaigns</div>
			</CardFooter> */}
		</Card>
	);
}
