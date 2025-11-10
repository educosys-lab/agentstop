import { AES, enc } from 'crypto-js';

const getDecryptionKey = async (caller: string): Promise<string | null> => {
	try {
		const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
		if (!ENCRYPTION_KEY) return null;

		return ENCRYPTION_KEY;
	} catch (error) {
		console.error(caller, error);
		return null;
	}
};

export const encryptString = async (props: { key?: string; value: string; caller: string }) => {
	try {
		const { key, value, caller } = props;

		const decryptionKey = key || (await getDecryptionKey(caller));
		if (!decryptionKey) return null;

		const encryptedValue = AES.encrypt(value, decryptionKey);
		return encryptedValue.toString();
	} catch (error) {
		console.error(props.caller, error);
		return null;
	}
};

export const decryptString = async (props: { key?: string; value: string; caller: string }) => {
	try {
		const { key, value, caller } = props;

		const decryptionKey = key || (await getDecryptionKey(caller));
		console.log('🚀 ~ decryptionKey:', decryptionKey);
		if (!decryptionKey) return null;

		return AES.decrypt(value, decryptionKey).toString(enc.Utf8);
	} catch (error) {
		console.error(props.caller, error);
		return null;
	}
};
