import ReactJson from 'react-json-view';

type JsonViewerPropsType = {
	data: object;
	isCopyEnabled?: boolean;
	className?: string;
};

export default function JsonViewer({ data, isCopyEnabled = false, className }: JsonViewerPropsType) {
	return (
		<div className={className}>
			<ReactJson
				src={data}
				displayDataTypes={false}
				indentWidth={8}
				displayObjectSize={false}
				theme="chalk"
				iconStyle="triangle"
				enableClipboard={isCopyEnabled}
				style={{
					backgroundColor: 'transparent',
				}}
			/>
		</div>
	);
}
