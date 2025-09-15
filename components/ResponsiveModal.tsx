"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { useEffect, useState } from "react";

interface ResponsiveModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
  hideCloseButton?: boolean;
}

export default function ResponsiveModal({
  isOpen,
  onOpenChange,
  title,
  children,
  footer,
  size = "md",
  hideCloseButton = false,
}: ResponsiveModalProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobileScreen = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobileScreen();
    window.addEventListener("resize", checkMobileScreen);

    return () => {
      window.removeEventListener("resize", checkMobileScreen);
    };
  }, []);

  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => onOpenChange(false)} />
        )}
        <div
          className={`fixed bottom-0 left-0 right-0 z-50 bg-[#1E1E1E] rounded-t-2xl transform transition-transform duration-300 ${
            isOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="flex flex-col max-h-[80vh]">
            {title && (
              <div className="flex items-center justify-between p-4 border-b border-[#383838]">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                {!hideCloseButton && (
                  <button
                    onClick={() => onOpenChange(false)}
                    className="text-[#909090] hover:text-white transition-colors"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M18 6L6 18M6 6l12 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}
            <div className="flex-1 overflow-auto p-4">
              {children}
            </div>
            {footer && (
              <div className="p-4 border-t border-[#383838]">
                {footer}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      size={size}
      hideCloseButton={hideCloseButton}
      classNames={{
        backdrop: "bg-black/50",
        base: "bg-[#1E1E1E] border border-[#383838]",
        header: "border-b border-[#383838]",
        footer: "border-t border-[#383838]",
        closeButton: "hover:bg-[#383838]"
      }}
    >
      <ModalContent>
        {() => (
          <>
            {title && <ModalHeader className="text-white">{title}</ModalHeader>}
            <ModalBody className="text-white">
              {children}
            </ModalBody>
            {footer && <ModalFooter>{footer}</ModalFooter>}
          </>
        )}
      </ModalContent>
    </Modal>
  );
}