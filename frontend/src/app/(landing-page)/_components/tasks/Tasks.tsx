'use client';

import AutoScroll from 'embla-carousel-auto-scroll';

import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

const tasksList = [
	'agent.svg',
	'trigger-cron.svg',
	'tool-redis.svg',
	'tool-github.svg',
	'google-docs-read.svg',
	'responder-chat.svg',
	'google-sheets-write.svg',
	'tool-mongodb.svg',
	'openai.svg',
	'tool-pinecone.svg',
	'responder-slack.svg',
	'google-calender-write.svg',
	'gmail-read.svg',
	'discord-send.svg',
	'trigger-telegram.svg',
];

export default function Tasks() {
	return (
		<section className="relative overflow-hidden bg-background-dark py-16">
			<div className="inline-flex w-full flex-nowrap">
				<Carousel
					opts={{ loop: true, align: 'center' }}
					plugins={[AutoScroll({ active: true, speed: 1 })]}
					className="w-full"
				>
					<CarouselContent>
						{tasksList.map((client, index) => (
							<CarouselItem
								key={index}
								className="basis-1/3 sm:basis-1/4 tablet:basis-1/6 laptop:basis-[14%] wide:basis-[12%]"
							>
								<img
									src={`/assets/images/logos/${client}`}
									alt={client}
									className="mx-auto h-18 object-contain"
								/>
							</CarouselItem>
						))}
					</CarouselContent>
				</Carousel>
			</div>
		</section>
	);
}
