export type AxiosResult<T> =
	| { data: T; isError: false; message: string }
	| { data: null; isError: true; message: string };
