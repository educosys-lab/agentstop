'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

type ModalContextType = {
	activeModals: string[];
	openModal: (modalId: string, onOpen?: () => void) => void;
	closeModal: (modalId?: string, onClose?: () => void) => void;
	getModalIndex: (modalId: string) => number;
};

const ModalContext = createContext<ModalContextType>({
	activeModals: [],
	openModal: () => {},
	closeModal: () => {},
	getModalIndex: () => -1,
});

export const ModalProvider = ({ children }: { children: ReactNode }) => {
	const [activeModals, setActiveModals] = useState<string[]>([]);

	const openModal = (modalId: string, onOpen?: () => void) => {
		if (activeModals.includes(modalId)) {
			const modalsWithoutCurrent = activeModals.filter((id) => id !== modalId);
			setActiveModals([...modalsWithoutCurrent, modalId]);
		} else {
			setActiveModals((prev) => [...prev, modalId]);
		}
		onOpen && onOpen();
	};

	const closeModal = (modalId?: string, onClose?: () => void) => {
		onClose && onClose();
		modalId ? setActiveModals((prev) => prev.filter((id) => id !== modalId)) : setActiveModals([]);
	};

	const getModalIndex = (modalId: string) => activeModals.indexOf(modalId);

	return (
		<ModalContext.Provider value={{ activeModals, openModal, closeModal, getModalIndex }}>
			{children}
		</ModalContext.Provider>
	);
};

export const useModal = () => {
	const context = useContext(ModalContext);
	if (!context) throw new Error('useModal must be used within a ModalProvider!');
	return context;
};
