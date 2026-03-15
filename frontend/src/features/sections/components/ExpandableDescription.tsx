import React from "react";
import { AnimatePresence, motion } from "framer-motion";

type InlineExpandableTextProps = {
  value: string;
  description: string;
  defaultOpen?: boolean;
  valueClassName?: string;
  descriptionClassName?: string;
  wrapperClassName?: string;
};

export function InlineExpandableText({
  value,
  description,
  defaultOpen = false,
  valueClassName = "",
  descriptionClassName = "",
  wrapperClassName = "",
}: InlineExpandableTextProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className={wrapperClassName}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 text-left"
      >

        <motion.span
          animate={{ rotate: open ? 180 : 90 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="inline-flex shrink-0 text-[14px] text-zinc-800"
          aria-hidden="true"
        >
          ^
        </motion.span>
        <span className={valueClassName}>{value}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="description"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className={descriptionClassName}>{description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}