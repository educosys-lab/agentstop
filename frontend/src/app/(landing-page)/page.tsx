import dynamic from 'next/dynamic';

import Footer from '../_components/footer/Footer';
import Tasks from './_components/tasks/Tasks';
import Feature from './_components/feature/Feature';
import UseCases from './_components/use-cases/UseCases';

const DemoVideo = dynamic(() => import('./_components/demo-video/DemoVideo'), { ssr: false });
const Hero = dynamic(() => import('./_components/hero/Hero'), { ssr: false });
const NavBar = dynamic(() => import('../_components/navigation/NavBar'), { ssr: false });

export default function HomePage() {
	return (
		<>
			<NavBar page={'landing'} />
			<Hero />
			<Tasks />
			<Feature />
			<DemoVideo />
			<UseCases />
			<Footer />
		</>
	);
}
