export const REGEX = {
	EMAIL: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,12})+$/,
	ONLY_LETTERS: /^[a-zA-Z]+[-'s]?[a-zA-Z ]+$/,

	GET_ARRAY_FROM_STRING: /\[([\s\S]*)\]/,
	GET_OBJECT_FROM_STRING: /\{([\s\S]*)\}/,
};
