"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from "@heroui/react";

function useIsMobile(query = "(max-width: 768px)") {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile("matches" in e ? e.matches : (e as MediaQueryList).matches);
    handler(mql);
    if ("addEventListener" in mql)
      mql.addEventListener("change", handler as any);
    else (mql as any).addListener(handler);
    return () => {
      if ("removeEventListener" in mql)
        mql.removeEventListener("change", handler as any);
      else (mql as any).removeListener(handler);
    };
  }, [query]);
  return isMobile;
}

export type ResponsiveDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  /** 右上角自定义关闭按钮（不传则用默认的 X） */
  closeButton?: React.ReactNode;
  /** 最⼤高度（默认 70vh） */
  maxVH?: number; // e.g. 70
  /** 可覆写样式 */
  classNames?: {
    content?: string;
    header?: string;
    body?: string;
  };
  /** PC 弹窗的 width 尺寸（不影响移动端） */
  size?:
  | "2xl"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full"
  | "xs"
  | "3xl"
  | "4xl"
  | "5xl"
  | "full";
};

export default function ResponsiveDialog({
  isOpen,
  onOpenChange,
  title,
  children,
  closeButton,
  maxVH = 70,
  classNames,
  size = "md",
}: ResponsiveDialogProps) {
  const isMobile = useIsMobile();
  const maxHeightStyle = { maxHeight: `${maxVH}vh` };

  const DefaultClose = !closeButton && (
    <button
      type="button"
      aria-label="close"
      onClick={() => onOpenChange(false)}
      className="absolute grid w-8 h-8 rounded-[0px] cursor-pointer right-3 top-3 place-items-center"
    >
      <CloseIcon />
    </button>
  );

  if (isMobile) {
    return (
      <Drawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="bottom"
        hideCloseButton
        isDismissable={false}
        classNames={{ backdrop: "bg-black/60" }}
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: { type: "spring", damping: 25, stiffness: 300 },
            },
            exit: { y: 40, opacity: 0, transition: { duration: 0.18 } },
          },
        }}
      >
        <DrawerContent
          className={[
            "bg-[#1E1946] text-foreground rounded-t-[12px]",
            classNames?.content || "",
          ].join(" ")}
          style={maxHeightStyle}
        >
          <DrawerHeader
            className={[
              "relative px-4 pt-4 pb-2 flex justify-center items-center",
              classNames?.header || "",
            ].join(" ")}
          >
            <div className="text-[16px] text-[#fff] font-normal text-center">
              {title}
            </div>
            {DefaultClose}
          </DrawerHeader>

          <DrawerBody
            className={["px-4 pb-4 overflow-auto", classNames?.body || ""].join(
              " "
            )}
            style={{ ...maxHeightStyle }}
          >
            {children}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      size={size}
      hideCloseButton
      isDismissable={false}
      classNames={{ backdrop: "bg-black/60" }}
    >
      <ModalContent
        className={[
          "bg-[#1E1946] text-foreground rounded-[12px]",
          classNames?.content || "",
        ].join(" ")}
        // 让整个内容体受最大高度限制
        style={maxHeightStyle}
      >
        <ModalHeader
          className={[
            "relative flex justify-center items-center px-[16px]",
            classNames?.header || "",
          ].join(" ")}
        >
          <div className="text-[16px] text-[#FFF] font-normal text-center">
            {title}
          </div>
          {DefaultClose}
        </ModalHeader>

        <ModalBody
          className={["px-[16px] overflow-auto", classNames?.body || ""].join(
            " "
          )}
          style={maxHeightStyle}
        >
          {children}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
    <rect x="1.55029" y="0.843262" width="15" height="1" transform="rotate(45 1.55029 0.843262)" fill="#FFF" />
    <rect x="11.4497" y="0.843262" width="1" height="15" transform="rotate(45 11.4497 0.843262)" fill="#FFF" />
  </svg>
);
