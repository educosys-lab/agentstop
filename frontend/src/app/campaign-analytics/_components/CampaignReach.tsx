'use client';

import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';

type CampaignReachPropsType = {
	reach: number;
};

export function CampaignReach({ reach }: CampaignReachPropsType) {
	return (
		<Card className="flex flex-col">
			<CardHeader>
				<CardTitle className="text-xl font-semibold">Reach</CardTitle>
				<CardDescription>Total users reached with your campaign.</CardDescription>
			</CardHeader>

			<CardContent className="flex-1">
				<ChartContainer config={{}} className="mx-auto aspect-square max-h-[250px]">
					<RadialBarChart
						data={[{ reach, fill: '#3B82F6' }]}
						startAngle={0}
						endAngle={360}
						innerRadius={80}
						outerRadius={110}
					>
						<PolarGrid
							gridType="circle"
							radialLines={false}
							stroke="none"
							className="first:fill-muted last:fill-background"
							polarRadius={[86, 74]}
						/>

						<RadialBar dataKey="reach" background cornerRadius={10} />

						<PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
							<Label
								content={({ viewBox }) => {
									if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
										return (
											<text
												x={viewBox.cx}
												y={viewBox.cy}
												textAnchor="middle"
												dominantBaseline="middle"
											>
												<tspan
													x={viewBox.cx}
													y={viewBox.cy}
													className="fill-foreground text-4xl font-bold"
												>
													{reach}
												</tspan>
												<tspan
													x={viewBox.cx}
													y={(viewBox.cy || 0) + 28}
													className="fill-muted-foreground"
												>
													Users Reached
												</tspan>
											</text>
										);
									}
								}}
							/>
						</PolarRadiusAxis>
					</RadialBarChart>
				</ChartContainer>
			</CardContent>

			{/* <CardFooter className="flex-col gap-2 text-sm">
				<div className="flex items-center gap-2 font-medium leading-none">
					5.2% growth this month <TrendingUp className="h-4 w-4" />
				</div>
				<div className="leading-none text-muted-foreground">Total messages sent in the last 6 months</div>
			</CardFooter> */}
		</Card>
	);
}
