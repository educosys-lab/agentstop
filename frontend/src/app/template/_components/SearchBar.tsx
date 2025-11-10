import { Search } from 'lucide-react';

type SearchBarProps = {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
};

export const SearchBar = ({ searchQuery, setSearchQuery }: SearchBarProps) => {
	return (
		<section className="mx-4 mb-8 flex w-full max-w-4xl items-center rounded-xl bg-gray-800 bg-opacity-70 p-4 shadow-xl sm:mx-0 sm:mb-12 sm:rounded-2xl sm:p-6">
			<div className="relative w-full">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-200" size={18} />
				<input
					type="text"
					placeholder="Search templates..."
					className="w-full rounded-lg border border-blue-400 bg-gray-900 bg-opacity-70 p-3 pl-10 pr-4 text-sm text-white placeholder-sky-200 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 sm:rounded-xl sm:text-base"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
			</div>
		</section>
	);
};
